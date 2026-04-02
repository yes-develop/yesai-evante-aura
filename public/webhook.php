
<?php
// Simple LINE webhook that bypasses Laravel completely
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Function to download LINE content and get actual URL
function downloadLINEContent($messageId, $baseUrl) {
    try {
        $downloadUrl = rtrim($baseUrl, '/') . "/api/line-image/{$messageId}";

        // Make request to download endpoint
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $downloadUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            $responseData = json_decode($response, true);
            if (isset($responseData['success']) && !$responseData['success']) {
                return "LINE_CONTENT:{$messageId}";
            }

            foreach (['url', 'imageUrl', 'fileUrl'] as $key) {
                if (!empty($responseData[$key])) {
                    return $responseData[$key];
                }
            }
        }

        // Fallback to placeholder if download fails
        return "LINE_CONTENT:{$messageId}";

    } catch (Exception $e) {
        // Fallback to placeholder if error occurs
        return "LINE_CONTENT:{$messageId}";
    }
}

// Log all requests for debugging
$logFile = __DIR__ . '/webhook_debug.log';
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestBody = file_get_contents('php://input');
$timestamp = date('Y-m-d H:i:s');

file_put_contents($logFile, "[$timestamp] $requestMethod - Body: $requestBody\n", FILE_APPEND | LOCK_EX);

// Handle GET (webhook verification)
if ($requestMethod === 'GET') {
    echo 'OK';
    exit;
}

// Handle POST (actual webhook)
if ($requestMethod === 'POST') {
    try {
        $data = json_decode($requestBody, true);
        
        if (!$data || !isset($data['events'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data']);
            exit;
        }
        
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
        $baseUrl = "{$protocol}://{$host}";

        foreach ($data['events'] as $event) {
            if ($event['type'] === 'message') {
                $lineUuid = $event['source']['userId'] ?? null;
                $messageId = $event['message']['id'];
                $timestamp = $event['timestamp'];
                $messageType = $event['message']['type'] ?? 'unknown';
                
                if (!$lineUuid) continue;
                
                $messageText = '';
                $linkImage = '';
                
                // Handle different message types
                if ($messageType === 'text' && isset($event['message']['text'])) {
                    $messageText = $event['message']['text'];
                } elseif ($messageType === 'image') {
                    $messageText = '🖼️ Image';
                    // Download LINE image and get actual URL
                    $linkImage = downloadLINEContent($messageId, $baseUrl);
                } elseif ($messageType === 'video') {
                    $messageText = '🎥 Video';
                    $linkImage = downloadLINEContent($messageId, $baseUrl);
                } elseif ($messageType === 'audio') {
                    $messageText = '🎵 Audio';
                    $linkImage = downloadLINEContent($messageId, $baseUrl);
                } elseif ($messageType === 'file') {
                    $messageText = '📎 File';
                    $linkImage = downloadLINEContent($messageId, $baseUrl);
                } elseif ($messageType === 'sticker') {
                    $messageText = '😊 Sticker';
                } else {
                    $messageText = "📝 {$messageType} message";
                }
                
                // Check for duplicate via Evante API
                $isDuplicateMessage = false;
                try {
                    $evanteApiUrl = getenv('EVANTE_API_URL') ?: 'http://localhost:8000';
                    $evanteApiKey = getenv('EVANTE_API_KEY') ?: '';
                    $existsCh = curl_init();
                    curl_setopt($existsCh, CURLOPT_URL, rtrim($evanteApiUrl, '/') . "/api/v2/chat/messages/{$messageId}/exists");
                    curl_setopt($existsCh, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($existsCh, CURLOPT_TIMEOUT, 5);
                    curl_setopt($existsCh, CURLOPT_HTTPHEADER, [
                        'Accept: application/json',
                        'Authorization: Bearer ' . $evanteApiKey,
                    ]);
                    $existsResponse = curl_exec($existsCh);
                    curl_close($existsCh);
                    if ($existsResponse) {
                        $existsData = json_decode($existsResponse, true);
                        if (!empty($existsData['exists'])) {
                            $isDuplicateMessage = true;
                        }
                    }
                } catch (Exception $e) {
                    // Continue on error — don't block the webhook
                }

                if ($isDuplicateMessage) {
                    $logMessage = "[$timestamp] Duplicate message detected for {$lineUuid} (messageId: {$messageId}) - skipping insert\n";
                    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
                    continue;
                }

                // Get next chat sequence via Evante API
                $nextChatSequence = 1;
                try {
                    $seqCh = curl_init();
                    curl_setopt($seqCh, CURLOPT_URL, rtrim($evanteApiUrl, '/') . "/api/v2/chat/sessions/{$lineUuid}/next-sequence");
                    curl_setopt($seqCh, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($seqCh, CURLOPT_TIMEOUT, 5);
                    curl_setopt($seqCh, CURLOPT_HTTPHEADER, [
                        'Accept: application/json',
                        'Authorization: Bearer ' . $evanteApiKey,
                    ]);
                    $seqResponse = curl_exec($seqCh);
                    curl_close($seqCh);
                    if ($seqResponse) {
                        $seqData = json_decode($seqResponse, true);
                        if (!empty($seqData['chatSequence'])) {
                            $nextChatSequence = (int) $seqData['chatSequence'];
                        }
                    }
                } catch (Exception $e) {
                    // Use fallback
                }

                // Build message payload and post via Evante API
                $chatMessage = [
                    'lineUuid'      => $lineUuid,
                    'chatSequence'  => $nextChatSequence,
                    'userInput'     => $messageText,
                    'aiResponse'    => '',
                    'time'          => date('c', $timestamp / 1000),
                    'linkImage'     => $linkImage,
                    'chatMode'      => 'Waiting response',
                    'aiRead'        => 'FALSE',
                    'messageChannel' => 'Line',
                    'displayName'   => 'LINE User',
                    'messageId'     => $messageId,
                    'messageType'   => $messageType,
                    'timestamp'     => $timestamp,
                    'source'        => 'WEBHOOK_DIRECT',
                ];

                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, rtrim($evanteApiUrl, '/') . '/api/v2/chat/messages');
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($chatMessage));
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 10);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Content-Type: application/json',
                    'Accept: application/json',
                    'Authorization: Bearer ' . $evanteApiKey,
                ]);
                $response = curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                
                // Backup to Google Sheets (async, non-blocking)
                try {
                    $sheetBackupData = [
                        'lineUuid' => $lineUuid,
                        'chatSequence' => $nextChatSequence,
                        'userInput' => $messageText,
                        'aiResponse' => '',
                        'date' => date('c', $timestamp / 1000),
                        'linkImage' => $linkImage,
                        'chatMode' => 'Waiting response',
                        'aiRead' => 'FALSE',
                        'messageChannel' => 'Line',
                        'messageId' => $messageId
                    ];
                    
                    // Use Laravel API to backup to sheets
                    $backupCh = curl_init();
                    
                    curl_setopt($backupCh, CURLOPT_URL, "{$baseUrl}/api/backup-to-sheets");
                    curl_setopt($backupCh, CURLOPT_POST, true);
                    curl_setopt($backupCh, CURLOPT_POSTFIELDS, json_encode($sheetBackupData));
                    curl_setopt($backupCh, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($backupCh, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                    curl_setopt($backupCh, CURLOPT_TIMEOUT, 5); // 5 second timeout to not block
                    
                    $backupResponse = curl_exec($backupCh);
                    $backupHttpCode = curl_getinfo($backupCh, CURLINFO_HTTP_CODE);
                    curl_close($backupCh);
                    
                    $backupStatus = ($backupHttpCode === 200) ? "✓" : "✗";
                    $logMessage = "[$timestamp] Stored message for $lineUuid: '$messageText' -> Evante: HTTP $httpCode, Sheets: $backupStatus\n";
                } catch (Exception $e) {
                    $logMessage = "[$timestamp] Stored message for $lineUuid: '$messageText' -> Evante: HTTP $httpCode, Sheets: ✗ (error)\n";
                }
                
                file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
            }
        }
        
        echo json_encode(['status' => 'ok']);
        exit;
        
    } catch (Exception $e) {
        $errorMsg = "[$timestamp] Error: " . $e->getMessage() . "\n";
        file_put_contents($logFile, $errorMsg, FILE_APPEND | LOCK_EX);
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
        exit;
    }
}

// Handle OPTIONS (CORS preflight)
if ($requestMethod === 'OPTIONS') {
    http_response_code(200);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>