<?php
// Set headers to allow AJAX requests
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Database connection
    $host = '127.0.0.1';
    $dbname = 'yeswebdesigndb';
    $username = 'admin_naijai';
    $password = '*82c8Ysv3';

    $pdo = new PDO("mysql:host=$host;port=3306;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Log database connection success
    error_log('Database connection successful for fetching labels');

    // Fetch all labels
    $stmt = $pdo->query("SELECT id, name, color, created_at FROM labels ORDER BY created_at DESC");
    $labels = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Log the number of labels fetched
    error_log('Fetched ' . count($labels) . ' labels');

    // Return success response with the labels data
    echo json_encode([
        'success' => true,
        'message' => 'Labels fetched successfully',
        'labels' => $labels
    ]);
} catch (PDOException $e) {
    // Log the error
    error_log('Database error: ' . $e->getMessage());

    // Return error response
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
