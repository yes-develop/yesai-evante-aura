<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AutomationsSheetController extends Controller
{
    // Google Sheets Configuration
    protected $sheetId;
    protected $apiKey;
    protected $webhookUrl;

    public function __construct()
    {
        $this->sheetId = config('services.google_sheets.id', '');
        $this->apiKey = config('services.google_sheets.api_key', '');
        $this->webhookUrl = config('services.make.webhook_url', '');
    }
    
    /**
     * Check and update Google Sheet automations.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkAutomations()
    {
        try {
            // ดึงข้อมูลจาก Google Sheet
            $sheetUrl = "https://sheets.googleapis.com/v4/spreadsheets/{$this->sheetId}/values/automation?key={$this->apiKey}";
            $response = Http::get($sheetUrl);
            
            if (!$response->successful()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to fetch data from Google Sheet: ' . $response->status()
                ], 500);
            }
            
            $data = $response->json();
            
            if (!isset($data['values']) || count($data['values']) <= 1) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'No data found or only headers',
                    'changes' => []
                ]);
            }
            
            // ข้อมูลที่มีการเปลี่ยนแปลงจะถูกส่งไปยัง webhook
            $changedRows = [];
            $debugInfo = [];
            $needToSendWebhook = false;
            
            // เริ่มจากแถวที่ 2 (หลังจากแถวหัวข้อ)
            for ($i = 1; $i < count($data['values']); $i++) {
                $row = $data['values'][$i];
                
                // ตรวจสอบว่ามีข้อมูลในคอลัมน์ E (index 4) หรือไม่
                if (isset($row[4]) && !empty($row[4])) {
                    // ตรวจสอบว่า Status (คอลัมน์ C, index 2) เป็น "manual chat" หรือไม่
                    $status = isset($row[2]) ? trim($row[2]) : '';
                    if ($status !== 'manual chat') {
                        continue; // ข้ามไปแถวถัดไปถ้าไม่ใช่ manual chat
                    }
                    
                    // แปลงวันที่จาก string เป็น timestamp
                    $lastModifyDateStr = $row[4];
                    
                    // แปลงวันที่รูปแบบ ISO 8601 (เช่น 2025-04-09T02:56:44.427Z)
                    try {
                        $lastModifyDate = Carbon::parse($lastModifyDateStr);
                        $currentTime = Carbon::now();
                        $diffMinutes = $currentTime->diffInMinutes($lastModifyDate);
                    } catch (\Exception $e) {
                        // ถ้าแปลงไม่ได้ ให้ลองวิธีอื่น
                        $lastModifyDate = Carbon::parse($lastModifyDateStr);
                        $currentTime = Carbon::now();
                        $diffMinutes = $currentTime->diffInMinutes($lastModifyDate);
                    }
                    
                    // เก็บข้อมูลดีบัก
                    $rowDebugInfo = [
                        'row' => $i + 1,
                        'date_string' => $lastModifyDateStr,
                        'parsed_time' => $lastModifyDate->toDateTimeString(),
                        'current_time' => $currentTime->toDateTimeString(),
                        'diff_minutes' => $diffMinutes,
                    ];
                    
                    // ถ้าเวลาผ่านไปมากกว่า 5 นาที
                    if ($diffMinutes > 5) {
                        // พยายามเปลี่ยนค่าในคอลัมน์ C (index 2) เป็น empty (option manual chat)
                        $rowIndex = $i + 1;
                        $updated = $this->updateCellValue($rowIndex, 'C', '');
                        
                        $rowDebugInfo['update_success'] = $updated;
                        $needToSendWebhook = true;
                        
                        // เพิ่มข้อมูลที่เปลี่ยนแปลงเพื่อส่งไปยัง webhook
                        $changedRows[] = [
                            'row' => $rowIndex,
                            'lineUuid' => isset($row[0]) ? $row[0] : '',
                            'original_value' => isset($row[2]) ? $row[2] : '',
                            'new_value' => '',
                            'last_modified' => $lastModifyDateStr,
                            'diff_minutes' => $diffMinutes,
                            'update_in_sheet' => $updated
                        ];
                    }
                    
                    $debugInfo[] = $rowDebugInfo;
                }
            }
            
            // ถ้ามีรายการที่ต้องอัปเดต ส่งข้อมูลไปยัง webhook
            if ($needToSendWebhook) {
                $webhookSuccess = $this->sendToWebhook($changedRows);
                return response()->json([
                    'status' => 'success',
                    'message' => 'Changes detected and sent to webhook',
                    'webhook_status' => $webhookSuccess ? 'sent' : 'failed',
                    'changes' => $changedRows,
                    'debug' => $debugInfo
                ]);
            } else {
                return response()->json([
                    'status' => 'success',
                    'message' => 'No changes needed',
                    'changes' => [],
                    'debug' => $debugInfo
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
    
    /**
     * ฟังก์ชันอัปเดตค่าในเซลล์
     *
     * @param int $rowIndex
     * @param string $columnLetter
     * @param string $newValue
     * @return bool
     */
    protected function updateCellValue($rowIndex, $columnLetter, $newValue)
    {
        try {
            // สร้าง range สำหรับการอัปเดต
            $range = "automation!{$columnLetter}{$rowIndex}";
            
            // สร้างข้อมูลสำหรับการอัปเดต
            $updateData = [
                'range' => $range,
                'values' => [[$newValue]],
                'majorDimension' => 'ROWS'
            ];
            
            // ทำการอัปเดตผ่าน Google Sheets API
            $url = "https://sheets.googleapis.com/v4/spreadsheets/{$this->sheetId}/values/{$range}?key={$this->apiKey}&valueInputOption=RAW";
            
            $response = Http::put($url, $updateData);
            
            // บันทึกข้อมูลการอัปเดตลงในไฟล์ log (สำหรับการดีบัก)
            Log::info("Update cell {$range} to '{$newValue}' - Response code: {$response->status()}", [
                'response' => $response->json(),
                'time' => Carbon::now()->toDateTimeString()
            ]);
            
            // แม้ว่าการอัปเดตอาจไม่สำเร็จโดยตรง แต่เราจะส่งข้อมูลไปยัง webhook เพื่อให้ระบบอื่นดำเนินการต่อ
            return $response->successful();
        } catch (\Exception $e) {
            Log::error("Error updating cell {$range}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * ฟังก์ชันส่งข้อมูลไปยัง webhook
     *
     * @param array $data
     * @return bool
     */
    protected function sendToWebhook($data)
    {
        try {
            $payload = [
                'changes' => $data,
                'timestamp' => Carbon::now()->toIso8601String(),
                'sheet_id' => $this->sheetId
            ];
            
            $response = Http::post($this->webhookUrl, $payload);
            
            Log::info('Webhook response:', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            
            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Error sending to webhook: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * API endpoint สำหรับตรวจสอบ automation (สำหรับเรียกผ่าน Cron job หรือ Postman)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function check(Request $request)
    {
        return $this->checkAutomations();
    }
} 