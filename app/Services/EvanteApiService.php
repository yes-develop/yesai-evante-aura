<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EvanteApiService
{
    private string $baseUrl;
    private string $apiKey;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.evante.url', 'http://localhost:8000'), '/');
        $this->apiKey  = config('services.evante.key', '');
    }

    // ─── Internal helpers ────────────────────────────────────────────────────

    private function http()
    {
        return Http::timeout(30)
            ->retry(2, 500)
            ->withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Accept'        => 'application/json',
                'Content-Type'  => 'application/json',
            ]);
    }

    // ─── Chat / Messages ─────────────────────────────────────────────────────

    /**
     * POST /api/v2/chat/messages
     */
    public function postMessage(array $data): array
    {
        try {
            $response = $this->http()->post("{$this->baseUrl}/api/v2/chat/messages", $data);

            if (!$response->successful()) {
                Log::error('EvanteApiService::postMessage failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                    'data'   => $data,
                ]);
                return ['success' => false, 'error' => $response->body(), 'status' => $response->status()];
            }

            return array_merge(['success' => true], $response->json() ?: []);

        } catch (\Throwable $e) {
            Log::error('EvanteApiService::postMessage exception', ['error' => $e->getMessage(), 'data' => $data]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * GET /api/v2/chat/sessions/{lineUuid}/messages
     */
    public function getMessages(string $lineUuid, ?int $limit = null): array
    {
        try {
            $params = $limit !== null ? ['limit' => $limit] : [];
            // Use token-based endpoint since lineUuid is a session_token string, not a numeric id
            $response = $this->http()->get("{$this->baseUrl}/api/v2/chat/sessions/token/{$lineUuid}/messages", $params);

            if (!$response->successful()) {
                Log::error('EvanteApiService::getMessages failed', [
                    'lineUuid' => $lineUuid,
                    'status'   => $response->status(),
                    'body'     => $response->body(),
                ]);
                return ['success' => false, 'error' => $response->body(), 'data' => []];
            }

            $json = $response->json() ?: [];
            // Normalize: evante returns {"messages":[...]} — map to data key
            if (isset($json['messages']) && !isset($json['data'])) {
                $json['data'] = $json['messages'];
            }

            return array_merge(['success' => true], $json);

        } catch (\Throwable $e) {
            Log::error('EvanteApiService::getMessages exception', ['lineUuid' => $lineUuid, 'error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage(), 'data' => []];
        }
    }

    /**
     * GET /api/v2/chat/sessions  (returns one entry per session with latest message + unread count)
     */
    public function getAllChats(?string $since = null): array
    {
        try {
            $params = $since !== null ? ['since' => $since] : [];
            $response = $this->http()->get("{$this->baseUrl}/api/v2/chat/sessions", $params);

            if (!$response->successful()) {
                Log::error('EvanteApiService::getAllChats failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return ['success' => false, 'error' => $response->body(), 'data' => []];
            }

            $json = $response->json() ?: [];
            // Normalize: evante returns {"sessions":[...]} — map to data key
            if (isset($json['sessions']) && !isset($json['data'])) {
                $json['data'] = $json['sessions'];
            }

            return array_merge(['success' => true], $json);

        } catch (\Throwable $e) {
            Log::error('EvanteApiService::getAllChats exception', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage(), 'data' => []];
        }
    }

    /**
     * PATCH /api/v2/chat/sessions/{lineUuid}/viewed
     */
    public function markConversationViewed(string $lineUuid): array
    {
        try {
            $response = $this->http()->patch("{$this->baseUrl}/api/v2/chat/sessions/token/{$lineUuid}/viewed");

            if (!$response->successful()) {
                Log::error('EvanteApiService::markConversationViewed failed', [
                    'lineUuid' => $lineUuid,
                    'status'   => $response->status(),
                    'body'     => $response->body(),
                ]);
                return ['success' => false, 'error' => $response->body()];
            }

            return array_merge(['success' => true], $response->json() ?: []);

        } catch (\Throwable $e) {
            Log::error('EvanteApiService::markConversationViewed exception', ['lineUuid' => $lineUuid, 'error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * GET /api/v2/chat/sessions/{lineUuid}/next-sequence
     */
    public function getNextChatSequence(string $lineUuid): array
    {
        try {
            $response = $this->http()->get("{$this->baseUrl}/api/v2/chat/sessions/token/{$lineUuid}/next-sequence");

            if (!$response->successful()) {
                Log::error('EvanteApiService::getNextChatSequence failed', [
                    'lineUuid' => $lineUuid,
                    'status'   => $response->status(),
                    'body'     => $response->body(),
                ]);
                return ['success' => false, 'error' => $response->body(), 'chatSequence' => 1];
            }

            return array_merge(['success' => true], $response->json() ?: ['chatSequence' => 1]);

        } catch (\Throwable $e) {
            Log::error('EvanteApiService::getNextChatSequence exception', ['lineUuid' => $lineUuid, 'error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage(), 'chatSequence' => 1];
        }
    }

    /**
     * GET /api/v2/chat/messages/{messageId}/exists
     */
    public function messageExists(string $messageId): array
    {
        try {
            $response = $this->http()->get("{$this->baseUrl}/api/v2/chat/messages/{$messageId}/exists");

            if (!$response->successful()) {
                Log::error('EvanteApiService::messageExists failed', [
                    'messageId' => $messageId,
                    'status'    => $response->status(),
                    'body'      => $response->body(),
                ]);
                return ['success' => false, 'error' => $response->body(), 'exists' => false];
            }

            return array_merge(['success' => true], $response->json() ?: ['exists' => false]);

        } catch (\Throwable $e) {
            Log::error('EvanteApiService::messageExists exception', ['messageId' => $messageId, 'error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage(), 'exists' => false];
        }
    }

    // ─── Prompts ─────────────────────────────────────────────────────────────

    /**
     * GET /api/v2/prompts
     */
    public function getPrompts(): array
    {
        try {
            $response = $this->http()->get("{$this->baseUrl}/api/v2/prompts");

            if (!$response->successful()) {
                Log::error('EvanteApiService::getPrompts failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return ['success' => false, 'error' => $response->body(), 'data' => []];
            }

            return array_merge(['success' => true], $response->json() ?: ['data' => []]);

        } catch (\Throwable $e) {
            Log::error('EvanteApiService::getPrompts exception', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage(), 'data' => []];
        }
    }

    /**
     * PUT /api/v2/prompts/{id}
     */
    public function updatePrompt(int $id, array $data): array
    {
        try {
            $response = $this->http()->put("{$this->baseUrl}/api/v2/prompts/{$id}", $data);

            if (!$response->successful()) {
                Log::error('EvanteApiService::updatePrompt failed', [
                    'id'     => $id,
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return ['success' => false, 'error' => $response->body()];
            }

            return array_merge(['success' => true], $response->json() ?: []);

        } catch (\Throwable $e) {
            Log::error('EvanteApiService::updatePrompt exception', ['id' => $id, 'error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // ─── Contacts / Labels ───────────────────────────────────────────────────

    /**
     * GET /api/v2/contacts
     */
    public function getContacts(?array $labels = null): array
    {
        try {
            $params = $labels !== null ? ['labels' => implode(',', $labels)] : [];
            $response = $this->http()->get("{$this->baseUrl}/api/v2/contacts", $params);

            if (!$response->successful()) {
                Log::error('EvanteApiService::getContacts failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return ['success' => false, 'error' => $response->body(), 'data' => []];
            }

            return array_merge(['success' => true], $response->json() ?: ['data' => []]);

        } catch (\Throwable $e) {
            Log::error('EvanteApiService::getContacts exception', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage(), 'data' => []];
        }
    }

    /**
     * GET /api/v2/contacts/labels
     */
    public function getLabels(): array
    {
        try {
            $response = $this->http()->get("{$this->baseUrl}/api/v2/contacts/labels");

            if (!$response->successful()) {
                Log::error('EvanteApiService::getLabels failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return ['success' => false, 'error' => $response->body(), 'data' => []];
            }

            return array_merge(['success' => true], $response->json() ?: ['data' => []]);

        } catch (\Throwable $e) {
            Log::error('EvanteApiService::getLabels exception', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage(), 'data' => []];
        }
    }

    // ─── Monitoring ──────────────────────────────────────────────────────────

    /**
     * GET /api/v2/monitoring/kpis
     */
    public function getDashboardKPIs(string $filter = 'today'): array
    {
        try {
            $response = $this->http()->get("{$this->baseUrl}/api/v2/monitoring/kpis", ['filter' => $filter]);

            if (!$response->successful()) {
                Log::error('EvanteApiService::getDashboardKPIs failed', [
                    'filter' => $filter,
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return ['success' => false, 'error' => $response->body(), 'data' => []];
            }

            return array_merge(['success' => true], $response->json() ?: ['data' => []]);

        } catch (\Throwable $e) {
            Log::error('EvanteApiService::getDashboardKPIs exception', ['error' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage(), 'data' => []];
        }
    }
}
