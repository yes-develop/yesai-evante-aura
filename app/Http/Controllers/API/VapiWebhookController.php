<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CallLog;
use App\Models\CallTranscript;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class VapiWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        // Verify Vapi signature if secret is configured
        if ($secret = config('services.vapi.webhook_secret')) {
            $signature = $request->header('x-vapi-signature');
            $expected  = hash_hmac('sha256', $request->getContent(), $secret);
            if (!$signature || !hash_equals($expected, $signature)) {
                return response()->json(['error' => 'Invalid signature'], 401);
            }
        }

        $payload = $request->json()->all();
        $type    = data_get($payload, 'message.type') ?? data_get($payload, 'type');

        Log::info('[Vapi Webhook] Received event', ['type' => $type]);

        match ($type) {
            'call-started'       => $this->handleCallStarted($payload),
            'transcript'         => $this->handleTranscript($payload),
            'call-ended'         => $this->handleCallEnded($payload),
            'end-of-call-report' => $this->handleEndOfCallReport($payload),
            default              => Log::info('[Vapi Webhook] Unhandled event type', ['type' => $type]),
        };

        return response()->json(['status' => 'ok']);
    }

    private function handleCallStarted(array $payload): void
    {
        $call = data_get($payload, 'message.call') ?? data_get($payload, 'call', []);

        CallLog::updateOrCreate(
            ['vapi_call_id' => data_get($call, 'id')],
            [
                'phone_number' => data_get($call, 'customer.number')
                    ?? data_get($call, 'phoneNumber.number'),
                'direction'    => data_get($call, 'type') === 'outboundPhoneCall' ? 'outbound' : 'inbound',
                'status'       => 'in-progress',
                'assistant_id' => data_get($call, 'assistantId'),
                'customer_name'=> data_get($call, 'customer.name'),
                'started_at'   => now(),
                'metadata'     => $call,
            ]
        );
    }

    private function handleTranscript(array $payload): void
    {
        $msg     = data_get($payload, 'message', $payload);
        $callId  = data_get($msg, 'call.id') ?? data_get($msg, 'callId');
        $callLog = CallLog::firstOrCreate(
            ['vapi_call_id' => $callId],
            ['status' => 'in-progress', 'started_at' => now()]
        );

        $role      = data_get($msg, 'role', 'human');
        $speaker   = match ($role) {
            'assistant' => 'ai',
            'system'    => 'system',
            default     => 'human',
        };
        $isFinal   = (bool) data_get($msg, 'transcriptType') === 'final'
            || (bool) data_get($msg, 'isFinal', true);

        CallTranscript::create([
            'call_log_id'  => $callLog->id,
            'speaker'      => $speaker,
            'content'      => data_get($msg, 'transcript', ''),
            'timestamp_ms' => data_get($msg, 'timestamp'),
            'is_final'     => $isFinal,
            'confidence'   => data_get($msg, 'confidence'),
        ]);
    }

    private function handleCallEnded(array $payload): void
    {
        $call    = data_get($payload, 'message.call') ?? data_get($payload, 'call', []);
        $callId  = data_get($call, 'id');
        $callLog = CallLog::where('vapi_call_id', $callId)->first();

        if (!$callLog) return;

        $endReason = data_get($call, 'endedReason', 'completed');
        $status    = match ($endReason) {
            'customer-did-not-answer', 'voicemail' => 'no-answer',
            'error', 'pipeline-error'              => 'failed',
            default                                => 'completed',
        };

        $startedAt = $callLog->started_at ?? now();
        $endedAt   = now();
        $duration  = (int) $endedAt->diffInSeconds($startedAt);

        $callLog->update([
            'status'           => $status,
            'ended_at'         => $endedAt,
            'duration_seconds' => $duration,
            'recording_url'    => data_get($call, 'artifact.recordingUrl')
                ?? data_get($call, 'recordingUrl'),
        ]);
    }

    private function handleEndOfCallReport(array $payload): void
    {
        $msg    = data_get($payload, 'message', $payload);
        $callId = data_get($msg, 'call.id') ?? data_get($msg, 'callId');
        $callLog = CallLog::where('vapi_call_id', $callId)->first();

        if (!$callLog) return;

        $analysis  = data_get($msg, 'analysis', []);
        $summary   = data_get($analysis, 'summary') ?? data_get($msg, 'summary');
        $sentiment = data_get($analysis, 'sentiment');
        $cost      = data_get($msg, 'cost') ?? data_get($msg, 'costBreakdown.total');

        $normalized = null;
        if ($sentiment) {
            $s = strtolower($sentiment);
            $normalized = in_array($s, ['positive', 'neutral', 'negative']) ? $s : null;
        }

        $callLog->update(array_filter([
            'summary'   => $summary,
            'sentiment' => $normalized,
            'cost'      => $cost,
        ], fn($v) => $v !== null));
    }
}
