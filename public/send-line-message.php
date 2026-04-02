<?php
// Direct LINE message sender (bypasses Laravel)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Bootstrap Dotenv so we can reuse .env values when running outside Laravel
$basePath = dirname(__DIR__);
if (file_exists($basePath . '/vendor/autoload.php')) {
    require_once $basePath . '/vendor/autoload.php';
    if (class_exists(Dotenv\Dotenv::class)) {
        Dotenv\Dotenv::createImmutable($basePath)->safeLoad();
    }
}

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get JSON data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Debug logging
    $debugFile = __DIR__ . '/send_debug.log';
    file_put_contents($debugFile, "[" . date('Y-m-d H:i:s') . "] Input: $input\n", FILE_APPEND);
    file_put_contents($debugFile, "[" . date('Y-m-d H:i:s') . "] Parsed: " . print_r($data, true) . "\n", FILE_APPEND);
    
    if (!$data || !isset($data['lineUuid'])) {
        http_response_code(400);
        echo json_encode(['error' => 'lineUuid is required', 'received' => $data]);
        exit;
    }
    
    $lineUuid = $data['lineUuid'];
    
    // LINE Channel Access Token (load from environment)
    $lineToken = $_ENV['LINE_CHANNEL_ACCESS_TOKEN']
        ?? $_SERVER['LINE_CHANNEL_ACCESS_TOKEN']
        ?? getenv('LINE_CHANNEL_ACCESS_TOKEN');
    
    if (!$lineToken) {
        http_response_code(500);
        echo json_encode(['error' => 'LINE token not configured']);
        exit;
    }
    
    // Determine message type
    $messages = [];
    
    if (isset($data['fileUrl']) && isset($data['fileName'])) {
        // File message
        $fileUrl = $data['fileUrl'];
        $fileName = $data['fileName'];
        $fileType = $data['fileType'] ?? '';
        
        // Check if it's an image
        $imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
        $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        
        if (in_array($fileExt, $imageExtensions)) {
            // Send as image message
            $messages[] = [
                'type' => 'image',
                'originalContentUrl' => $fileUrl,
                'previewImageUrl' => $fileUrl
            ];
        } else {
            // Send as flex message for documents/files
            $messages[] = [
                'type' => 'flex',
                'altText' => 'File: ' . $fileName,
                'contents' => [
                    'type' => 'bubble',
                    'body' => [
                        'type' => 'box',
                        'layout' => 'vertical',
                        'contents' => [
                            [
                                'type' => 'text',
                                'text' => '📎 File Attachment',
                                'weight' => 'bold',
                                'color' => '#1DB446',
                                'size' => 'sm'
                            ],
                            [
                                'type' => 'text',
                                'text' => $fileName,
                                'weight' => 'bold',
                                'size' => 'md',
                                'wrap' => true,
                                'margin' => 'md'
                            ],
                            [
                                'type' => 'button',
                                'style' => 'primary',
                                'height' => 'sm',
                                'action' => [
                                    'type' => 'uri',
                                    'label' => 'Download',
                                    'uri' => $fileUrl
                                ],
                                'margin' => 'sm'
                            ]
                        ]
                    ],
                    'styles' => [
                        'footer' => [
                            'separator' => true
                        ]
                    ]
                ]
            ];
        }
    } else if (isset($data['message'])) {
        // Text message
        $messages[] = [
            'type' => 'text',
            'text' => $data['message']
        ];
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Either message or fileUrl/fileName is required']);
        exit;
    }
    
    // Prepare LINE API request
    $postData = json_encode([
        'to' => $lineUuid,
        'messages' => $messages
    ]);
    
    // Send to LINE API
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.line.me/v2/bot/message/push');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $lineToken
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    // Log the result
    $logContent = isset($data['message']) ? $data['message'] : (isset($data['fileName']) ? 'File: ' . $data['fileName'] : 'Unknown');
    $logMessage = "[" . date('Y-m-d H:i:s') . "] LINE API: $lineUuid -> '$logContent' | HTTP $httpCode\n";
    file_put_contents(__DIR__ . '/line_send_debug.log', $logMessage, FILE_APPEND | LOCK_EX);
    
    if ($error) {
        file_put_contents(__DIR__ . '/line_send_debug.log', "[" . date('Y-m-d H:i:s') . "] cURL error: {$error}\n", FILE_APPEND | LOCK_EX);
        echo json_encode(['success' => false, 'error' => 'cURL error: ' . $error]);
        exit;
    }
    
    if ($httpCode === 200) {
        echo json_encode(['success' => true, 'message' => 'Message sent to LINE user successfully']);
    } else {
        file_put_contents(__DIR__ . '/line_send_debug.log', "[" . date('Y-m-d H:i:s') . "] LINE response body: {$response}\n", FILE_APPEND | LOCK_EX);
        echo json_encode(['success' => false, 'error' => 'LINE API error', 'httpCode' => $httpCode, 'response' => $response]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>