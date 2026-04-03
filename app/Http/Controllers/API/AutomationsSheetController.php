<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AutomationsSheetController extends Controller
{
    protected string $webhookUrl;

    public function __construct()
    {
        $this->webhookUrl = config('services.make.webhook_url', '');
    }

    /**
     * Check automations that have been in Manual mode for more than 5 minutes
     * and reset them back to AI mode, then notify the Make.com webhook.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkAutomations()
    {
        try {
            if (!DB::getSchemaBuilder()->hasTable('automations')) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Automations table not found. Run: php artisan migrate',
                ], 500);
            }

            $cutoff = Carbon::now()->subMinutes(5);

            // Find automations in Manual mode that haven't been updated in > 5 minutes
            $staleManual = DB::table('automations')
                ->where('mode', 'Manual')
                ->where('updated_at', '<=', $cutoff)
                ->get();

            if ($staleManual->isEmpty()) {
                return response()->json([
                    'status'  => 'success',
                    'message' => 'No changes needed',
                    'changes' => [],
                ]);
            }

            $changedRows = [];
            $ids = [];

            foreach ($staleManual as $automation) {
                $diffMinutes = Carbon::parse($automation->updated_at)->diffInMinutes(Carbon::now());

                $changedRows[] = [
                    'id'             => $automation->id,
                    'name'           => $automation->name,
                    'original_mode'  => 'Manual',
                    'new_mode'       => 'AI',
                    'last_updated'   => $automation->updated_at,
                    'diff_minutes'   => $diffMinutes,
                ];

                $ids[] = $automation->id;
            }

            // Reset mode to AI
            DB::table('automations')
                ->whereIn('id', $ids)
                ->update(['mode' => 'AI', 'updated_at' => Carbon::now()]);

            $webhookSuccess = $this->sendToWebhook($changedRows);

            return response()->json([
                'status'         => 'success',
                'message'        => 'Changes detected and sent to webhook',
                'webhook_status' => $webhookSuccess ? 'sent' : 'failed',
                'changes'        => $changedRows,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ], 500);
        }
    }

    /**
     * Send changed automation data to Make.com webhook.
     */
    protected function sendToWebhook(array $data): bool
    {
        if (empty($this->webhookUrl)) {
            Log::warning('AutomationsSheetController: Make.com webhook URL not configured');
            return false;
        }

        try {
            $payload = [
                'changes'   => $data,
                'timestamp' => Carbon::now()->toIso8601String(),
                'source'    => 'evante_aura_automations',
            ];

            $response = Http::post($this->webhookUrl, $payload);

            Log::info('Webhook response:', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Error sending to webhook: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * API endpoint for checking automations (called via cron or Postman).
     */
    public function check(Request $request)
    {
        return $this->checkAutomations();
    }
}
