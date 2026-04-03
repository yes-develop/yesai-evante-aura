<?php

namespace App\Http\Controllers;

use App\Models\Broadcast;
use App\Services\EvanteApiService;
use App\Services\LineBroadcastService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

class BroadcastController extends Controller
{
    public function __construct(
        private readonly LineBroadcastService $lineBroadcastService,
        private readonly EvanteApiService $evanteApi,
    ) {
    }

    /**
     * Display a listing of broadcasts.
     */
    public function index()
    {
        $broadcasts = [];

        try {
            if (Schema::hasTable('broadcasts')) {
                $broadcasts = Broadcast::query()
                    ->latest('id')
                    ->limit(100)
                    ->get()
                    ->map(function (Broadcast $broadcast): array {
                        $meta = is_array($broadcast->meta) ? $broadcast->meta : [];

                        return [
                            'id' => $broadcast->id,
                            'title' => $broadcast->title,
                            'type' => $broadcast->channel,
                            'status' => $broadcast->status,
                            'scheduled_at' => optional($broadcast->scheduled_at)?->format('Y-m-d H:i:s'),
                            'sent_at' => optional($broadcast->sent_at)?->format('Y-m-d H:i:s'),
                            'recipients' => (int) ($meta['recipient_count'] ?? 0),
                            'created_at' => optional($broadcast->created_at)?->format('Y-m-d H:i:s'),
                        ];
                    })
                    ->all();
            }
        } catch (\Throwable $e) {
            // Keep the page usable if the DB is temporarily unavailable.
            $broadcasts = [];
        }

        return view('broadcasts.index', compact('broadcasts'));
    }

    public function create()
    {
        return view('broadcasts.create');
    }

    public function store(Request $request)
    {
        return redirect()->route('broadcasts.index')
            ->with('success', 'Broadcast created successfully');
    }

    /**
     * Send now or schedule LINE broadcast to all followers.
     */
    public function sendLineBroadcast(Request $request)
    {
        try {
            if (!Schema::hasTable('broadcasts')) {
                return response()->json([
                    'success' => false,
                    'error' => 'Broadcast scheduling is not initialized. Run: php artisan migrate',
                ], 500);
            }
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => 'Database is not ready for scheduling. Check DB connection and run migrations.',
            ], 500);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
            'title' => 'nullable|string|max:255',
            'timing' => 'nullable|in:now,schedule',
            'schedule_date' => 'exclude_unless:timing,schedule|required|date_format:Y-m-d',
            'schedule_time' => 'exclude_unless:timing,schedule|required|date_format:H:i',
            'targeting' => 'nullable|in:everyone,specific',
            'channel' => 'nullable|in:line',
            'labels' => 'nullable|array',
            'labels.*' => 'string|max:255',
        ]);

        $timing = $validated['timing'] ?? 'now';
        $title = trim((string) ($validated['title'] ?? ''));
        $title = $title !== '' ? $title : 'Untitled Broadcast';
        $messageText = $validated['message'];
        $targeting = $validated['targeting'] ?? 'everyone';
        $selectedLabels = $validated['labels'] ?? [];

        if ($targeting === 'specific' && empty($selectedLabels)) {
            return response()->json([
                'success' => false,
                'error' => 'Please select at least one label for specific targeting.',
            ], 422);
        }

        if ($timing === 'schedule') {
            $scheduledAt = Carbon::createFromFormat(
                'Y-m-d H:i',
                $validated['schedule_date'] . ' ' . $validated['schedule_time'],
                'Asia/Bangkok'
            );

            if ($scheduledAt->lessThanOrEqualTo(Carbon::now('Asia/Bangkok'))) {
                return response()->json([
                    'success' => false,
                    'error' => 'Scheduled time must be in the future (Asia/Bangkok).',
                ], 422);
            }

            try {
                $meta = [
                    'scheduled_timezone' => 'Asia/Bangkok',
                    'scheduled_local' => $scheduledAt->format('Y-m-d H:i:s'),
                ];
                if ($targeting === 'specific' && !empty($selectedLabels)) {
                    $meta['labels'] = $selectedLabels;
                }

                $broadcast = Broadcast::create([
                    'title' => $title,
                    'message' => $messageText,
                    'channel' => 'line',
                    'targeting' => $targeting,
                    'timing' => 'schedule',
                    'status' => 'scheduled',
                    'scheduled_at' => $scheduledAt->clone()->timezone(config('app.timezone', 'UTC')),
                    'meta' => $meta,
                ]);
            } catch (QueryException $e) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to save scheduled broadcast. Run: php artisan migrate',
                ], 500);
            }

            return response()->json([
                'success' => true,
                'scheduled' => true,
                'message' => 'Broadcast scheduled successfully.',
                'broadcast_id' => $broadcast->id,
                'scheduled_at' => $scheduledAt->format('Y-m-d H:i:s'),
                'timezone' => 'Asia/Bangkok',
            ]);
        }

        try {
            $broadcast = Broadcast::create([
                'title' => $title,
                'message' => $messageText,
                'channel' => 'line',
                'targeting' => $targeting,
                'timing' => 'now',
                'status' => 'sending',
                'meta' => $targeting === 'specific' ? ['labels' => $selectedLabels] : [],
            ]);
        } catch (QueryException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to save broadcast record. Run: php artisan migrate',
            ], 500);
        }

        if ($targeting === 'specific' && !empty($selectedLabels)) {
            $result = $this->lineBroadcastService->sendToSpecificByLabels($title, $messageText, $selectedLabels);
        } else {
            $result = $this->lineBroadcastService->sendToAllFollowers($title, $messageText);
        }

        if (!empty($result['success'])) {
            $broadcast->status = 'sent';
            $broadcast->sent_at = now();
            $broadcast->meta = [
                'mirrored_to_inbox' => $result['mirrored_to_inbox'] ?? 0,
                'mirror_errors' => $result['mirror_errors'] ?? 0,
            ];
            $broadcast->save();

            return response()->json($result);
        }

        $broadcast->status = 'failed';
        $broadcast->error_message = $result['error'] ?? 'Unknown broadcast send error';
        $broadcast->meta = [
            'httpCode' => $result['httpCode'] ?? null,
            'details' => $result['details'] ?? null,
        ];
        $broadcast->save();

        return response()->json([
            'success' => false,
            'error' => $result['error'] ?? 'Failed to send broadcast',
            'details' => $result['details'] ?? null,
        ], 422);
    }

    /**
     * Get all unique labels from contacts with counts.
     */
    public function getLabels()
    {
        try {
            $labelCounts = $this->lineBroadcastService->getLabelsWithCounts();

            $labels = [];
            foreach ($labelCounts as $name => $count) {
                $labels[] = [
                    'name'  => $name,
                    'count' => $count,
                ];
            }

            return response()->json([
                'success' => true,
                'labels'  => $labels,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error'   => 'Failed to fetch labels: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send broadcast to in-app message tabs via Evante API.
     */
    public function sendInApp(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'message' => 'required|string',
            'deliveryMode' => 'required|in:inapp',
        ]);

        $chatsResult = $this->evanteApi->getAllChats();
        $chats = $chatsResult['data'] ?? [];
        $recipients = array_unique(array_values(array_filter(array_column($chats, 'lineUuid'))));

        $now = now()->toISOString();

        $linkImage = null;
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $path = $image->store('broadcasts', 'public');
            $linkImage = asset('storage/' . $path);
        }

        foreach ($recipients as $lineUuid) {
            $seqResult = $this->evanteApi->getNextChatSequence($lineUuid);
            $payload = [
                'lineUuid' => $lineUuid,
                'userInput' => $request->input('message'),
                'timestamp' => $now,
                'messageId' => 'bc_' . uniqid(),
                'chatSequence' => $seqResult['chatSequence'] ?? 1,
                'chatMode' => 'Active',
            ];

            if ($linkImage) {
                $payload['linkImage'] = $linkImage;
            }

            $this->evanteApi->postMessage($payload);
        }

        return response()->json([
            'success' => true,
            'message' => 'Broadcast sent to message tabs',
            'recipients' => count($recipients),
        ]);
    }

    public function show($id)
    {
        return view('broadcasts.show', ['id' => $id]);
    }

    public function edit($id)
    {
        return view('broadcasts.edit', ['id' => $id]);
    }

    public function update(Request $request, $id)
    {
        return redirect()->route('broadcasts.index')
            ->with('success', 'Broadcast updated successfully');
    }

    public function destroy($id)
    {
        return redirect()->route('broadcasts.index')
            ->with('success', 'Broadcast deleted successfully');
    }
}
