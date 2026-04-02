<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LineBroadcastService
{
    private EvanteApiService $evante;

    public function __construct(EvanteApiService $evante)
    {
        $this->evante = $evante;
    }

    public function sendToAllFollowers(string $title, string $messageText): array
    {
        $lineToken = env('LINE_CHANNEL_ACCESS_TOKEN');

        if (!$lineToken) {
            return [
                'success' => false,
                'error'   => 'LINE_CHANNEL_ACCESS_TOKEN is not configured in .env',
            ];
        }

        try {
            $response = Http::withHeaders([
                'Content-Type'  => 'application/json',
                'Authorization' => 'Bearer ' . $lineToken,
            ])->post('https://api.line.me/v2/bot/message/broadcast', [
                'messages' => [[
                    'type' => 'text',
                    'text' => $messageText,
                ]],
            ]);
        } catch (\Throwable $e) {
            Log::error('LINE Broadcast request failed', [
                'error' => $e->getMessage(),
                'title' => $title,
            ]);

            return [
                'success' => false,
                'error'   => 'Failed to send broadcast: ' . $e->getMessage(),
            ];
        }

        $httpCode = $response->status();

        Log::info('LINE Broadcast API response', [
            'title'    => $title,
            'message'  => mb_substr($messageText, 0, 100),
            'httpCode' => $httpCode,
            'response' => $response->body(),
        ]);

        if (!$response->successful()) {
            return [
                'success' => false,
                'error'   => 'LINE API returned an error.',
                'httpCode' => $httpCode,
                'details' => $response->json(),
            ];
        }

        $mirroredCount = 0;
        $mirrorErrors  = 0;

        try {
            $recipients = $this->getBroadcastRecipientsFromContacts();

            foreach ($recipients as $lineUuid) {
                $nextSequence = $this->getNextChatSequenceForLine($lineUuid);
                $timestampMs  = (int) round(microtime(true) * 1000);

                $payload = [
                    'lineUuid'       => $lineUuid,
                    'chatSequence'   => $nextSequence,
                    'userInput'      => '',
                    'aiResponse'     => $messageText,
                    'message'        => $messageText,
                    'time'           => now()->toISOString(),
                    'date'           => now()->toISOString(),
                    'timestamp'      => $timestampMs,
                    'linkImage'      => '',
                    'chatMode'       => 'Active',
                    'aiRead'         => 'TRUE',
                    'messageChannel' => 'BackOffice',
                    'displayName'    => 'Broadcast',
                    'messageId'      => 'broadcast_' . uniqid(),
                    'source'         => 'BROADCAST',
                ];

                $result = $this->evante->postMessage($payload);

                if ($result['success'] ?? false) {
                    $mirroredCount++;
                } else {
                    $mirrorErrors++;
                    Log::warning('Failed to post broadcast message via Evante API', [
                        'lineUuid' => $lineUuid,
                        'error'    => $result['error'] ?? '',
                    ]);
                }
            }
        } catch (\Throwable $e) {
            $mirrorErrors++;
            Log::warning('Broadcast mirror to Evante API failed', ['error' => $e->getMessage()]);
        }

        return [
            'success'           => true,
            'message'           => 'Broadcast sent to all LINE followers successfully.',
            'title'             => $title,
            'mirrored_to_inbox' => $mirroredCount,
            'mirror_errors'     => $mirrorErrors,
        ];
    }

    /**
     * Fetch unique LINE UUIDs from Evante contacts API.
     */
    private function getBroadcastRecipientsFromContacts(): array
    {
        $result = $this->evante->getContacts();

        if (!($result['success'] ?? false)) {
            Log::warning('getBroadcastRecipientsFromContacts: Evante API failed', ['error' => $result['error'] ?? '']);
            return [];
        }

        $contacts = $result['data'] ?? [];
        $recipients = [];

        foreach ($contacts as $contact) {
            $uuid = trim((string) ($contact['lineuuid'] ?? $contact['lineUuid'] ?? ''));
            if ($uuid !== '' && str_starts_with($uuid, 'U')) {
                $recipients[$uuid] = true;
            }
        }

        return array_keys($recipients);
    }

    private function getNextChatSequenceForLine(string $lineUuid): int
    {
        $result = $this->evante->getNextChatSequence($lineUuid);
        return (int) ($result['chatSequence'] ?? 1);
    }

    // ─── Contacts & Labels via Evante API ────────────────────────────────────

    /**
     * Fetch contacts from Evante API.
     * Returns array of ['lineuuid' => string, 'labels' => string[], 'name' => string].
     */
    public function getContactsFromSheet(): array
    {
        $result = $this->evante->getContacts();

        if (!($result['success'] ?? false)) {
            Log::error('LineBroadcastService::getContactsFromSheet failed', ['error' => $result['error'] ?? '']);
            return [];
        }

        $raw      = $result['data'] ?? [];
        $contacts = [];

        foreach ($raw as $contact) {
            $uuid     = trim((string) ($contact['lineuuid'] ?? $contact['lineUuid'] ?? ''));
            $labelRaw = $contact['label'] ?? $contact['labels'] ?? '';
            $name     = trim((string) ($contact['name'] ?? $contact['profile_name'] ?? ''));

            if ($uuid === '') {
                continue;
            }

            if (is_array($labelRaw)) {
                $labels = array_filter(array_map('trim', $labelRaw));
            } else {
                $labels = array_filter(array_map('trim', explode(',', (string) $labelRaw)));
            }

            $contacts[] = [
                'lineuuid' => $uuid,
                'labels'   => array_values($labels),
                'name'     => $name,
            ];
        }

        return $contacts;
    }

    /**
     * Get unique labels with their contact counts.
     * Returns ['label_name' => count, ...] sorted by name.
     */
    public function getLabelsWithCounts(): array
    {
        $result = $this->evante->getLabels();

        if (!($result['success'] ?? false)) {
            Log::error('LineBroadcastService::getLabelsWithCounts failed', ['error' => $result['error'] ?? '']);
            // Fallback: compute from contacts
            $contacts    = $this->getContactsFromSheet();
            $labelCounts = [];
            foreach ($contacts as $contact) {
                foreach ($contact['labels'] as $label) {
                    if ($label === '') {
                        continue;
                    }
                    $labelCounts[$label] = ($labelCounts[$label] ?? 0) + 1;
                }
            }
            ksort($labelCounts);
            return $labelCounts;
        }

        $raw         = $result['data'] ?? [];
        $labelCounts = [];

        foreach ($raw as $item) {
            if (is_array($item)) {
                $label = $item['label'] ?? $item['name'] ?? '';
                $count = (int) ($item['count'] ?? 0);
            } else {
                $label = (string) $item;
                $count = 1;
            }
            if ($label !== '') {
                $labelCounts[$label] = $count;
            }
        }

        ksort($labelCounts);
        return $labelCounts;
    }

    /**
     * Send LINE push message to contacts matching any of the given labels.
     */
    public function sendToSpecificByLabels(string $title, string $messageText, array $selectedLabels): array
    {
        $lineToken = env('LINE_CHANNEL_ACCESS_TOKEN');

        if (!$lineToken) {
            return [
                'success' => false,
                'error'   => 'LINE_CHANNEL_ACCESS_TOKEN is not configured in .env',
            ];
        }

        if (empty($selectedLabels)) {
            return [
                'success' => false,
                'error'   => 'No labels selected for targeting.',
            ];
        }

        // Fetch contacts filtered by labels
        $result = $this->evante->getContacts($selectedLabels);

        if (!($result['success'] ?? false)) {
            // Fallback: filter locally
            $allContacts         = $this->getContactsFromSheet();
            $selectedLabelsLower = array_map('strtolower', $selectedLabels);
            $matchedUuids        = [];

            foreach ($allContacts as $contact) {
                $contactLabelsLower = array_map('strtolower', $contact['labels']);
                if (array_intersect($selectedLabelsLower, $contactLabelsLower)) {
                    $uuid = $contact['lineuuid'];
                    if ($uuid !== '' && str_starts_with($uuid, 'U')) {
                        $matchedUuids[$uuid] = true;
                    }
                }
            }
            $matchedUuids = array_keys($matchedUuids);
        } else {
            $contacts     = $result['data'] ?? [];
            $matchedUuids = [];
            foreach ($contacts as $contact) {
                $uuid = trim((string) ($contact['lineuuid'] ?? $contact['lineUuid'] ?? ''));
                if ($uuid !== '' && str_starts_with($uuid, 'U')) {
                    $matchedUuids[$uuid] = true;
                }
            }
            $matchedUuids = array_keys($matchedUuids);
        }

        if (empty($matchedUuids)) {
            return [
                'success' => false,
                'error'   => 'No contacts found with the selected labels.',
            ];
        }

        $messages   = [['type' => 'text', 'text' => $messageText]];
        $sentCount  = 0;
        $failCount  = 0;

        foreach ($matchedUuids as $uuid) {
            try {
                $pushResponse = Http::withHeaders([
                    'Content-Type'  => 'application/json',
                    'Authorization' => 'Bearer ' . $lineToken,
                ])->post('https://api.line.me/v2/bot/message/push', [
                    'to'       => $uuid,
                    'messages' => $messages,
                ]);

                if ($pushResponse->successful()) {
                    $sentCount++;
                } else {
                    $failCount++;
                    Log::warning('LINE push failed for user', [
                        'lineUuid' => $uuid,
                        'status'   => $pushResponse->status(),
                        'body'     => $pushResponse->body(),
                    ]);
                }
            } catch (\Throwable $e) {
                $failCount++;
                Log::error('LINE push exception', ['lineUuid' => $uuid, 'error' => $e->getMessage()]);
            }
        }

        // Mirror to Evante inbox
        $mirroredCount = 0;
        $mirrorErrors  = 0;

        foreach ($matchedUuids as $uuid) {
            $nextSequence = $this->getNextChatSequenceForLine($uuid);
            $timestampMs  = (int) round(microtime(true) * 1000);

            $payload = [
                'lineUuid'       => $uuid,
                'chatSequence'   => $nextSequence,
                'userInput'      => '',
                'aiResponse'     => $messageText,
                'message'        => $messageText,
                'time'           => now()->toISOString(),
                'date'           => now()->toISOString(),
                'timestamp'      => $timestampMs,
                'linkImage'      => '',
                'chatMode'       => 'Active',
                'aiRead'         => 'TRUE',
                'messageChannel' => 'BackOffice',
                'displayName'    => 'Broadcast',
                'messageId'      => 'broadcast_' . uniqid(),
                'source'         => 'BROADCAST',
            ];

            $writeResult = $this->evante->postMessage($payload);

            if ($writeResult['success'] ?? false) {
                $mirroredCount++;
            } else {
                $mirrorErrors++;
            }
        }

        Log::info('LINE Targeted Broadcast completed', [
            'title'         => $title,
            'labels'        => $selectedLabels,
            'matched_users' => count($matchedUuids),
            'sent'          => $sentCount,
            'failed'        => $failCount,
            'mirrored'      => $mirroredCount,
        ]);

        return [
            'success'           => $sentCount > 0,
            'message'           => "Broadcast sent to {$sentCount} of " . count($matchedUuids) . ' targeted contacts.',
            'title'             => $title,
            'labels'            => $selectedLabels,
            'recipient_count'   => count($matchedUuids),
            'sent_count'        => $sentCount,
            'fail_count'        => $failCount,
            'mirrored_to_inbox' => $mirroredCount,
            'mirror_errors'     => $mirrorErrors,
        ];
    }
}
