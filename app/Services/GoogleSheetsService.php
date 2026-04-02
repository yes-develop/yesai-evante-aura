<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class GoogleSheetsService
{
    private EvanteApiService $evante;

    public function __construct(EvanteApiService $evante)
    {
        $this->evante = $evante;
    }

    /**
     * Get raw conversation rows with normalized keys (no grouping).
     * Delegates to EvanteApiService::getMessages().
     */
    public function getConversationRowsNormalized(string $sheetName = 'Sheet2', ?int $limit = null): array
    {
        try {
            // sheetName is kept as parameter for signature compatibility; lineUuid not available here
            // so we fetch all chats and return them as normalized rows
            $result = $this->evante->getAllChats();

            if (!($result['success'] ?? false)) {
                return ['success' => false, 'error' => $result['error'] ?? 'Unknown error', 'data' => []];
            }

            $chats = $result['data'] ?? [];

            if ($limit !== null) {
                $chats = array_slice($chats, 0, $limit);
            }

            $rows = [];
            foreach ($chats as $chat) {
                $timeValue = $chat['time'] ?? $chat['date'] ?? $chat['timestamp'] ?? '';

                $rows[] = [
                    'lineUuid'       => $chat['lineUuid'] ?? '',
                    'chatSequence'   => $chat['chatSequence'] ?? '',
                    'message'        => $chat['userInput'] ?? $chat['message'] ?? '',
                    'aiResponse'     => $chat['aiResponse'] ?? '',
                    'date'           => $chat['date'] ?? $timeValue,
                    'time'           => $timeValue,
                    'timestamp'      => $timeValue,
                    'chatMode'       => $chat['chatMode'] ?? '',
                    'assignTeam'     => $chat['assignTeam'] ?? '',
                    'messageChannel' => $chat['messageChannel'] ?? '',
                    'linkImage'      => $chat['linkImage'] ?? '',
                    'fileName'       => $chat['fileName'] ?? '',
                    'raw'            => $chat,
                ];
            }

            return ['success' => true, 'data' => $rows];

        } catch (\Exception $e) {
            Log::error('GoogleSheetsService::getConversationRowsNormalized failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage(), 'data' => []];
        }
    }

    /**
     * Append a row — delegates to EvanteApiService::postMessage().
     */
    public function appendRow(array $values, string $sheetName = 'Sheet1'): array
    {
        try {
            // Map indexed array (legacy column order) to named fields
            $data = [
                'lineUuid'       => $values[0] ?? '',
                'chatSequence'   => $values[1] ?? '',
                'userInput'      => $values[2] ?? '',
                'aiResponse'     => $values[3] ?? '',
                'date'           => $values[4] ?? '',
                'linkImage'      => $values[5] ?? '',
                'chatMode'       => $values[6] ?? '',
                'aiRead'         => $values[7] ?? '',
                'messageChannel' => $values[8] ?? '',
                'messageId'      => $values[9] ?? '',
                'sheetName'      => $sheetName,
            ];

            $result = $this->evante->postMessage($data);

            if (!($result['success'] ?? false)) {
                Log::error('GoogleSheetsService::appendRow failed', ['error' => $result['error'] ?? '']);
                return ['success' => false, 'error' => $result['error'] ?? 'postMessage failed'];
            }

            return ['success' => true, 'updatedRows' => 1];

        } catch (\Exception $e) {
            Log::error('GoogleSheetsService::appendRow exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Format message data for the legacy column structure.
     * (Signature unchanged — still used by backupMessage.)
     */
    public function formatMessageForSheets(array $messageData): array
    {
        $linkImage  = $messageData['linkImage'] ?? '';
        $userInput  = $messageData['userInput'] ?? ($messageData['message'] ?? '');
        $aiResponse = $messageData['aiResponse'] ?? '';

        if (is_string($linkImage) && $linkImage !== '') {
            $userInput = $linkImage;
            if (empty($aiResponse) || $aiResponse === $linkImage) {
                $aiResponse = '';
            }
        }

        if (!empty($userInput) && !empty($aiResponse) && $userInput === $aiResponse) {
            $aiResponse = '';
        }

        return [
            $messageData['lineUuid'] ?? '',
            $messageData['chatSequence'] ?? '',
            $userInput,
            $aiResponse,
            $messageData['date'] ?? $messageData['time'] ?? '',
            $linkImage,
            $messageData['chatMode'] ?? '',
            $messageData['aiRead'] ?? '',
            $messageData['messageChannel'] ?? '',
            $messageData['messageId'] ?? '',
        ];
    }

    /**
     * Get next chatSequence for a lineUuid — delegates to EvanteApiService::getNextChatSequence().
     */
    public function getNextChatSequence(string $lineUuid): int
    {
        try {
            $result = $this->evante->getNextChatSequence($lineUuid);
            return (int) ($result['chatSequence'] ?? 1);
        } catch (\Exception $e) {
            Log::error('GoogleSheetsService::getNextChatSequence failed: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Check if messageId already exists — delegates to EvanteApiService::messageExists().
     */
    public function messageExists(string $messageId, string $sheetName = 'Sheet2'): bool
    {
        if ($messageId === '') {
            return false;
        }

        try {
            $result = $this->evante->messageExists($messageId);
            return (bool) ($result['exists'] ?? false);
        } catch (\Exception $e) {
            Log::warning('GoogleSheetsService::messageExists failed: ' . $e->getMessage(), ['messageId' => $messageId]);
            return false;
        }
    }

    /**
     * Backup message — delegates to EvanteApiService::postMessage().
     */
    public function backupMessage(array $messageData, string $sheetName = 'Chat_Backup'): array
    {
        try {
            $payload = array_merge($messageData, ['sheetName' => $sheetName]);
            $result  = $this->evante->postMessage($payload);

            if (!($result['success'] ?? false)) {
                Log::error('GoogleSheetsService::backupMessage failed', ['error' => $result['error'] ?? '']);
            }

            return $result;

        } catch (\Exception $e) {
            Log::error('GoogleSheetsService::backupMessage exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get conversations — delegates to EvanteApiService::getAllChats().
     */
    public function getConversations(string $sheetName = 'Sheet2', int $limit = 50): array
    {
        try {
            $result = $this->evante->getAllChats();

            if (!($result['success'] ?? false)) {
                return ['success' => false, 'error' => $result['error'] ?? '', 'data' => []];
            }

            $chats = $result['data'] ?? [];

            $groupedConversations = [];
            $count = 0;
            foreach ($chats as $chat) {
                $lineUuid = $chat['lineUuid'] ?? '';
                if ($lineUuid === '') {
                    continue;
                }

                $timeValue = $chat['time'] ?? $chat['date'] ?? '';

                $normalized = [
                    'lineUuid'       => $lineUuid,
                    'chatSequence'   => $chat['chatSequence'] ?? '',
                    'message'        => $chat['userInput'] ?? $chat['message'] ?? '',
                    'aiResponse'     => $chat['aiResponse'] ?? '',
                    'time'           => $timeValue,
                    'linkImage'      => $chat['linkImage'] ?? '',
                    'displayName'    => $chat['displayName'] ?? 'Unknown User',
                    'messageChannel' => $chat['messageChannel'] ?? 'LINE',
                    'chatMode'       => !empty($chat['aiResponse']) ? 'AI' : 'Manual',
                    'assignTeam'     => $chat['assignTeam'] ?? '',
                ];

                if (!isset($groupedConversations[$lineUuid]) ||
                    strtotime($timeValue) > strtotime($groupedConversations[$lineUuid]['time'])) {
                    $groupedConversations[$lineUuid] = $normalized;
                    $count++;
                }

                if ($count >= $limit) {
                    break;
                }
            }

            return [
                'success' => true,
                'data'    => array_values($groupedConversations),
                'total'   => count($groupedConversations),
                'message' => 'Conversations loaded from Evante API',
            ];

        } catch (\Exception $e) {
            Log::error('GoogleSheetsService::getConversations failed: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage(), 'data' => []];
        }
    }

    /**
     * Get available sheet names — kept for backward compatibility.
     * Returns empty list since sheets are no longer the data source.
     */
    public function getSheetNames(): array
    {
        return ['success' => true, 'sheets' => []];
    }
}
