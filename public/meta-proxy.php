<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/meta_proxy_debug.log');

// Bootstrap Dotenv so we can reuse .env values outside Laravel
$basePath = dirname(__DIR__);
if (file_exists($basePath . '/vendor/autoload.php')) {
    require_once $basePath . '/vendor/autoload.php';
    if (class_exists(Dotenv\Dotenv::class)) {
        Dotenv\Dotenv::createImmutable($basePath)->safeLoad();
    }
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Helper: read env with fallbacks
function env_get($key, $default = null)
{
    if (isset($_ENV[$key]) && $_ENV[$key] !== '')
        return $_ENV[$key];
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '')
        return $_SERVER[$key];
    $v = getenv($key);
    return $v !== false ? $v : $default;
}

// Helper: debug log
function debug_log($msg)
{
    $logFile = __DIR__ . '/meta_proxy_debug.log';
    $time = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$time] $msg\n", FILE_APPEND);
}

debug_log("Request: " . $_SERVER['REQUEST_METHOD'] . " " . $_SERVER['REQUEST_URI'] . " | POST: " . json_encode($_POST));

// Webhook verification for Meta (Messenger/Instagram)
$hubMode = $_GET['hub.mode'] ?? $_GET['hub_mode'] ?? null;
$hubVerify = $_GET['hub.verify_token'] ?? $_GET['hub_verify_token'] ?? null;
$hubChallenge = $_GET['hub.challenge'] ?? $_GET['hub_challenge'] ?? null;
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $hubMode && $hubChallenge) {
    $verifyToken = env_get('META_VERIFY_TOKEN')
        ?: env_get('FACEBOOK_VERIFY_TOKEN')
        ?: env_get('INSTAGRAM_VERIFY_TOKEN');

    if ($hubMode === 'subscribe' && $verifyToken && hash_equals((string)$verifyToken, (string)$hubVerify)) {
        header('Content-Type: text/plain');
        echo $hubChallenge;
        exit();
    }

    http_response_code(403);
    echo json_encode(['error' => 'Webhook verification failed']);
    exit();
}

// Determine action
$action = isset($_GET['action']) ? strtolower(trim($_GET['action'])) : (isset($_POST['action']) ? strtolower(trim((string)$_POST['action'])) : 'profile');
$channel = isset($_GET['channel']) ? strtolower(trim($_GET['channel'])) : (isset($_POST['channel']) ? strtolower(trim((string)$_POST['channel'])) : '');

// Normalize user/recipient identifiers
$userId = $_GET['userId'] ?? $_GET['userid'] ?? $_POST['userId'] ?? $_POST['userid'] ?? null; // May be FB_xxx or IG_xxx
$recipientId = $_GET['recipient_id'] ?? $_POST['recipient_id'] ?? null; // raw PSID/IG SID
$messageText = $_POST['message'] ?? ($_GET['message'] ?? null);
$fileUrl = $_POST['fileUrl'] ?? ($_GET['fileUrl'] ?? null);
$fileType = $_POST['fileType'] ?? ($_GET['fileType'] ?? null);
$fileName = $_POST['fileName'] ?? ($_GET['fileName'] ?? null);

// Try to infer channel and raw id from userId like FB_xxx / IG_xxx
if ($userId && !$recipientId) {
    if (stripos($userId, 'FB_') === 0) {
        $channel = $channel ?: 'facebook';
        $recipientId = substr($userId, 3);
    }
    elseif (stripos($userId, 'IG_') === 0) {
        $channel = $channel ?: 'instagram';
        $recipientId = substr($userId, 3);
    }
}

// Load tokens and optional ids
$fbToken = env_get('FACEBOOK_GRAPH_TOKEN'); // Page Access Token
$igToken = env_get('INSTAGRAM_GRAPH_TOKEN'); // Instagram Graph access token (from connected page/app)
$fbPageId = env_get('FACEBOOK_PAGE_ID');
$igUserId = env_get('IG_USER_ID') ?: env_get('INSTAGRAM_USER_ID');

debug_log("Tokens Loaded - FB: " . ($fbToken ? substr($fbToken, 0, 10) . "..." : "MISSING") .
    ", IG: " . ($igToken ? substr($igToken, 0, 10) . "..." : "MISSING") .
    ", IG_USER: " . ($igUserId ?: "MISSING"));

// Basic router
switch ($action) {
    case 'ping':
        echo json_encode(['success' => true, 'message' => 'meta-proxy is alive']);
        exit();

    case 'profile':
        if (!$channel) {
            http_response_code(400);
            echo json_encode(['error' => 'channel is required (facebook|instagram)']);
            exit();
        }
        if (!$recipientId) {
            if ($userId) {
                $recipientId = $userId;
            }
        }
        if (!$recipientId) {
            http_response_code(400);
            echo json_encode(['error' => 'recipient_id or userId is required']);
            exit();
        }

        if ($channel === 'facebook') {
            if (!$fbToken) {
                http_response_code(500);
                echo json_encode(['error' => 'FACEBOOK_GRAPH_TOKEN not configured']);
                exit();
            }

            $url = 'https://graph.facebook.com/v20.0/' . rawurlencode($recipientId) . '?fields=first_name,last_name,profile_pic&access_token=' . rawurlencode($fbToken);
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => 0,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_USERAGENT => 'yes-aura-meta-proxy/1.0'
            ]);
            $resp = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            if (curl_errno($ch)) {
                $err = curl_error($ch);
                curl_close($ch);
                http_response_code(500);
                echo json_encode(['error' => 'Failed to fetch Facebook profile', 'details' => $err]);
                exit();
            }
            curl_close($ch);

            if ($code === 200) {
                $data = json_decode($resp, true) ?: [];
                $first = (string)($data['first_name'] ?? '');
                $last = (string)($data['last_name'] ?? '');
                $name = trim($first . ' ' . $last);
                echo json_encode([
                    'displayName' => $name !== '' ? $name : ('FB ' . substr($recipientId, -6)),
                    'pictureUrl' => (string)($data['profile_pic'] ?? ''),
                    'statusMessage' => ''
                ]);
                exit();
            }

            http_response_code($code ?: 502);
            echo json_encode(['error' => 'Facebook Graph request failed', 'status' => $code, 'response' => $resp]);
            exit();
        }

        if ($channel === 'instagram') {
            if (!$igToken) {
                http_response_code(500);
                echo json_encode(['error' => 'INSTAGRAM_GRAPH_TOKEN not configured']);
                exit();
            }
            // Best-effort attempt: try to query profile fields for the participant id.
            $url = 'https://graph.facebook.com/v20.0/' . rawurlencode($recipientId) . '?fields=username,profile_pic&access_token=' . rawurlencode($igToken);
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => 0,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_USERAGENT => 'yes-aura-meta-proxy/1.0'
            ]);
            $resp = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            if (curl_errno($ch)) {
                $err = curl_error($ch);
                curl_close($ch);
                http_response_code(200);
                echo json_encode([
                    'displayName' => 'IG ' . substr($recipientId, -6),
                    'pictureUrl' => '',
                    'statusMessage' => '',
                    'note' => 'fallback_without_profile_details'
                ]);
                exit();
            }
            curl_close($ch);

            if ($code === 200) {
                $data = json_decode($resp, true) ?: [];
                $username = (string)($data['username'] ?? '');
                $pic = (string)($data['profile_pic'] ?? '');
                echo json_encode([
                    'displayName' => $username !== '' ? $username : ('IG ' . substr($recipientId, -6)),
                    'pictureUrl' => $pic,
                    'statusMessage' => ''
                ]);
                exit();
            }

            // Fallback if API denies access to participant profile
            http_response_code(200);
            echo json_encode([
                'displayName' => 'IG ' . substr($recipientId, -6),
                'pictureUrl' => '',
                'statusMessage' => '',
                'note' => 'fallback_without_profile_details',
                'status' => $code,
                'response' => $resp
            ]);
            exit();
        }

        http_response_code(400);
        echo json_encode(['error' => 'Unsupported channel for profile: ' . $channel]);
        exit();

    case 'send':
        if (!$channel) {
            http_response_code(400);
            echo json_encode(['error' => 'channel is required (facebook|instagram)']);
            exit();
        }
        if (!$recipientId) {
            http_response_code(400);
            echo json_encode(['error' => 'recipient_id is required']);
            exit();
        }
        if ((!is_string($messageText) || trim($messageText) === '') && !$fileUrl) {
            http_response_code(400);
            echo json_encode(['error' => 'message or fileUrl is required']);
            exit();
        }

        if ($channel === 'facebook') {
            if (!$fbToken) {
                http_response_code(500);
                echo json_encode(['error' => 'FACEBOOK_GRAPH_TOKEN not configured']);
                exit();
            }
            $endpoint = 'https://graph.facebook.com/v20.0/me/messages?access_token=' . rawurlencode($fbToken);

            $messageData = [];
            if ($fileUrl) {
                $isImage = stripos($fileType, 'image') !== false || preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $fileUrl);
                $type = $isImage ? 'image' : 'file';
                $messageData = [
                    'attachment' => [
                        'type' => $type,
                        'payload' => [
                            'url' => $fileUrl,
                            'is_reusable' => true
                        ]
                    ]
                ];
            }
            else {
                $messageData = ['text' => $messageText];
            }

            $payload = [
                'messaging_type' => 'RESPONSE',
                'recipient' => ['id' => $recipientId],
                'message' => $messageData,
            ];

            debug_log("Meta API send to $channel, Recipient: $recipientId, Endpoint: $endpoint, Payload: " . json_encode($payload));
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $endpoint,
                CURLOPT_POST => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => 0,
                CURLOPT_TIMEOUT => 15,
                CURLOPT_CONNECTTIMEOUT => 8,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_USERAGENT => 'yes-aura-meta-proxy/1.0'
            ]);
            $resp = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            debug_log("Meta API response code: $code, Response: $resp");
            if (curl_errno($ch)) {
                $err = curl_error($ch);
                curl_close($ch);
                debug_log("cURL error: $err");
                http_response_code(502);
                echo json_encode(['success' => false, 'error' => 'Facebook send failed', 'details' => $err]);
                exit();
            }
            curl_close($ch);

            if ($code >= 200 && $code < 300) {
                echo json_encode(['success' => true, 'response' => json_decode($resp, true)]);
                exit();
            }
            http_response_code($code ?: 502);
            echo json_encode(['success' => false, 'error' => 'Facebook send returned error', 'status' => $code, 'response' => $resp]);
            exit();
        }

        if ($channel === 'instagram') {
            if (!$igToken) {
                http_response_code(500);
                echo json_encode(['error' => 'INSTAGRAM_GRAPH_TOKEN not configured']);
                exit();
            }
            // Instagram messaging requires the business IG user id as the node for /messages
            $targetIgUserId = $_GET['ig_user_id'] ?? $_POST['ig_user_id'] ?? $igUserId;
            if (!$targetIgUserId) {
                debug_log("ERROR: Instagram send failed - IG_USER_ID missing");
                http_response_code(400);
                echo json_encode(['error' => 'ig_user_id is required (or set IG_USER_ID in .env)']);
                exit();
            }

            $endpoint = 'https://graph.facebook.com/v20.0/' . rawurlencode($targetIgUserId) . '/messages?access_token=' . rawurlencode($igToken);

            $messageData = [];
            if ($fileUrl) {
                // Instagram supports image and generic file (video/etc)
                $isImage = stripos($fileType, 'image') !== false || preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $fileUrl);
                $type = $isImage ? 'image' : 'file';
                $messageData = [
                    'attachment' => [
                        'type' => $type,
                        'payload' => [
                            'url' => $fileUrl
                        ]
                    ]
                ];
            }
            else {
                $messageData = ['text' => $messageText];
            }

            $payload = [
                'recipient' => ['id' => $recipientId],
                'message' => $messageData,
            ];

            debug_log("Meta API send to $channel, Recipient: $recipientId, Endpoint: $endpoint, Payload: " . json_encode($payload));
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $endpoint,
                CURLOPT_POST => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => 0,
                CURLOPT_TIMEOUT => 15,
                CURLOPT_CONNECTTIMEOUT => 8,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_USERAGENT => 'yes-aura-meta-proxy/1.0'
            ]);
            $resp = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            debug_log("Meta API response code: $code, Response: $resp");
            if (curl_errno($ch)) {
                $err = curl_error($ch);
                curl_close($ch);
                debug_log("cURL error: $err");
                http_response_code(502);
                echo json_encode(['success' => false, 'error' => 'Instagram send failed', 'details' => $err]);
                exit();
            }
            curl_close($ch);

            if ($code >= 200 && $code < 300) {
                echo json_encode(['success' => true, 'response' => json_decode($resp, true)]);
                exit();
            }
            http_response_code($code ?: 502);
            echo json_encode(['success' => false, 'error' => 'Instagram send returned error', 'status' => $code, 'response' => $resp]);
            exit();
        }

        http_response_code(400);
        echo json_encode(['error' => 'Unsupported channel for send: ' . $channel]);
        exit();

    case 'discovery':
        if (!$fbToken) {
            http_response_code(500);
            echo json_encode(['error' => 'FACEBOOK_GRAPH_TOKEN not configured for discovery']);
            exit();
        }
        $url = 'https://graph.facebook.com/v20.0/me/accounts?fields=name,id,instagram_business_account&access_token=' . rawurlencode($fbToken);
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_TIMEOUT => 15
        ]);
        $resp = curl_exec($ch);
        curl_close($ch);
        echo $resp;
        exit();

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unsupported action', 'action' => $action]);
        exit();
}
