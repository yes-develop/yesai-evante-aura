<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Response;

class VapiService
{
    private string $baseUrl = 'https://api.vapi.ai';
    private ?string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.vapi.api_key');
    }

    private function client()
    {
        return Http::withToken($this->apiKey)
            ->baseUrl($this->baseUrl)
            ->acceptJson();
    }

    public function getCallLogs(array $params = []): array
    {
        $response = $this->client()->get('/call', $params);
        return $response->successful() ? $response->json() : [];
    }

    public function getCall(string $callId): array
    {
        $response = $this->client()->get("/call/{$callId}");
        return $response->successful() ? $response->json() : [];
    }

    public function getTranscript(string $callId): array
    {
        $call = $this->getCall($callId);
        return data_get($call, 'transcript', []);
    }

    public function transferCall(string $callId, string $destination): array
    {
        $response = $this->client()->post("/call/{$callId}/transfer", [
            'destination' => ['type' => 'number', 'number' => $destination],
        ]);
        return $response->successful() ? $response->json() : ['error' => $response->body()];
    }

    public function endCall(string $callId): array
    {
        $response = $this->client()->delete("/call/{$callId}");
        return $response->successful() ? $response->json() : ['error' => $response->body()];
    }
}
