<?php
// Set headers to allow AJAX requests
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-TOKEN');

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the raw POST data
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Log the received data for debugging
    error_log('Received data: ' . print_r($data, true));
    
    // Validate the data
    if (isset($data['name']) && !empty($data['name']) && isset($data['color']) && !empty($data['color'])) {
        $labelName = $data['name'];
        $labelColor = $data['color'];
        
        try {
            // Database connection
            $host = 'localhost'; // Change to your database host
            $dbname = 'db56_yeswebdesign';
            $username = 'u56_yeswebdesign'; // Change to your database username
            $password = 'uTQnprgs8iGtesd9'; // Change to your database password
            
            $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Log database connection success
            error_log('Database connection successful');
            
            // Create labels table if it doesn't exist
            $pdo->exec("CREATE TABLE IF NOT EXISTS labels (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                color VARCHAR(7) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )");
            
            // Check if label already exists
            $stmt = $pdo->prepare("SELECT id FROM labels WHERE name = ?");
            $stmt->execute([$labelName]);
            
            if ($stmt->rowCount() > 0) {
                // Label already exists
                echo json_encode([
                    'success' => false,
                    'message' => 'Label already exists'
                ]);
                exit;
            }
            
            // Insert the new label
            $stmt = $pdo->prepare("INSERT INTO labels (name, color) VALUES (?, ?)");
            $result = $stmt->execute([$labelName, $labelColor]);
            
            // Log the insert result
            error_log('Insert result: ' . ($result ? 'success' : 'failed'));
            
            if ($result) {
                // Get the ID of the newly inserted label
                $labelId = $pdo->lastInsertId();
                
                // Log the new label ID
                error_log('New label ID: ' . $labelId);
                
                // Return success response with the new label data
                echo json_encode([
                    'success' => true,
                    'message' => 'Label created successfully',
                    'label' => [
                        'id' => $labelId,
                        'name' => $labelName,
                        'color' => $labelColor
                    ]
                ]);
            } else {
                throw new Exception('Failed to insert label');
            }
            
        } catch (PDOException $e) {
            // Return error response
            echo json_encode([
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ]);
        }
    } else {
        // Return error response for invalid data
        echo json_encode([
            'success' => false,
            'message' => 'Label name and color are required'
        ]);
    }
} else {
    // Return error response for non-POST requests
    echo json_encode([
        'success' => false,
        'message' => 'Only POST requests are allowed'
    ]);
}
