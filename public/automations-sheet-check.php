<?php
// ตรวจสอบว่าต้องการผลลัพธ์เป็น JSON หรือไม่
$outputJson = true;
if (isset($_GET['format']) && $_GET['format'] === 'html') {
    $outputJson = false;
    header('Content-Type: text/html; charset=UTF-8');
} else {
    header('Content-Type: application/json');
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// ตั้งค่า Timezone
date_default_timezone_set('Asia/Bangkok'); // +7 GMT

// Google Sheets Configuration — read from server environment variables
$SHEET_ID = getenv('GOOGLE_SHEETS_ID') ?: '';
$API_KEY = getenv('GOOGLE_SHEETS_API_KEY') ?: '';
$WEBHOOK_URL = getenv('MAKE_WEBHOOK_AUTOMATIONS_URL') ?: '';

// ฟังก์ชันสำหรับแสดงผล
function display($message, $endLine = true) {
    global $outputJson;
    if (!$outputJson) {
        echo $message . ($endLine ? '<br>' : '');
    }
}

// ฟังก์ชันแปลงวันที่จาก ISO format ให้ทำงานกับปัจจุบันเท่านั้น (ไม่สนใจอนาคต)
function parseIsoDate($dateStr) {
    // รูปแบบ ISO 8601 (เช่น 2025-04-09T02:56:44.427Z) โดย Z คือ UTC (GMT+0)
    $timestamp = strtotime($dateStr);
    
    // ถ้าวันที่ในอนาคต (เช่น 2025) ให้ใช้วันปัจจุบันแทน
    $currentYear = (int)date('Y');
    $dateYear = (int)date('Y', $timestamp);
    
    if ($dateYear > $currentYear) {
        // ถ้าปีในอนาคต ให้ใช้วันที่ปัจจุบัน แต่เก็บเวลาเดิมไว้
        $currentDate = date('Y-m-d', time());
        $originalTime = date('H:i:s', $timestamp);
        $newDateStr = $currentDate . 'T' . $originalTime . '.000Z';
        $timestamp = strtotime($newDateStr);
    }
    
    // ถ้าวันที่มี Z หรือ +00:00 แสดงว่าเป็น UTC ให้แปลงเป็นเวลาไทย
    if (strpos($dateStr, 'Z') !== false || strpos($dateStr, '+00:00') !== false) {
        // แปลงจาก UTC เป็นเวลาไทย (+7 ชั่วโมง)
        $debug = [
            'original' => $dateStr,
            'timestamp' => $timestamp,
            'utc_time' => gmdate('Y-m-d H:i:s', $timestamp),
            'thai_time' => date('Y-m-d H:i:s', $timestamp), // เวลาไทยโดยอัตโนมัติเพราะเรากำหนด timezone แล้ว
            'is_utc' => true
        ];
        return ['timestamp' => $timestamp, 'debug' => $debug];
    }
    
    // ถ้าไม่มีการระบุ timezone ให้ถือว่าเป็น timezone ปัจจุบัน (ไทย)
    $debug = [
        'original' => $dateStr,
        'timestamp' => $timestamp,
        'thai_time' => date('Y-m-d H:i:s', $timestamp),
        'is_utc' => false
    ];
    return ['timestamp' => $timestamp, 'debug' => $debug];
}

// แสดงข้อมูลสำคัญเมื่อเรียกในรูปแบบ HTML
if (!$outputJson) {
    display("<h2>ตรวจสอบ Automations Sheet</h2>");
    display("Timezone: " . date_default_timezone_get() . " (GMT+7)");
    display("เวลาปัจจุบัน: " . date('Y-m-d H:i:s'));
    display("<hr>");
}

// ดำเนินการตรวจสอบ automations
function checkAutomations() {
    global $SHEET_ID, $API_KEY, $WEBHOOK_URL;
    
    try {
        // ดึงข้อมูลจาก Google Sheet
        $sheetUrl = "https://sheets.googleapis.com/v4/spreadsheets/{$SHEET_ID}/values/automation?key={$API_KEY}";
        $data = fetchSheetData($sheetUrl);
        
        if (!isset($data['values']) || count($data['values']) <= 1) {
            return [
                'status' => 'success',
                'message' => 'No data found or only headers',
                'changes' => []
            ];
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
                
                // แปลงวันที่รูปแบบ ISO 8601 ด้วยฟังก์ชันที่สร้างไว้ (รองรับ timezone ไทย)
                $parsedDate = parseIsoDate($lastModifyDateStr);
                $lastModifyDate = $parsedDate['timestamp'];
                
                // เก็บข้อมูลดีบัก
                $rowDebugInfo = [
                    'row' => $i + 1,
                    'date_string' => $lastModifyDateStr,
                    'parsed_timestamp' => $lastModifyDate,
                    'parsed_date' => date('Y-m-d H:i:s', $lastModifyDate),
                    'current_time' => time(),
                    'current_date' => date('Y-m-d H:i:s'),
                ];
                
                // เพิ่มข้อมูล timezone
                if (isset($parsedDate['debug']['is_utc']) && $parsedDate['debug']['is_utc']) {
                    $rowDebugInfo['timezone'] = 'UTC (แปลงเป็นเวลาไทยแล้ว)';
                    if (isset($parsedDate['debug']['utc_time'])) {
                        $rowDebugInfo['utc_time'] = $parsedDate['debug']['utc_time'];
                    }
                } else {
                    $rowDebugInfo['timezone'] = 'Thai (Asia/Bangkok)';
                }
                
                // ตรวจสอบว่าวันที่ถูกต้องหรือไม่
                if ($lastModifyDate !== false) {
                    // ปรับการคำนวณเวลาสำหรับการตรวจสอบ automation
                    $currentTime = time();
                    
                    // ถ้าวันที่ที่มาจาก sheet เป็นในอนาคต (เช่น 2025) ให้คำนวณแบบสัมพัทธ์
                    // โดยใช้เวลาในวันนี้แทน
                    $dateYear = (int)date('Y', $lastModifyDate);
                    $currentYear = (int)date('Y');
                    
                    if ($dateYear > $currentYear) {
                        // ถ้าปีอยู่ในอนาคต ให้ใช้วันเดือนปีปัจจุบันแทน แต่เก็บเวลา (ชั่วโมง:นาที:วินาที) เดิมไว้
                        $lastModifyHMS = date('H:i:s', $lastModifyDate);
                        $currentDate = date('Y-m-d');
                        $adjustedDateTime = $currentDate . ' ' . $lastModifyHMS;
                        $adjustedTimestamp = strtotime($adjustedDateTime);
                        
                        // ใช้เวลาที่ปรับแล้วในการคำนวณ
                        $diffMinutes = floor(($currentTime - $adjustedTimestamp) / 60);
                        $rowDebugInfo['adjusted_date'] = $adjustedDateTime;
                        $rowDebugInfo['adjusted_timestamp'] = $adjustedTimestamp;
                        $rowDebugInfo['calculation_note'] = 'ปรับปีที่อยู่ในอนาคตให้เป็นปีปัจจุบัน';
                    } else {
                        // กรณีปกติ คำนวณแบบเดิม
                        $diffMinutes = floor(($currentTime - $lastModifyDate) / 60);
                    }
                    
                    $rowDebugInfo['diff_minutes'] = $diffMinutes;
                    
                    // ถ้าเวลาผ่านไปมากกว่า 5 นาที
                    if ($diffMinutes > 5) {
                        // พยายามเปลี่ยนค่าในคอลัมน์ C (index 2) เป็น empty (option manual chat)
                        $rowIndex = $i + 1;
                        
                        // เพิ่มข้อมูลดีบักเพื่อตรวจสอบการคำนวณเวลา
                        if (isset($_GET['debug']) && $_GET['debug'] === 'time') {
                            $debugData = [
                                'original' => $lastModifyDateStr,
                                'parsed_year' => date('Y', $lastModifyDate),
                                'current_year' => date('Y'),
                                'fixed_timestamp' => $lastModifyDate,
                                'fixed_date_time' => date('Y-m-d H:i:s', $lastModifyDate),
                                'current_timestamp' => $currentTime,
                                'current_date_time' => date('Y-m-d H:i:s', $currentTime),
                                'diff_minutes' => $diffMinutes,
                                'threshold' => 5,
                                'exceeds_threshold' => ($diffMinutes > 5)
                            ];
                            
                            header('Content-Type: application/json');
                            echo json_encode($debugData, JSON_PRETTY_PRINT);
                            exit();
                        }
                        
                        $updated = updateCellValue($rowIndex, 'C', '');
                        
                        $rowDebugInfo['update_success'] = $updated;
                        $needToSendWebhook = true;
                        
                        echo $lastModifyDateStr." : ".$currentTime." : ".$diffMinutes;
                        exit();
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
                } else {
                    $rowDebugInfo['error'] = 'Failed to parse date';
                }
                
                $debugInfo[] = $rowDebugInfo;
            }
        }
        
        // ถ้ามีรายการที่ต้องอัปเดต ส่งข้อมูลไปยัง webhook
        if ($needToSendWebhook) {
            $webhookSuccess = sendToWebhook($changedRows);
            return [
                'status' => 'success',
                'message' => 'Changes detected and sent to webhook',
                'webhook_status' => $webhookSuccess ? 'sent' : 'failed',
                'changes' => $changedRows,
                'debug' => $debugInfo
            ];
        } else {
            return [
                'status' => 'success',
                'message' => 'No changes needed',
                'changes' => [],
                'debug' => $debugInfo
            ];
        }
    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }
}

// ฟังก์ชันดึงข้อมูลจาก Google Sheet
function fetchSheetData($url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        throw new Exception(curl_error($ch));
    }
    
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpcode != 200) {
        throw new Exception("API returned error code: {$httpcode}");
    }
    
    return json_decode($response, true);
}

// ฟังก์ชันอัปเดตค่าในเซลล์
function updateCellValue($rowIndex, $columnLetter, $newValue) {
    global $SHEET_ID, $API_KEY;
    
    // สร้าง range สำหรับการอัปเดต
    $range = "automation!{$columnLetter}{$rowIndex}";
    
    // สร้างข้อมูลสำหรับการอัปเดต
    $updateData = [
        'range' => $range,
        'values' => [[$newValue]],
        'majorDimension' => 'ROWS'
    ];
    
    try {
        // ทำการอัปเดตผ่าน Google Sheets API
        $url = "https://sheets.googleapis.com/v4/spreadsheets/{$SHEET_ID}/values/{$range}?key={$API_KEY}&valueInputOption=RAW";
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        // บันทึกข้อมูลการอัปเดตลงในไฟล์ log (สำหรับการดีบัก)
        file_put_contents('sheet_update_log.txt', 
            date('Y-m-d H:i:s') . " - Update cell {$range} to '{$newValue}' - Response code: {$httpcode}" . PHP_EOL . 
            "Response: " . $response . PHP_EOL .
            "Error: " . $error . PHP_EOL . 
            "---------------------------" . PHP_EOL, 
            FILE_APPEND
        );
        
        // แม้ว่าการอัปเดตอาจไม่สำเร็จโดยตรง แต่เราจะส่งข้อมูลไปยัง webhook เพื่อให้ระบบอื่นดำเนินการต่อ
        return true;
    } catch (Exception $e) {
        file_put_contents('sheet_update_error.txt', 
            date('Y-m-d H:i:s') . " - Error updating cell {$range}: " . $e->getMessage() . PHP_EOL, 
            FILE_APPEND
        );
        return false;
    }
}

// ฟังก์ชันส่งข้อมูลไปยัง webhook
function sendToWebhook($data) {
    global $WEBHOOK_URL, $SHEET_ID;
    
    $payload = [
        'changes' => $data,
        'timestamp' => date('c'),
        'sheet_id' => $SHEET_ID
    ];
    
    $ch = curl_init($WEBHOOK_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        curl_close($ch);
        return false;
    }
    
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ($httpcode >= 200 && $httpcode < 300);
}

// ดำเนินการตรวจสอบและส่งผลลัพธ์กลับไป
$result = checkAutomations();

// แสดงผลลัพธ์
if (!$outputJson) {
    display("<h2>ผลการตรวจสอบ Automations</h2>");
    display("Status: " . $result['status']);
    display("Message: " . $result['message']);
    
    if (isset($result['webhook_status'])) {
        display("Webhook Status: " . $result['webhook_status']);
    }
    
    if (isset($result['changes']) && count($result['changes']) > 0) {
        display("<h3>รายการที่มีการเปลี่ยนแปลง (" . count($result['changes']) . " รายการ)</h3>");
        display("<table border='1' style='border-collapse: collapse; width: 100%;'>");
        display("<tr><th>Row</th><th>Line UUID</th><th>Original Value</th><th>New Value</th><th>Last Modified</th><th>Diff Minutes</th><th>Update Success</th></tr>");
        
        foreach ($result['changes'] as $change) {
            display("<tr>", false);
            display("<td>{$change['row']}</td>", false);
            display("<td>{$change['lineUuid']}</td>", false);
            display("<td>{$change['original_value']}</td>", false);
            display("<td>{$change['new_value']}</td>", false);
            display("<td>{$change['last_modified']}</td>", false);
            display("<td>{$change['diff_minutes']}</td>", false);
            display("<td>" . ($change['update_in_sheet'] ? 'Yes' : 'No') . "</td>", false);
            display("</tr>");
        }
        
        display("</table>");
    }
    
    if (isset($result['debug']) && count($result['debug']) > 0) {
        display("<h3>Debug Information (" . count($result['debug']) . " รายการ)</h3>");
        display("<table border='1' style='border-collapse: collapse; width: 100%;'>");
        display("<tr><th>Row</th><th>Date String</th><th>Timezone</th><th>Parsed Date</th><th>Current Time</th><th>Diff Minutes</th><th>Status</th></tr>");
        
        foreach ($result['debug'] as $debug) {
            display("<tr>", false);
            display("<td>{$debug['row']}</td>", false);
            display("<td>{$debug['date_string']}</td>", false);
            display("<td>" . (isset($debug['timezone']) ? $debug['timezone'] : 'Unknown') . "</td>", false);
            display("<td>{$debug['parsed_date']}</td>", false);
            display("<td>{$debug['current_date']}</td>", false);
            display("<td>" . (isset($debug['diff_minutes']) ? $debug['diff_minutes'] : 'N/A') . "</td>", false);
            
            $status = 'OK';
            if (isset($debug['error'])) {
                $status = "Error: {$debug['error']}";
            } elseif (isset($debug['update_success'])) {
                $status = $debug['update_success'] ? 'Updated' : 'Update Failed';
            }
            
            display("<td>{$status}</td>", false);
            display("</tr>");
        }
        
        display("</table>");
    }
    
    display("<p>หมายเหตุ: สามารถเรียกใช้งานใน format JSON ได้โดยเข้าผ่าน URL โดยไม่มี parameter ?format=html</p>");
} else {
    echo json_encode($result);
} 