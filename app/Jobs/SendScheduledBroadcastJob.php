<?php

namespace App\Jobs;

use App\Models\Broadcast;
use App\Services\LineBroadcastService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class SendScheduledBroadcastJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public int $broadcastId)
    {
    }

    public function handle(LineBroadcastService $lineBroadcastService): void
    {
        $broadcast = Broadcast::find($this->broadcastId);

        if (!$broadcast || !in_array($broadcast->status, ['scheduled', 'queued'], true)) {
            return;
        }

        if ($broadcast->scheduled_at && $broadcast->scheduled_at->isFuture()) {
            return;
        }

        $broadcast->status = 'sending';
        $broadcast->save();

        $targeting = $broadcast->targeting ?: 'everyone';
        $meta = is_array($broadcast->meta) ? $broadcast->meta : [];
        $selectedLabels = isset($meta['labels']) && is_array($meta['labels']) ? $meta['labels'] : [];

        if ($targeting === 'specific') {
            if (empty($selectedLabels)) {
                $broadcast->status = 'failed';
                $broadcast->error_message = 'Scheduled targeted broadcast is missing labels.';
                $broadcast->meta = array_merge($meta, [
                    'failed_by' => 'SendScheduledBroadcastJob',
                    'failure_reason' => 'missing_labels',
                ]);
                $broadcast->save();
                return;
            }

            $result = $lineBroadcastService->sendToSpecificByLabels(
                $broadcast->title ?: 'Untitled Broadcast',
                $broadcast->message,
                $selectedLabels
            );
        } else {
            $result = $lineBroadcastService->sendToAllFollowers(
                $broadcast->title ?: 'Untitled Broadcast',
                $broadcast->message
            );
        }

        if (!empty($result['success'])) {
            $broadcast->status = 'sent';
            $broadcast->sent_at = Carbon::now();
            $broadcast->error_message = null;
            $broadcast->meta = array_merge($broadcast->meta ?? [], [
                'targeting' => $targeting,
                'labels' => $selectedLabels,
                'recipient_count' => $result['recipient_count'] ?? null,
                'sent_count' => $result['sent_count'] ?? null,
                'fail_count' => $result['fail_count'] ?? null,
                'mirrored_to_inbox' => $result['mirrored_to_inbox'] ?? 0,
                'mirror_errors' => $result['mirror_errors'] ?? 0,
                'dispatched_by' => 'SendScheduledBroadcastJob',
            ]);
            $broadcast->save();
            return;
        }

        $broadcast->status = 'failed';
        $broadcast->error_message = $result['error'] ?? 'Unknown broadcast send error';
        $broadcast->meta = array_merge($broadcast->meta ?? [], [
            'httpCode' => $result['httpCode'] ?? null,
            'details' => $result['details'] ?? null,
            'failed_by' => 'SendScheduledBroadcastJob',
        ]);
        $broadcast->save();
    }
}
