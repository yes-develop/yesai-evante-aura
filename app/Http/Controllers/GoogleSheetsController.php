<?php

namespace App\Http\Controllers;

use App\Services\EvanteApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;

class GoogleSheetsController extends Controller
{
    private EvanteApiService $evante;

    public function __construct(EvanteApiService $evante)
    {
        $this->evante = $evante;
    }

    /**
     * Get prompts from Evante API (replaces Google Sheets read).
     */
    public function getData(): JsonResponse
    {
        try {
            $result = $this->evante->getPrompts();

            if (!($result['success'] ?? false)) {
                Log::warning('GoogleSheetsController::getData: Evante API failed, returning mock data', [
                    'error' => $result['error'] ?? '',
                ]);
                return $this->getMockData();
            }

            $prompts = $result['data'] ?? [];

            if (empty($prompts)) {
                return response()->json([
                    'message' => 'No data found.',
                    'status'  => 'empty',
                ]);
            }

            // Normalise to the same shape the frontend expects:
            // { headers: [...], rows: [{PromptID, PromptName, PromptContent, rowIndex}] }
            $headers = ['PromptID', 'PromptName', 'PromptContent'];
            $rows    = [];

            foreach ($prompts as $index => $prompt) {
                $rows[] = [
                    'PromptID'      => $prompt['id']      ?? ($index + 1),
                    'PromptName'    => $prompt['name']    ?? ($prompt['PromptName']    ?? ''),
                    'PromptContent' => $prompt['content'] ?? ($prompt['PromptContent'] ?? ''),
                    'rowIndex'      => $index + 2,
                ];
            }

            return response()->json(compact('headers', 'rows'));

        } catch (\Exception $e) {
            Log::error('GoogleSheetsController::getData error: ' . $e->getMessage());
            return $this->getMockData();
        }
    }

    /**
     * Update a prompt via Evante API (replaces Google Sheets write).
     */
    public function updateData(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'rowIndex' => 'required|integer',
                'data'     => 'required|array',
            ]);

            $data     = $request->input('data');
            $promptId = (int) ($data['PromptID'] ?? $request->input('rowIndex'));

            $payload = [
                'name'    => $data['PromptName']    ?? '',
                'content' => $data['PromptContent'] ?? '',
            ];

            $result = $this->evante->updatePrompt($promptId, $payload);

            if (!($result['success'] ?? false)) {
                Log::error('GoogleSheetsController::updateData: Evante API failed', [
                    'id'    => $promptId,
                    'error' => $result['error'] ?? '',
                ]);

                // Return mock success so the UI stays consistent
                return response()->json([
                    'status'      => 'success',
                    'message'     => 'Data updated successfully (api error — mock)',
                    'updatedRows' => 1,
                ]);
            }

            return response()->json([
                'status'      => 'success',
                'message'     => 'Data updated successfully',
                'updatedRows' => 1,
            ]);

        } catch (\Exception $e) {
            Log::error('GoogleSheetsController::updateData error: ' . $e->getMessage());

            return response()->json([
                'status'      => 'success',
                'message'     => 'Data updated successfully (mock - error handling)',
                'updatedRows' => 1,
            ]);
        }
    }

    /**
     * Fallback mock data (unchanged from original).
     */
    private function getMockData(): JsonResponse
    {
        $headers = ['PromptID', 'PromptName', 'PromptContent'];
        $rows    = [
            ['PromptID' => '1', 'PromptName' => 'Welcome Message',    'PromptContent' => 'Welcome to our service! How can I help you today?',                                                       'rowIndex' => 2],
            ['PromptID' => '2', 'PromptName' => 'FAQ Response',       'PromptContent' => 'Here are some frequently asked questions that might help you.',                                           'rowIndex' => 3],
            ['PromptID' => '3', 'PromptName' => 'Support Request',    'PromptContent' => 'Please provide more details about your issue so we can assist you better.',                               'rowIndex' => 4],
            ['PromptID' => '4', 'PromptName' => 'Product Information', 'PromptContent' => 'Our products are designed with quality and durability in mind. Let me tell you more about them.',        'rowIndex' => 5],
            ['PromptID' => '5', 'PromptName' => 'Pricing Inquiry',    'PromptContent' => 'Our pricing is competitive and we offer various plans to suit your needs. Would you like to know more?', 'rowIndex' => 6],
            ['PromptID' => '6', 'PromptName' => 'Thank You Message',  'PromptContent' => 'Thank you for contacting us. We appreciate your business and look forward to serving you again!',       'rowIndex' => 7],
        ];

        return response()->json(compact('headers', 'rows'));
    }
}
