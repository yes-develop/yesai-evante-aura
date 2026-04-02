<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ChatAssignment;
use App\Services\EvanteApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class WebhookController extends Controller
{
    private EvanteApiService $evante;

    public function __construct(EvanteApiService $evante)
    {
        $this->evante = $evante;
    }

    /**
     * Handle unread chat tracking with MySQL storage
     */
    public function handleUnreadChat(Request $request)
    {
        try {
            $data = $request->all();
            Log::info('MySQL Unread Chat webhook received:', $data);

            // Validate required fields
            if (empty($data['lineUuid'])) {
                return response()->json(['error' => 'lineUuid is required'], 400);
            }

            $unreadCount = $data['unreadCount'] ?? 0;
            $customerInfo = $data['customerInfo'] ?? [];
            $assignmentInfo = $data['assignmentInfo'] ?? [];

            // Store or update assignment data in MySQL
            // Get action from data or default to 'update'
            $action = $data['action'] ?? 'update';
            
            // Find existing assignment or prepare data for new one
            $existingAssignment = ChatAssignment::where('line_uuid', $data['lineUuid'])->first();
            $defaultUserId = \App\Models\User::first()?->id ?? 1; // Use first user as default
            
            $assignment = ChatAssignment::updateOrCreate(
                ['line_uuid' => $data['lineUuid']],
                [
                    'user_id' => $existingAssignment?->user_id ?? $defaultUserId, // Keep existing or use default
                    // Preserve existing assignments unless explicitly provided in webhook data
                    'assigned_member_id' => $assignmentInfo['assignedMemberId'] ?? $existingAssignment?->assigned_member_id ?? null,
                    'assigned_member' => $assignmentInfo['assignedMember'] ?? $existingAssignment?->assigned_member ?? 'Unassigned',
                    'unread_message_at' => $unreadCount > 0 ? now() : null,
                    'assigned_at' => isset($assignmentInfo['assignedAt']) ? Carbon::parse($assignmentInfo['assignedAt']) : ($existingAssignment?->assigned_at ?? now()),
                    'notification_scheduled_at' => $unreadCount > 0 ? now()->addMinutes(10) : null,
                    'is_replied' => $action === 'clear_unread' || $unreadCount == 0,
                    'replied_at' => $action === 'clear_unread' || $unreadCount == 0 ? now() : null,
                    'webhook_data' => [
                        'customerInfo' => $customerInfo,
                        'assignmentInfo' => $assignmentInfo,
                        'timestamp' => $data['timestamp'] ?? now()->toISOString(),
                        'action' => $action
                    ]
                ]
            );

            // Prepare data for n8n workflow (n8n will handle Google Sheets storage)
            $trackingData = [
                'lineUuid' => $data['lineUuid'],
                'customer_info' => [
                    'name' => $customerInfo['name'] ?? ($data['customer_info']['name'] ?? ''),
                    'phone' => $customerInfo['phone'] ?? ($data['customer_info']['phone'] ?? ''),
                    'email' => $customerInfo['email'] ?? ($data['customer_info']['email'] ?? ''),
                ],
                'unreadChat' => (string) $unreadCount,
                'action' => $action,
                'assignedMember' => $assignment->assigned_member ?? 'Unassigned',
                'assignedMemberId' => $assignment->assigned_member_id ?? null,
                'returnChat' => $data['returnChat'] ?? 'false',
                'timestamp' => $data['timestamp'] ?? now()->toIso8601String(),
                'messageChannel' => $data['messageChannel'] ?? 'Line',
                'needsNotification' => $unreadCount > 0,
                'notificationScheduledAt' => optional($assignment->notification_scheduled_at)->toIso8601String(),
                'messageId' => $data['messageId'] ?? '',
                'chatSequence' => $data['chatSequence'] ?? $data['sequence'] ?? '',
                'userInput' => $data['userInput'] ?? $data['message'] ?? '',
                'source' => 'api_webhook',
                'label' => $data['label'] ?? '',
                'note' => $data['note'] ?? 'API webhook trigger'
            ];

            // Note: n8n workflow is triggered via the /api/n8n/unread-tracking endpoint
            // Removed direct call to avoid duplicate webhook executions

            // Update conversation views in Firebase to mark as read if unreadCount is 0
            if ($unreadCount == 0) {
                $this->updateFirebaseConversationView($data['lineUuid']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Unread chat tracking updated successfully',
                'assignment_id' => $assignment->id,
                'unread_count' => $unreadCount,
                'action' => $action
            ]);

        } catch (\Exception $e) {
            Log::error('MySQL Unread chat tracking failed:', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Unread chat tracking failed'
            ], 500);
        }
    }

    /**
     * Update conversation viewed timestamp via Evante API.
     */
    private function updateFirebaseConversationView($lineUuid)
    {
        try {
            $this->evante->markConversationViewed($lineUuid);
            Log::info("Marked conversation viewed for {$lineUuid}");
        } catch (\Exception $e) {
            Log::warning("Failed to mark conversation viewed for {$lineUuid}: " . $e->getMessage());
        }
    }


    /**
     * Get pending notifications for 10-minute rule
     */
    public function getPendingNotifications()
    {
        try {
            $pendingNotifications = ChatAssignment::pendingNotifications()->get();
            
            return response()->json([
                'success' => true,
                'notifications' => $pendingNotifications->map(function($assignment) {
                    return [
                        'id' => $assignment->id,
                        'lineUuid' => $assignment->line_uuid,
                        'assignedMember' => $assignment->assigned_member,
                        'assignedMemberId' => $assignment->assigned_member_id,
                        'unreadMessageAt' => $assignment->unread_message_at,
                        'scheduledAt' => $assignment->notification_scheduled_at,
                        'customer' => $assignment->webhook_data['customer_info']['name'] ?? $assignment->webhook_data['profileName'] ?? 'Unknown Customer'
                    ];
                })
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get pending notifications:', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to get pending notifications'
            ], 500);
        }
    }

    /**
     * Mark notification as sent
     */
    public function markNotificationSent(Request $request, $assignmentId)
    {
        try {
            $assignment = ChatAssignment::findOrFail($assignmentId);
            $assignment->update([
                'notification_sent' => true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as sent'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to mark notification as sent:', [
                'error' => $e->getMessage(),
                'assignmentId' => $assignmentId
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to mark notification as sent'
            ], 500);
        }
    }

    /**
     * Trigger n8n workflow for unified processing
     */
    private function triggerN8nWorkflow($data)
    {
        try {
            $n8nUrl = config('services.n8n.unread_tracking_url');

            if (!$n8nUrl) {
                Log::warning('N8N webhook URL not configured, skipping n8n workflow trigger');
                return;
            }

            // Send data to n8n workflow
            $response = Http::timeout(10)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-Requested-By' => 'yesai-backoffice-api'
                ])
                ->post($n8nUrl, $data);

            if ($response->successful()) {
                Log::info('Successfully triggered n8n workflow', [
                    'lineUuid' => $data['lineUuid'],
                    'action' => $data['action'],
                    'source' => $data['source']
                ]);
            } else {
                Log::warning('n8n workflow trigger failed', [
                    'lineUuid' => $data['lineUuid'],
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to trigger n8n workflow:', [
                'error' => $e->getMessage(),
                'lineUuid' => $data['lineUuid'] ?? 'unknown'
            ]);
        }
    }
}
