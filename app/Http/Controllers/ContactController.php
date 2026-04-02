<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    private $spreadsheetId;
    private $apiKey;
    private $range = 'Sheet1';

    public function __construct()
    {
        $this->spreadsheetId = config('services.google_sheets.contacts_sheet_id');
        $this->apiKey        = config('services.google_sheets.api_key');
    }

    private $requiredColumns = [
        'lineuuid',
        'status',
        'sequence',
        'profile name',
        'messagechannel',
        'label',
        'profile image',
        'unreadchat',
        'color',
        'phone',
        'email',
        'note',
        'create date'
    ];

    public function index()
    {
        try {
            $response = Http::withoutVerifying()->get("https://sheets.googleapis.com/v4/spreadsheets/{$this->spreadsheetId}/values/{$this->range}", [
                'key' => $this->apiKey
            ]);

            if (!$response->successful()) {
                throw new \Exception('Failed to fetch data from Google Sheets');
            }

            $data = $response->json();
            $values = $data['values'] ?? [];

            if (empty($values)) {
                $contacts = [];
                $headers = $this->requiredColumns;
            } else {
                // Get headers from first row
                $originalHeaders = array_shift($values);
                
                // Create a map of column indexes for required columns
                $columnIndexes = [];
                foreach ($this->requiredColumns as $required) {
                    $index = array_search(strtolower($required), array_map('strtolower', $originalHeaders));
                    if ($index !== false) {
                        $columnIndexes[$required] = $index;
                    }
                }

                // Filter and map the data
                $contacts = array_map(function($row) use ($columnIndexes) {
                    $contact = [];
                    foreach ($columnIndexes as $header => $index) {
                        $contact[$header] = $row[$index] ?? '';
                    }
                    $contact['id'] = md5($row[array_values($columnIndexes)[0]]); // Using first column as ID
                    return $contact;
                }, $values);
            }

            return view('message.contacts', [
                'contacts' => $contacts,
                'headers' => $this->requiredColumns
            ]);
        } catch (\Exception $e) {
            Log::error('Google Sheets Error: ' . $e->getMessage());
            return back()->with('error', 'Error fetching data from Google Sheets: ' . $e->getMessage());
        }
    }
} 