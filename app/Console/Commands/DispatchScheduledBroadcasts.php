<?php

namespace App\Console\Commands;

use App\Jobs\SendScheduledBroadcastJob;
use App\Models\Broadcast;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class DispatchScheduledBroadcasts extends Command
{
    protected $signature = 'broadcasts:dispatch-due';
    protected $description = 'Dispatch queued jobs for scheduled broadcasts that are due';

    public function handle(): int
    {
        if (!Schema::hasTable('broadcasts')) {
            return self::SUCCESS;
        }

        $dueBroadcasts = Broadcast::query()
            ->whereIn('status', ['scheduled', 'queued'])
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', now())
            ->orderBy('scheduled_at')
            ->limit(100)
            ->get();

        foreach ($dueBroadcasts as $broadcast) {
            // Claim the row first to avoid duplicate dispatch on concurrent scheduler ticks.
            $claimed = Broadcast::query()
                ->whereKey($broadcast->id)
                ->whereIn('status', ['scheduled', 'queued'])
                ->update(['status' => 'queued']);

            if ($claimed) {
                // Run immediately in scheduler context so due sends still work
                // even when queue worker is not running.
                SendScheduledBroadcastJob::dispatchSync($broadcast->id);
            }
        }

        if ($dueBroadcasts->count() > 0) {
            $this->info('Dispatched ' . $dueBroadcasts->count() . ' scheduled broadcast(s).');
        }

        return self::SUCCESS;
    }
}
