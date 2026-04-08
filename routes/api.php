<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\VapiWebhookController;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Http\Controllers\API\RoomController;
use App\Http\Controllers\API\AutomationsApiController;
use App\Http\Controllers\API\AutomationsSheetController;
use App\Http\Controllers\API\TeamMemberController;
use App\Http\Controllers\API\ChatController;
use App\Http\Controllers\API\WebhookController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\AnalyticsController;

if (!function_exists('yesAuraFlattenFirebaseChats')) {
    /**
     * Normalize Firebase chat payloads so the rest of the codebase can work with a flat list
     * regardless of whether chats live at /chats/{id} or /chats/{lineUuid}/{recordKey}.
     */
    function yesAuraFlattenFirebaseChats(array $rawChats): array
    {
        $flattened = [];

        foreach ($rawChats as $topKey => $value) {
            if (!is_array($value)) {
                continue;
            }

            $looksLikeChat = array_key_exists('lineUuid', $value)
                || array_key_exists('userInput', $value)
                || array_key_exists('aiResponse', $value)
                || array_key_exists('messageId', $value);

            // Legacy flat schema where /chats.json already contains individual messages
            if ($looksLikeChat) {
                $chat = $value;

                if (!isset($chat['lineUuid']) && isset($chat['line_uuid'])) {
                    $chat['lineUuid'] = $chat['line_uuid'];
                }

                if (!isset($chat['chatSequence']) && is_numeric($topKey)) {
                    $chat['chatSequence'] = (int) $topKey;
                }

                $chat['_firebaseKey'] = (string) $topKey;
                $chat['_conversationKey'] = (string) $topKey;

                $platformMeta = yesAuraDetectPlatformMeta($chat);
                $chat['platformChannel'] = $platformMeta['channel'];
                $chat['platformUserId'] = (string) ($platformMeta['platform_user_id'] ?? '');

                // For Meta, unify lineUuid as the prefixed platformUserId
                if ($chat['platformChannel'] !== 'line' && $chat['platformUserId'] !== '') {
                    $chat['lineUuid'] = $chat['platformUserId'];
                }

                if (empty($chat['messageChannel'])) {
                    $chat['messageChannel'] = $chat['platformChannel'];
                }

                $flattened[] = $chat;
                continue;
            }

            // Nested schema: /chats/{lineUuid}/{recordKey}
            foreach ($value as $childKey => $childValue) {
                if (!is_array($childValue)) {
                    continue;
                }

                $chat = $childValue;
                $chat['_conversationKey'] = (string) $topKey;

                if (empty($chat['lineUuid'])) {
                    $chat['lineUuid'] = $topKey;
                }

                if (!isset($chat['chatSequence'])) {
                    if (isset($childValue['chatSequence'])) {
                        $chat['chatSequence'] = (int) $childValue['chatSequence'];
                    } elseif (is_numeric($childKey)) {
                        $chat['chatSequence'] = (int) $childKey;
                    }
                }

                if (empty($chat['_firebaseKey'])) {
                    $chat['_firebaseKey'] = $topKey . '/' . $childKey;
                }

                $platformMeta = yesAuraDetectPlatformMeta($chat);
                $chat['platformChannel'] = $platformMeta['channel'];
                $chat['platformUserId'] = (string) ($platformMeta['platform_user_id'] ?? '');

                // For Meta, unify lineUuid as the prefixed platformUserId
                if ($chat['platformChannel'] !== 'line' && $chat['platformUserId'] !== '') {
                    $chat['lineUuid'] = $chat['platformUserId'];
                }

                if (empty($chat['messageChannel'])) {
                    $chat['messageChannel'] = $chat['platformChannel'];
                }

                $flattened[] = $chat;
            }
        }

        return $flattened;
    }
}

if (!function_exists('yesAuraGetChatTimeValue')) {
    function yesAuraGetChatTimeValue(array $chat): int
    {
        $raw = $chat['timestamp'] ?? $chat['date'] ?? null;

        if ($raw === null) {
            return 0;
        }

        if (is_numeric($raw)) {
            return (int) $raw;
        }

        $parsed = strtotime($raw);
        return $parsed !== false ? $parsed : 0;
    }
}

if (!function_exists('yesAuraGetChatUnixSeconds')) {
    function yesAuraGetChatUnixSeconds(array $chat): int
    {
        if (isset($chat['timestamp']) && is_numeric($chat['timestamp'])) {
            $ts = (int) $chat['timestamp'];
            return $ts > 9999999999 ? (int) floor($ts / 1000) : $ts;
        }

        if (!empty($chat['date'])) {
            $parsed = strtotime($chat['date']);
            return $parsed !== false ? $parsed : 0;
        }

        return 0;
    }
}

if (!function_exists('yesAuraIsUnreadMode')) {
    function yesAuraIsUnreadMode(?string $chatMode): bool
    {
        return ($chatMode ?? '') !== 'Resolved';
    }
}

if (!function_exists('yesAuraGuessChannelFromString')) {
    function yesAuraGuessChannelFromString(?string $value): ?string
    {
        $normalized = strtolower(trim((string) $value));
        if ($normalized === '') {
            return null;
        }

        if (str_starts_with($normalized, 'fb') || str_contains($normalized, 'facebook')) {
            return 'facebook';
        }

        if (str_starts_with($normalized, 'ig') || str_contains($normalized, 'instagram')) {
            return 'instagram';
        }

        if (preg_match('/^\d{10,}$/', $normalized)) {
            return 'facebook'; // Default to Facebook for numeric Meta-like IDs
        }

        return null;
    }
}

if (!function_exists('yesAuraNormalizePlatformId')) {
    function yesAuraNormalizePlatformId(string $channel, string $raw): string
    {
        $upper = strtoupper(trim($raw));
        if ($upper === '') {
            return '';
        }

        // Strip existing prefixes if present
        if (str_starts_with($upper, 'FB_')) {
            return substr($upper, 3);
        }
        if (str_starts_with($upper, 'IG_')) {
            return substr($upper, 3);
        }

        // Extract numeric part or clean the string
        if (preg_match('/(\d{5,})/', $upper, $matches)) {
            return $matches[1];
        }

        return preg_replace('/[^0-9A-Z]/', '', $upper);
    }
}

if (!function_exists('yesAuraDetectPlatformMeta')) {
    /**
     * Determine chat platform (line/facebook/instagram/...) and a normalized user id for Meta lookups.
     */
    function yesAuraDetectPlatformMeta(array $chat): array
    {
        $rawChannel = strtolower((string)($chat['platformChannel'] ?? $chat['platform_channel'] ?? $chat['messageChannel'] ?? $chat['message_channel'] ?? ''));
        $lineUuid = (string)($chat['lineUuid'] ?? $chat['line_uuid'] ?? '');
        $conversationKey = (string)($chat['_conversationKey'] ?? '');

        $channel = 'line';
        if (in_array($rawChannel, ['fb', 'facebook', 'messenger'], true)) {
            $channel = 'facebook';
        } elseif (in_array($rawChannel, ['ig', 'instagram'], true)) {
            $channel = 'instagram';
        }

        if ($channel === 'line') {
            $conversationGuess = yesAuraGuessChannelFromString($conversationKey);
            if ($conversationGuess) {
                $channel = $conversationGuess;
            }
        }

        $lineUuidLower = strtolower($lineUuid);
        if ($channel === 'line' && $lineUuidLower !== '') {
            if (str_contains($lineUuidLower, 'facebook') || str_starts_with($lineUuidLower, 'fb_') || str_starts_with($lineUuidLower, 'fb')) {
                $channel = 'facebook';
            } elseif (str_contains($lineUuidLower, 'instagram') || str_starts_with($lineUuidLower, 'ig_') || str_starts_with($lineUuidLower, 'ig')) {
                $channel = 'instagram';
            } elseif (preg_match('/^\d{10,}$/', $lineUuidLower)) {
                $channel = 'facebook';
            }
        }

        $platformUserId = '';
        $candidates = [
            $chat['platformUserId'] ?? null,
            $chat['platform_user_id'] ?? null,
            $conversationKey,
            $lineUuid,
        ];

        foreach ($candidates as $candidateRaw) {
            $candidateRaw = (string) $candidateRaw;
            if (trim($candidateRaw) === '') {
                continue;
            }

            $guess = yesAuraGuessChannelFromString($candidateRaw);
            if ($guess && $channel === 'line') {
                $channel = $guess;
            }

            $platformUserId = yesAuraNormalizePlatformId($channel, $candidateRaw);
            if ($platformUserId !== '') {
                break;
            }
        }

        if ($platformUserId === '') {
            $platformUserId = yesAuraNormalizePlatformId($channel, $lineUuid ?: $conversationKey);
        }

        return [
            'channel' => $channel,
            'platform_user_id' => $platformUserId,
        ];
    }
}

 

// Meta (Facebook/Instagram) webhook - mimic LINE behavior: verify and store inbound messages to Firebase
Route::match(['GET', 'POST'], '/meta/webhook', function (Request $request) {
    try {
        // Handle verification (GET)
        if ($request->isMethod('get')) {
            $mode = $request->query('hub_mode') ?? $request->query('hub.mode');
            $token = $request->query('hub_verify_token') ?? $request->query('hub.verify_token');
            $challenge = $request->query('hub_challenge') ?? $request->query('hub.challenge');

            $verifyToken = env('META_WEBHOOK_VERIFY_TOKEN');

            if ($mode === 'subscribe' && (!$verifyToken || $token === $verifyToken)) {
                return response((string) $challenge, 200)->header('Content-Type', 'text/plain');
            }
            return response('Forbidden', 403);
        }

        // POST: receive events
        $payload = $request->all();
        Log::info('META webhook payload received', [
            'object' => $payload['object'] ?? null,
            'has_entry' => isset($payload['entry']),
        ]);

        $evante = app(\App\Services\EvanteApiService::class);

        // Helper to compute next chatSequence via Evante API
        $computeNextChatSequence = function (string $lineUuid, string $platformUserId = '') use ($evante) {
            $key = $lineUuid ?: $platformUserId;
            if ($key === '') {
                return 1;
            }
            $result = $evante->getNextChatSequence($key);
            return (int) ($result['chatSequence'] ?? 1);
        };

        $object = strtolower((string) ($payload['object'] ?? ''));
        $channel = ($object === 'instagram') ? 'instagram' : 'facebook';

        $stored = [];

        foreach ((array) ($payload['entry'] ?? []) as $entry) {
            // Prefer Messenger-style events
            foreach ((array) ($entry['messaging'] ?? []) as $event) {
                try {
                    $senderId = (string) ($event['sender']['id'] ?? '');
                    if ($senderId === '') { continue; }

                    // Skip page echo messages (messages our page sent)
                    if (!empty($event['message']['is_echo'])) {
                        continue;
                    }

                    $tsMs = (int) ($event['timestamp'] ?? round(microtime(true) * 1000));
                    $text = (string) ($event['message']['text'] ?? '');
                    $mid = (string) ($event['message']['mid'] ?? '');
                    $attachments = (array) ($event['message']['attachments'] ?? []);

                    $platformUserId = yesAuraNormalizePlatformId($channel, $senderId);
                    $lineUuid = $senderId; // keep raw sender id as conversation key as well

                    // Build base message
                    $linkImage = '';
                    if (!$text && $attachments) {
                        foreach ($attachments as $att) {
                            $type = strtolower((string) ($att['type'] ?? ''));
                            $url = (string) ($att['payload']['url'] ?? '');
                            if ($type === 'image' && $url !== '') {
                                $linkImage = $url;
                                break;
                            }
                        }
                    }

                    $chatSequence = $computeNextChatSequence($lineUuid, $platformUserId);

                    $chatMessage = [
                        'lineUuid'       => $lineUuid,
                        'chatSequence'   => $chatSequence,
                        'userInput'      => $text,
                        'aiResponse'     => '',
                        'time'           => date('c', (int) floor($tsMs / 1000)),
                        'linkImage'      => $linkImage,
                        'chatMode'       => 'Waiting response',
                        'aiRead'         => 'FALSE',
                        'messageChannel' => ucfirst($channel),
                        'displayName'    => $channel === 'instagram' ? 'IG User' : 'FB User',
                        'messageId'      => $mid,
                        'timestamp'      => $tsMs,
                        'source'         => 'META_WEBHOOK',
                        'platformUserId' => $platformUserId,
                        'platformChannel' => $channel,
                    ];

                    $resp = $evante->postMessage($chatMessage);

                    if ($resp['success'] ?? false) {
                        $stored[] = ['lineUuid' => $lineUuid, 'chatSequence' => $chatSequence];
                    } else {
                        Log::warning('META webhook: Evante write failed', ['error' => $resp['error'] ?? '']);
                    }
                } catch (\Throwable $e) {
                    Log::error('META webhook: failed to process messaging event', ['error' => $e->getMessage()]);
                }
            }

            // Handover Protocol: if our app is secondary, events arrive under 'standby'
            foreach ((array) ($entry['standby'] ?? []) as $event) {
                try {
                    $senderId = (string) ($event['sender']['id'] ?? '');
                    if ($senderId === '') { continue; }

                    if (!empty($event['message']['is_echo'])) {
                        continue;
                    }

                    $tsMs        = (int) ($event['timestamp'] ?? round(microtime(true) * 1000));
                    $text        = (string) ($event['message']['text'] ?? '');
                    $mid         = (string) ($event['message']['mid'] ?? '');
                    $attachments = (array) ($event['message']['attachments'] ?? []);

                    $platformUserId = yesAuraNormalizePlatformId('facebook', $senderId);
                    $lineUuid       = $senderId;

                    $linkImage = '';
                    if (!$text && $attachments) {
                        foreach ($attachments as $att) {
                            $type = strtolower((string) ($att['type'] ?? ''));
                            $url  = (string) ($att['payload']['url'] ?? '');
                            if ($type === 'image' && $url !== '') { $linkImage = $url; break; }
                        }
                    }

                    $chatSequence = $computeNextChatSequence($lineUuid, $platformUserId);

                    $chatMessage = [
                        'lineUuid'       => $lineUuid,
                        'chatSequence'   => $chatSequence,
                        'userInput'      => $text,
                        'aiResponse'     => '',
                        'time'           => date('c', (int) floor($tsMs / 1000)),
                        'linkImage'      => $linkImage,
                        'chatMode'       => 'Waiting response',
                        'aiRead'         => 'FALSE',
                        'messageChannel' => 'Facebook',
                        'displayName'    => 'FB User',
                        'messageId'      => $mid,
                        'timestamp'      => $tsMs,
                        'source'         => 'META_WEBHOOK_STANDBY',
                        'platformUserId' => $platformUserId,
                        'platformChannel' => 'facebook',
                    ];

                    $resp = $evante->postMessage($chatMessage);
                    if ($resp['success'] ?? false) {
                        $stored[] = ['lineUuid' => $lineUuid, 'chatSequence' => $chatSequence];
                    }
                } catch (\Throwable $e) {
                    Log::error('META webhook: failed to process standby event', ['error' => $e->getMessage()]);
                }
            }

            // Instagram and sometimes Facebook deliver under entry.changes
            foreach ((array) ($entry['changes'] ?? []) as $change) {
                try {
                    $val      = $change['value'] ?? [];
                    $senderId = (string) ($val['from']['id'] ?? $val['sender']['id'] ?? '');
                    $mid      = (string) ($val['id'] ?? '');
                    $text     = (string) ($val['text'] ?? $val['message'] ?? '');
                    $tsMs     = (int) ($val['timestamp'] ?? round(microtime(true) * 1000));
                    if ($senderId === '' || ($text === '' && empty($val['attachments']))) { continue; }

                    $platformUserId = yesAuraNormalizePlatformId($channel, $senderId);
                    $lineUuid       = $senderId;
                    $linkImage      = '';

                    foreach ((array) ($val['attachments'] ?? []) as $att) {
                        $url = (string) ($att['url'] ?? $att['image_url'] ?? '');
                        if ($url) { $linkImage = $url; break; }
                    }

                    $chatSequence = $computeNextChatSequence($lineUuid, $platformUserId);

                    $chatMessage = [
                        'lineUuid'       => $lineUuid,
                        'chatSequence'   => $chatSequence,
                        'userInput'      => $text,
                        'aiResponse'     => '',
                        'time'           => date('c', (int) floor($tsMs / 1000)),
                        'linkImage'      => $linkImage,
                        'chatMode'       => 'Waiting response',
                        'aiRead'         => 'FALSE',
                        'messageChannel' => ucfirst($channel),
                        'displayName'    => $channel === 'instagram' ? 'IG User' : 'FB User',
                        'messageId'      => $mid,
                        'timestamp'      => $tsMs,
                        'source'         => 'META_WEBHOOK',
                        'platformUserId' => $platformUserId,
                        'platformChannel' => $channel,
                    ];

                    $resp = $evante->postMessage($chatMessage);
                    if ($resp['success'] ?? false) {
                        $stored[] = ['lineUuid' => $lineUuid, 'chatSequence' => $chatSequence];
                    }
                } catch (\Throwable $e) {
                    Log::error('META webhook: failed to process change event', ['error' => $e->getMessage()]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'stored' => $stored,
        ]);
    } catch (\Throwable $e) {
        Log::error('META webhook endpoint error', ['error' => $e->getMessage()]);
        return response()->json([
            'success' => false,
            'error' => 'META webhook failed',
            'message' => $e->getMessage(),
        ], 500);
    }
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/rooms/by-branch/{branchId}', [RoomController::class, 'getRoomsByBranch']);
Route::get('/rooms/available', [RoomController::class, 'getAvailableRooms']);

// Team members
Route::get('/team-members', [TeamMemberController::class, 'index']);

// Public chat assignment route
Route::get('/all-assignments', [ChatController::class, 'getAllAssignments']);

// Webhook routes (for n8n integration)
Route::post('/webhook/unread-chat', [WebhookController::class, 'handleUnreadChat']);
Route::get('/notifications/pending', [WebhookController::class, 'getPendingNotifications']);
Route::post('/notifications/{assignmentId}/sent', [WebhookController::class, 'markNotificationSent']);

// Proxy routes to call n8n workflows from backend (avoid browser CORS issues)
Route::post('/n8n/message-history', function (Request $request) {
    $webhookUrl = config('services.n8n.message_history_url');

    if (!$webhookUrl) {
        return response()->json([
            'success' => false,
            'error' => 'N8N_MESSAGE_HISTORY_URL is not configured',
        ], 501);
    }

    try {
        $response = Http::timeout(10)
            ->withHeaders(['X-Requested-By' => 'yesai-backoffice'])
            ->asJson()
            ->post($webhookUrl, $request->all());

        return response()->json([
            'success' => $response->successful(),
            'status' => $response->status(),
            'body' => rescue(fn () => $response->json(), null, false),
        ], $response->status());
    } catch (\Throwable $e) {
        Log::warning('Failed to call n8n message-history webhook', [
            'error' => $e->getMessage(),
        ]);

        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
        ], 500);
    }
});

Route::post('/n8n/unread-tracking', function (Request $request) {
    $webhookUrl = config('services.n8n.unread_tracking_url');

    if (!$webhookUrl) {
        return response()->json(['success' => true], 200);
    }

    try {
        $payload = $request->all();

        // Filter out label management events early
        if (isset($payload['event_type']) && in_array($payload['event_type'], ['add', 'remove'])) {
            Log::info('Blocked label management event from reaching n8n', [
                'event_type' => $payload['event_type'],
                'lineUuid' => $payload['lineUuid'] ?? '',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Label management events filtered out',
                'blocked' => true
            ]);
        }

        // Deduplication check: create unique key for this webhook call
        $lineUuid = $payload['lineUuid'] ?? '';
        $messageId = $payload['messageId'] ?? '';
        $userInput = $payload['userInput'] ?? '';
        $timestamp = $payload['timestamp'] ?? now()->toISOString();
        $action = $payload['action'] ?? '';
        $chatSequence = $payload['chatSequence'] ?? '';

        // Create more aggressive dedup key
        $messageContent = substr($userInput, 0, 50); // First 50 chars of message
        $timeWindow = floor(time() / 30); // 30-second windows (more aggressive)

        // Use multiple dedup keys for different scenarios
        $keys = [];
        if ($messageId) {
            $keys[] = md5($messageId . '-' . $action);
        }
        $keys[] = md5($lineUuid . '-' . $messageContent . '-' . $action . '-' . $timeWindow);
        $keys[] = md5($lineUuid . '-' . $chatSequence . '-' . $action . '-' . $timeWindow);

        $isDuplicate = false;
        foreach ($keys as $key) {
            $cacheKey = 'webhook_dedup_' . $key;
            if (Cache::has($cacheKey)) {
                $isDuplicate = true;
                break;
            }
        }

        // Check if this exact webhook was already sent in the current window
        if ($isDuplicate) {
            Log::info('Duplicate n8n webhook prevented', [
                'lineUuid' => $lineUuid,
                'messageId' => $messageId,
                'messageContent' => $messageContent,
                'timeWindow' => $timeWindow,
                'action' => $action
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Duplicate webhook prevented',
                'blocked' => true
            ]);
        }

        // Mark this webhook as processed using all dedup keys (2 minutes to be more aggressive)
        foreach ($keys as $key) {
            $cacheKey = 'webhook_dedup_' . $key;
            Cache::put($cacheKey, true, now()->addMinutes(2));
        }

        // Ensure unreadChat stays string to match legacy workflows
        if (isset($payload['unreadChat'])) {
            $payload['unreadChat'] = (string) $payload['unreadChat'];
        } elseif (isset($payload['unreadCount'])) {
            $payload['unreadChat'] = (string) $payload['unreadCount'];
        }

        $response = Http::timeout(10)
            ->withHeaders(['X-Requested-By' => 'yesai-backoffice'])
            ->asJson()
            ->post($webhookUrl, $payload);

        Log::info('n8n webhook sent successfully', [
            'lineUuid'      => $lineUuid,
            'messageId'     => $messageId,
            'userAgent'     => $request->header('User-Agent'),
            'requestSource' => $request->header('X-Requested-By'),
            'referer'       => $request->header('Referer'),
            'success'       => $response->successful(),
        ]);

        return response()->json([
            'success' => $response->successful(),
            'status'  => $response->status(),
            'body'    => rescue(fn () => $response->json(), null, false),
        ], $response->status());
    } catch (\Throwable $e) {
        Log::warning('Failed to call n8n unread-tracking webhook', [
            'error' => $e->getMessage(),
        ]);

        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
        ], 500);
    }
});

// Public chat assignment lookup (for webhook purposes)
Route::get('/chat-assignment/{lineUuid}', [ChatController::class, 'getChatAssignment']);

// Debug endpoint to check all assignments
Route::get('/debug/all-assignments', function () {
    try {
        $assignments = DB::table('chat_assignments')
            ->join('users', 'chat_assignments.user_id', '=', 'users.id')
            ->select('chat_assignments.*', 'users.name as assigned_user_name', 'users.user_type')
            ->get();

        return response()->json([
            'count' => $assignments->count(),
            'assignments' => $assignments
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
});

// Chat assignments (requires authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/assign-chat', [ChatController::class, 'assignChat']);
    Route::post('/unassign-chat', [ChatController::class, 'unassignChat']);
    Route::get('/my-assignments', [ChatController::class, 'getMyAssignments']);
    Route::get('/conversations', [ChatController::class, 'getConversations']);
});

// User info
Route::get('/user', function (Request $request) {
    return $request->user();
});

// Automations API - Register routes directly without grouping
Route::get('/automations', [AutomationsApiController::class, 'index']);
Route::post('/automations', [AutomationsApiController::class, 'store']);
Route::get('/automations/{id}', [AutomationsApiController::class, 'show']);
Route::put('/automations/{id}', [AutomationsApiController::class, 'update']);
Route::delete('/automations/{id}', [AutomationsApiController::class, 'destroy']);
Route::patch('/automations/{id}/status', [AutomationsApiController::class, 'updateStatus']);
Route::patch('/automations/{id}/mode', [AutomationsApiController::class, 'updateMode']);

// Automations Sheet API
Route::get('/automations-sheet/check', function() {
    $controller = new \App\Http\Controllers\API\AutomationsSheetController();
    return $controller->check(request());
})->name('api.automations-sheet.check');

// NOTE: LINE webhook now handled by /webhook.php (standalone file)
// This avoids Laravel CSRF issues and provides better performance

// Send message to LINE user via LINE API
Route::post('/send-line-message', function (\Illuminate\Http\Request $request) {
    try {
        $lineUuid = $request->input('lineUuid');
        $message = $request->input('message');
        
        if (!$lineUuid || !$message) {
            return response()->json([
                'success' => false,
                'error' => 'lineUuid and message are required'
            ], 400);
        }
        
        $lineToken = env('LINE_CHANNEL_ACCESS_TOKEN');
        if (!$lineToken) {
            return response()->json([
                'success' => false,
                'error' => 'LINE_CHANNEL_ACCESS_TOKEN not configured'
            ], 500);
        }
        
        // Send message via LINE API
        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'Authorization' => 'Bearer ' . $lineToken,
            'Content-Type' => 'application/json'
        ])->post('https://api.line.me/v2/bot/message/push', [
            'to' => $lineUuid,
            'messages' => [
                [
                    'type' => 'text',
                    'text' => $message
                ]
            ]
        ]);
        
        if ($response->successful()) {
            \Illuminate\Support\Facades\Log::info('Message sent to LINE user successfully', [
                'lineUuid' => $lineUuid,
                'message' => $message
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Message sent to LINE user successfully'
            ]);
        } else {
            \Illuminate\Support\Facades\Log::error('Failed to send message to LINE user', [
                'lineUuid' => $lineUuid,
                'response' => $response->body(),
                'status' => $response->status()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to send message to LINE API',
                'details' => $response->body()
            ], $response->status());
        }
        
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Exception while sending LINE message', [
            'error' => $e->getMessage(),
            'lineUuid' => $request->input('lineUuid')
        ]);
        
        return response()->json([
            'success' => false,
            'error' => 'Internal server error: ' . $e->getMessage()
        ], 500);
    }
});

// Admin send message → evante API storage (no CSRF needed, called from JS fetch with CSRF header)
Route::post('/admin-send-message', function (\Illuminate\Http\Request $request) {
    try {
        $evante = app(\App\Services\EvanteApiService::class);

        $data = [
            'lineUuid'        => (string) $request->input('lineUuid', ''),
            'chatSequence'    => $request->input('chatSequence', 1),
            'userInput'       => (string) $request->input('userInput', ''),
            'aiResponse'      => (string) $request->input('aiResponse', $request->input('message', '')),
            'message'         => (string) $request->input('message', ''),
            'time'            => $request->input('date') ?? $request->input('time') ?? now()->toIso8601String(),
            'linkImage'       => (string) $request->input('linkImage', ''),
            'chatMode'        => (string) $request->input('chatMode', 'Manual Chat'),
            'aiRead'          => (string) $request->input('aiRead', 'FALSE'),
            'messageChannel'  => (string) $request->input('messageChannel', 'BackOffice'),
            'displayName'     => (string) $request->input('displayName', 'Admin'),
            'messageId'       => (string) $request->input('messageId', ''),
            'timestamp'       => $request->input('timestamp', now()->timestamp * 1000),
            'source'          => 'ADMIN_BACKOFFICE',
            'platformUserId'  => (string) $request->input('platformUserId', ''),
            'platformChannel' => (string) $request->input('platformChannel', ''),
        ];

        if ($data['lineUuid'] === '' || ($data['aiResponse'] === '' && $data['message'] === '')) {
            return response()->json(['success' => false, 'error' => 'lineUuid and message are required'], 400);
        }

        $result = $evante->postMessage($data);

        // Removed duplicate broadcast - Evante backend already broadcasts MessageSent when it saves the message

        return response()->json($result, $result['success'] ? 200 : 502);

    } catch (\Throwable $e) {
        \Illuminate\Support\Facades\Log::error('admin-send-message exception', ['error' => $e->getMessage()]);
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
});

// Test customer routes in api.php
Route::get('/test-customer', function() {
    return response()->json(['message' => 'Customer API routes working from api.php']);
});

Route::post('/customer-test/save', [CustomerController::class, 'saveCustomerInfo']);

// === Moved from web.php for better API organization ===

// Message backup endpoint (delegates to EvanteApiService via GoogleSheetsService)
Route::post('/backup-to-sheets', function (Request $request) {
    try {
        $data = $request->all();

        if (empty($data['lineUuid']) || empty($data['chatSequence'])) {
            return response()->json(['success' => false, 'message' => 'Missing required fields'], 400);
        }

        $sheetsService = app(\App\Services\GoogleSheetsService::class);

        if (!empty($data['messageId']) && $sheetsService->messageExists($data['messageId'], 'Sheet2')) {
            \Log::info('Backup skipped (duplicate message)', [
                'lineUuid'     => $data['lineUuid'],
                'chatSequence' => $data['chatSequence'],
                'messageId'    => $data['messageId'],
            ]);
            return response()->json(['success' => true, 'message' => 'Already backed up']);
        }

        $result = $sheetsService->backupMessage($data, 'Sheet2');

        if ($result['success'] ?? false) {
            \Log::info('Backup successful', ['lineUuid' => $data['lineUuid'], 'chatSequence' => $data['chatSequence']]);
            return response()->json(['success' => true, 'message' => 'Backed up']);
        }

        \Log::warning('Backup failed: ' . ($result['error'] ?? 'unknown error'));
        return response()->json(['success' => false, 'message' => 'Backup failed'], 200);

    } catch (\Exception $e) {
        \Log::warning('Backup exception: ' . $e->getMessage());
        return response()->json(['success' => false, 'message' => 'Backup failed'], 200);
    }
});

// Get next chatSequence for a lineUuid
Route::get('/next-chat-sequence/{lineUuid}', function ($lineUuid) {
    $result = app(\App\Services\EvanteApiService::class)->getNextChatSequence($lineUuid);

    return response()->json([
        'success'      => true,
        'chatSequence' => $result['chatSequence'] ?? 1,
        'source'       => 'evante_api',
    ]);
});

// Test API connection
Route::get('/test-sheets', function () {
    try {
        $sheetsService = app(\App\Services\GoogleSheetsService::class);
        return response()->json(['success' => true, 'sheets' => $sheetsService->getSheetNames()['sheets']]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()]);
    }
});

// Get users data
Route::get('/users', function () {
    return \App\Models\User::select('id', 'name', 'role', 'profile_image')->get();
});

// Get unread chat count
Route::get('/get-unread-chat', function (Request $request) {
    $lineUuid = $request->query('lineUuid');
    $row = $request->query('row');
    $lastMessageId = $request->query('lastMessageId');

    if (!$lineUuid && !$row) {
        return response()->json(['error' => 'lineUuid or row parameter is required'], 400);
    }

    if ($row && !$lineUuid) {
        \Log::info('Row-based unread chat query not implemented', ['row' => $row]);
        return response()->json([
            'success' => true,
            'row' => $row,
            'columnM' => '',
            'unreadCount' => 0,
            'messages' => []
        ]);
    }

    try {
        $evante     = app(\App\Services\EvanteApiService::class);
        $msgResult  = $evante->getMessages($lineUuid);
        $lineChats  = $msgResult['data'] ?? [];
        $source     = 'evante_api';

        $recentThreshold = time() - (24 * 60 * 60);
        $unreadCount     = 0;
        $unreadMessages  = [];

        foreach ($lineChats as $chatMessage) {
            $hasUserMessage = !empty($chatMessage['userInput']);
            $hasAiResponse  = !empty($chatMessage['aiResponse']);
            $messageTime    = yesAuraGetChatUnixSeconds($chatMessage);

            if ($hasUserMessage && !$hasAiResponse &&
                $messageTime > $recentThreshold &&
                yesAuraIsUnreadMode($chatMessage['chatMode'] ?? null)) {
                $unreadCount++;
                $unreadMessages[] = [
                    'text'         => $chatMessage['userInput'],
                    'timestamp'    => $messageTime,
                    'chatSequence' => $chatMessage['chatSequence'] ?? '',
                ];
            }
        }

        $columnM = $unreadCount > 0 ? (string) $unreadCount : '';

        \Log::info('Evante-based unread count calculated', [
            'lineUuid'    => $lineUuid,
            'unreadCount' => $unreadCount,
            'source'      => $source,
        ]);

        return response()->json([
            'success'     => true,
            'lineUuid'    => $lineUuid,
            'columnM'     => $columnM,
            'unreadCount' => $unreadCount,
            'messages'    => $unreadMessages,
            'source'      => $source,
        ]);

    } catch (\Exception $e) {
        \Log::error('Error getting unread count: ' . $e->getMessage());
        return response()->json([
            'success'     => true,
            'lineUuid'    => $lineUuid,
            'columnM'     => '',
            'unreadCount' => 0,
            'source'      => 'fallback',
            'error'       => 'API connection failed',
        ]);
    }
});

// Trigger unread webhook
Route::post('/trigger-unread-webhook', function (Request $request) {
    try {
        $lineUuid = $request->input('lineUuid');
        $unreadCount = $request->input('unreadCount', 0);

        \Log::info('Unread webhook triggered', ['lineUuid' => $lineUuid, 'unreadCount' => $unreadCount]);

        // Trigger n8n workflow for external API calls
        $n8nUrl = config('services.n8n.unread_tracking_url');
        if ($n8nUrl) {
            try {
                $payload = [
                    'lineUuid' => $lineUuid,
                    'unreadChat' => (string) $unreadCount,
                    'action' => $unreadCount > 0 ? 'update_status' : 'clear_unread',
                    'timestamp' => now()->toIso8601String(),
                    'messageChannel' => 'Line',
                    'source' => 'external_api',
                    'assignedMember' => 'Unassigned',
                    'assignedMemberId' => '',
                    'customer_info' => [
                        'name' => $request->input('customerName', ''),
                        'phone' => $request->input('customerPhone', ''),
                        'email' => $request->input('customerEmail', ''),
                    ],
                    'userInput' => $request->input('message', ''),
                    'messageId' => $request->input('messageId', ''),
                    'chatSequence' => $request->input('chatSequence', ''),
                    'label' => $request->input('label', ''),
                    'note' => 'External API webhook trigger'
                ];

                Http::timeout(10)
                    ->withHeaders(['Content-Type' => 'application/json', 'X-Requested-By' => 'yesai-external-api'])
                    ->post($n8nUrl, $payload);

                \Log::info('Successfully triggered n8n workflow from external API', ['lineUuid' => $lineUuid]);
            } catch (\Exception $e) {
                \Log::warning('Failed to trigger n8n from external API: ' . $e->getMessage());
            }
        }

        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        \Log::error('Unread webhook failed: ' . $e->getMessage());
        return response()->json(['error' => 'Webhook failed'], 500);
    }
});

// Clear unread count
Route::post('/clear-unread', function (Request $request) {
    try {
        $lineUuid      = $request->input('lineUuid');
        $lastViewedTime = time() * 1000;

        app(\App\Services\EvanteApiService::class)->markConversationViewed($lineUuid);

        \Log::info('Conversation marked as viewed', ['lineUuid' => $lineUuid]);
        return response()->json(['success' => true, 'lastViewed' => $lastViewedTime]);
    } catch (\Exception $e) {
        \Log::error('Clear unread failed: ' . $e->getMessage());
        return response()->json(['error' => 'Failed to clear unread'], 500);
    }
});

// Legacy /line-to-firebase endpoint removed — now using MySQL via EvanteApiService

// Get LINE user profile
Route::get('/line-profile/{userId}', function ($userId) {
    try {
        $lineToken = env('LINE_CHANNEL_ACCESS_TOKEN');
        if (!$lineToken) {
            return response()->json(['error' => 'LINE token not configured'], 500);
        }

        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'Authorization' => 'Bearer ' . $lineToken
        ])->get("https://api.line.me/v2/bot/profile/{$userId}");

        if ($response->successful()) {
            return response()->json($response->json());
        } else {
            \Log::error('LINE profile fetch failed', ['userId' => $userId, 'response' => $response->body()]);
            return response()->json(['error' => 'Failed to fetch profile'], $response->status());
        }
    } catch (\Exception $e) {
        \Log::error('LINE profile exception: ' . $e->getMessage());
        return response()->json(['error' => 'Profile fetch failed'], 500);
    }
});

// Get conversations
Route::get('/line-conversations', function (\Illuminate\Http\Request $request) {
    try {
        $lineUuidFilter       = $request->query('lineUuid');
        $platformUserIdFilter = $request->query('platformUserId');
        $evante               = app(\App\Services\EvanteApiService::class);

        $conversations = [];

        if ($lineUuidFilter) {
            // Fetch messages for specific session
            $result     = $evante->getMessages($lineUuidFilter);
            $rawChats   = $result['data'] ?? [];
            $chatSource = 'evante_session';
        } else {
            // Fetch all chats
            $result     = $evante->getAllChats();
            $rawChats   = $result['data'] ?? [];
            $chatSource = 'evante_all';
        }

        $recentThreshold = time() - (24 * 60 * 60);

        // If filtering by lineUuid, return all messages for that session
        if ($lineUuidFilter || $platformUserIdFilter) {
            // Detect evante native format: messages have sender_type + content fields (no lineUuid)
            $isEvanteFormat = !empty($rawChats) && isset($rawChats[0]['sender_type']);

            foreach ($rawChats as $chat) {
                if ($isEvanteFormat) {
                    // Evante format: {id, session_id, sender_type, sender_name, content, metadata, timestamp}
                    $senderType = $chat['sender_type'] ?? 'user';
                    $isUser     = ($senderType === 'user');
                    $content    = $chat['content'] ?? '';
                    $timeField  = $chat['timestamp'] ?? '';

                    $conversations[] = [
                        'lineUuid'        => $lineUuidFilter ?? $platformUserIdFilter,
                        'chatSequence'    => (string) ($chat['id'] ?? ''),
                        'message'         => $isUser ? $content : '',
                        'aiResponse'      => !$isUser ? $content : '',
                        'time'            => $timeField,
                        'date'            => $timeField,
                        'timestamp'       => $timeField,
                        'linkImage'       => $chat['metadata']['image_url'] ?? ($chat['metadata']['link_image'] ?? ''),
                        'displayName'     => $chat['sender_name'] ?? ($isUser ? 'User' : 'Admin'),
                        'messageChannel'  => $isUser ? 'Line' : 'BackOffice',
                        'platformChannel' => 'web',
                        'chatMode'        => 'Active',
                        'assignTeam'      => '',
                        'unreadCount'     => 0,
                        'platformUserId'  => $lineUuidFilter ?? $platformUserIdFilter,
                    ];
                } else {
                    // Legacy format: {lineUuid, userInput, aiResponse, messageChannel, ...}
                    $chatLine    = (string) ($chat['lineUuid'] ?? '');
                    $fltLine     = (string) ($lineUuidFilter ?? '');
                    $fltPlatform = (string) ($platformUserIdFilter ?? '');

                    $matchesLine     = ($fltLine !== '') && ($chatLine === $fltLine);
                    $matchesPlatform = ($fltPlatform !== '') && ((string)($chat['platformUserId'] ?? '') === $fltPlatform);
                    if (!$matchesLine && !$matchesPlatform) {
                        continue;
                    }

                    $timeField       = $chat['time'] ?? $chat['date'] ?? $chat['timestamp'] ?? '';
                    $unreadCount     = (!empty($chat['userInput']) && empty($chat['aiResponse'])) ? 1 : 0;
                    $platformMeta    = yesAuraDetectPlatformMeta($chat);
                    $originalChannel = $chat['messageChannel'] ?? $chat['message_channel'] ?? $platformMeta['channel'];
                    $isBackoffice    = (strtolower($originalChannel) === 'backoffice');
                    $userText        = $chat['userInput'] ?? ($chat['message'] ?? '');
                    $aiText          = $chat['aiResponse'] ?? ($isBackoffice ? ($chat['message'] ?? '') : '');

                    $conversations[] = [
                        'lineUuid'        => $chatLine,
                        'chatSequence'    => $chat['chatSequence'] ?? '',
                        'message'         => $userText,
                        'aiResponse'      => $aiText,
                        'time'            => $timeField,
                        'date'            => $timeField,
                        'timestamp'       => $chat['timestamp'] ?? null,
                        'linkImage'       => $chat['linkImage'] ?? '',
                        'displayName'     => $chat['displayName'] ?? "Line User " . substr($chatLine, 1, 4),
                        'messageChannel'  => $originalChannel,
                        'platformChannel' => $platformMeta['channel'],
                        'chatMode'        => $chat['chatMode'] ?? 'Active',
                        'assignTeam'      => $chat['AssignTeam'] ?? $chat['assignTeam'] ?? '',
                        'unreadCount'     => $unreadCount,
                        'platformUserId'  => (string) ($platformMeta['platform_user_id'] ?? ''),
                    ];
                }
            }
        } else {
            // Build conversations from sessions data (evante returns one entry per session)
            foreach ($rawChats as $session) {
                // Support both evante sessions format and legacy lineUuid format
                $sessionToken = (string) ($session['session_token'] ?? $session['lineUuid'] ?? '');
                if ($sessionToken === '') {
                    continue;
                }

                $timeField   = $session['last_message_at'] ?? $session['timestamp'] ?? $session['date'] ?? $session['time'] ?? '';
                $channel     = $session['channel'] ?? $session['messageChannel'] ?? 'web';
                $handledBy   = $session['handled_by'] ?? 'ai';
                $chatMode    = ($handledBy === 'admin') ? 'Manual' : 'Active';
                $displayName = $session['customer_name'] ?? $session['displayName'] ?? 'User';
                $message     = $session['last_message'] ?? $session['message'] ?? $session['userInput'] ?? '';

                $conversations[] = [
                    'lineUuid'        => $sessionToken,
                    'chatSequence'    => (string) ($session['id'] ?? $session['chatSequence'] ?? ''),
                    'message'         => $message,
                    'aiResponse'      => '',
                    'time'            => $timeField,
                    'date'            => $timeField,
                    'timestamp'       => $timeField,
                    'linkImage'       => '',
                    'displayName'     => $displayName,
                    'messageChannel'  => $channel,
                    'platformChannel' => $channel,
                    'chatMode'        => $chatMode,
                    'assignTeam'      => $session['admin_name'] ?? $session['assignTeam'] ?? '',
                    'unreadCount'     => (int) ($session['unread'] ?? 0),
                    'platformUserId'  => $sessionToken,
                ];
            }
        }

        usort($conversations, function ($a, $b) {
            $toTime = function ($val) {
                if ($val === null || $val === '') return 0;
                if (is_numeric($val)) return (int) $val;
                $ts = strtotime((string) $val);
                return ($ts !== false) ? $ts : 0;
            };
            return $toTime($b['time']) <=> $toTime($a['time']);
        });

        return response()->json([
            'success' => true,
            'data'    => $conversations,
            'values'  => $conversations,
            'total'   => count($conversations),
            'source'  => $chatSource,
        ]);

    } catch (\Exception $e) {
        \Log::error('Conversations fetch error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch conversations: ' . $e->getMessage(),
        ], 500);
    }
});

// Get LINE image
Route::get('/line-image/{messageId}', function ($messageId) {
    try {
        $lineToken = env('LINE_CHANNEL_ACCESS_TOKEN');
        if (!$lineToken) {
            return response()->json(['error' => 'LINE token not configured'], 500);
        }

        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'Authorization' => 'Bearer ' . $lineToken
        ])->get("https://api-data.line.me/v2/bot/message/{$messageId}/content");

        if ($response->successful()) {
            $contentType = $response->header('Content-Type', 'application/octet-stream');
            return response($response->body(), 200, [
                'Content-Type' => $contentType,
                'Cache-Control' => 'public, max-age=31536000',
            ]);
        } else {
            return response()->json(['error' => 'Image not found'], 404);
        }
    } catch (\Exception $e) {
        \Log::error('LINE image fetch failed: ' . $e->getMessage());
        return response()->json(['error' => 'Failed to fetch image'], 500);
    }
});

// Legacy /check-message-updates endpoint removed — now using MySQL via EvanteApiService

// Additional customer routes (consolidating with existing ones)
Route::post('/customer/save', [CustomerController::class, 'saveCustomerInfo']);
Route::get('/customer/{lineUuid}', [CustomerController::class, 'getCustomerInfo']);
Route::post('/customer/add-note', [CustomerController::class, 'addCustomerNote']);
Route::post('/customer/update-note', [CustomerController::class, 'updateCustomerNote']);
Route::post('/customer/delete-note', [CustomerController::class, 'deleteCustomerNote']);

// Analytics API endpoint (public - no auth required)
Route::get('/analytics', [AnalyticsController::class, 'apiGetData']);

// Translation API endpoint
Route::post('/translate', function (Request $request) {
    try {
        $data = $request->validate([
            'text' => 'required|string|max:5000',
            'source' => 'nullable|string|max:10',
            'target' => 'required|string|max:10'
        ]);
        
        $text = $data['text'];
        $source = $data['source'] ?? 'auto';
        $target = $data['target'];
        $detectedLanguage = null;

        $normalizeForLibre = function ($langCode, $fallback = 'en') {
            if (!$langCode) {
                return $fallback;
            }

            $trimmed = strtolower(str_replace('_', '-', trim($langCode)));

            if ($trimmed === '' ) {
                return $fallback;
            }

            if ($trimmed === 'auto') {
                return 'auto';
            }

            return $trimmed;
        };

        $normalizeForMyMemory = function ($langCode, $fallback = 'EN') {
            if (!$langCode) {
                return $fallback;
            }

            $trimmed = str_replace('_', '-', trim($langCode));

            if ($trimmed === '') {
                return $fallback;
            }

            if (strtolower($trimmed) === 'auto') {
                return $fallback;
            }

            $segments = array_map('trim', explode('-', $trimmed));

            foreach ($segments as $index => $segment) {
                $segments[$index] = $index === 0 ? strtoupper($segment) : strtolower($segment);
            }

            return implode('-', $segments);
        };

        $libreSource = $source === 'auto' ? 'auto' : $normalizeForLibre($source, 'auto');
        $libreTarget = $normalizeForLibre($target, 'en');

        // Try LibreTranslate API with timeout
        try {
            $response = \Illuminate\Support\Facades\Http::timeout(10)->post('https://libretranslate.de/translate', [
                'q' => $text,
                'source' => $libreSource,
                'target' => $libreTarget,
                'format' => 'text'
            ]);
            
            if ($response->successful()) {
                $result = $response->json();
                if (isset($result['translatedText'])) {
                    $detectedLanguage = $result['detectedLanguage'] ?? null;
                    if (is_array($detectedLanguage)) {
                        $detectedLanguage = $detectedLanguage['language'] ?? null;
                    }
                    if (is_string($detectedLanguage)) {
                        $detectedLanguage = trim($detectedLanguage);
                    }

                    return response()->json([
                        'success' => true,
                        'translatedText' => $result['translatedText'],
                        'detectedLanguage' => $detectedLanguage
                    ]);
                }
            }
        } catch (\Exception $e) {
            \Log::warning('LibreTranslate failed: ' . $e->getMessage());
        }
        
        // Final fallback to MyMemory API
        try {
            $normalizedSource = $normalizeForMyMemory($source === 'auto' ? ($detectedLanguage ?? 'EN') : $source, 'EN');
            $normalizedTarget = $normalizeForMyMemory($target, 'EN');
            $langpair = $normalizedSource . '|' . $normalizedTarget;
            $mymemoryUrl = 'https://api.mymemory.translated.net/get';

            $response = \Illuminate\Support\Facades\Http::timeout(10)->get($mymemoryUrl, [
                'q' => $text,
                'langpair' => $langpair
            ]);
            
            if ($response->successful()) {
                $result = $response->json();
                if (isset($result['responseData']['translatedText'])) {
                    return response()->json([
                        'success' => true,
                        'translatedText' => $result['responseData']['translatedText'],
                        'detectedLanguage' => $source === 'auto' ? ($detectedLanguage ? strtoupper($detectedLanguage) : null) : $source
                    ]);
                }
            }
        } catch (\Exception $e) {
            \Log::warning('MyMemory translation failed: ' . $e->getMessage());
        }
        
        return response()->json([
            'success' => false,
            'message' => 'All translation services unavailable'
        ], 503);
        
    } catch (\Exception $e) {
        \Log::error('Translation API error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Translation failed: ' . $e->getMessage()
        ], 500);
    }
});

// Vapi Voice AI Webhook (no auth — called by Vapi servers)
Route::post('/vapi/webhook', [VapiWebhookController::class, 'handle']);
