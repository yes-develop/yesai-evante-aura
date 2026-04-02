<?php
// Set headers to allow AJAX requests
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-TOKEN');

// Get the raw POST data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Log the received data for debugging
error_log('Received data for delete: ' . print_r($data, true));

// Get the label ID from the route parameter
$labelId = isset($id) ? $id : null;

if (!$labelId) {
    echo json_encode([
        'success' => false,
        'message' => 'Label ID is required'
    ]);
    exit;
}

try {
    // Database connection
    $host = 'localhost'; // Change to your database host
    $dbname = 'db56_yeswebdesign';
    $username = 'u56_yeswebdesign'; // Change to your database username
    $password = 'uTQnprgs8iGtesd9'; // Change to your database password

    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Log database connection success
    error_log('Database connection successful for deleting label');

    // Check if label exists
    $stmt = $pdo->prepare("SELECT id FROM labels WHERE id = ?");
    $stmt->execute([$labelId]);

    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Label not found'
        ]);
        exit;
    }

    // Delete the label
    $stmt = $pdo->prepare("DELETE FROM labels WHERE id = ?");
    $result = $stmt->execute([$labelId]);

    // Log the delete result
    error_log('Delete result: ' . ($result ? 'success' : 'failed'));

    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Label deleted successfully'
        ]);
    } else {
        throw new Exception('Failed to delete label');
    }
} catch (PDOException $e) {
    // Log the error
    error_log('Database error: ' . $e->getMessage());

    // Return error response
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
