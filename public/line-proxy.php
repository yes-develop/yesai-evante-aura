<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

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

// Get userId from query parameters
$userId = isset($_GET['userId']) ? trim($_GET['userId']) : null;

// Validate userId
if (!$userId) {
    http_response_code(400);
    echo json_encode([
        'error' => 'User ID is required',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

// Skip LINE API call for non-LINE users
if (strpos($userId, 'FB') !== false || strpos($userId, 'IG') !== false) {
    echo json_encode([
        'displayName' => $userId,
        'pictureUrl' => '',
        'statusMessage' => ''
    ]);
    exit();
}

// Validate LINE user ID format (should be a long string)
if (strlen($userId) < 10) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Invalid LINE user ID format',
        'details' => 'LINE user IDs must be at least 10 characters long',
        'userId' => $userId,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

// LINE API configuration
$lineToken = $_ENV['LINE_CHANNEL_ACCESS_TOKEN']
    ?? $_SERVER['LINE_CHANNEL_ACCESS_TOKEN']
    ?? getenv('LINE_CHANNEL_ACCESS_TOKEN');

if (!$lineToken) {
    http_response_code(500);
    echo json_encode([
        'error' => 'LINE token not configured',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt_array($ch, [
    CURLOPT_URL => "https://api.line.me/v2/bot/profile/" . urlencode($userId),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $lineToken,
        'Content-Type: application/json'
    ],
    CURLOPT_SSL_VERIFYPEER => false, // Disable SSL verification for development
    CURLOPT_SSL_VERIFYHOST => 0,     // Disable host verification for development
    CURLOPT_TIMEOUT => 10,           // Set timeout to 10 seconds
    CURLOPT_CONNECTTIMEOUT => 5,     // Set connection timeout to 5 seconds
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
]);

// Execute cURL request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Check for cURL errors
if (curl_errno($ch)) {
    $error = curl_error($ch);
    curl_close($ch);
    
    // Log the error for debugging
    error_log("LINE API Error: " . $error);
    
    // Return a more detailed error response
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch LINE profile',
        'details' => $error,
        'userId' => $userId,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

curl_close($ch);

// Check HTTP response code
if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode([
        'error' => 'LINE API request failed',
        'status' => $httpCode,
        'response' => $response,
        'userId' => $userId,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

// Return the LINE profile data
echo $response; 