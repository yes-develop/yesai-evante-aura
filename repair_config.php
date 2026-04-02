<?php

// Script to repair configuration files that might be causing the array_merge error
require_once __DIR__.'/vendor/autoload.php';

// List of config files that should return arrays
$configFiles = [
    'app.php',
    'auth.php',
    'broadcasting.php',
    'cache.php',
    'cors.php',
    'database.php',
    'filesystems.php',
    'hashing.php',
    'logging.php',
    'mail.php',
    'queue.php',
    'sanctum.php',
    'services.php',
    'session.php',
    'view.php',
];

// Helper function to check if a config file returns an array
function is_valid_config($path) {
    if (!file_exists($path)) return false;
    
    // Get the content without executing
    $content = file_get_contents($path);
    
    // Check if it looks like a proper config file
    if (!str_contains($content, 'return [') && !str_contains($content, 'return array(')) {
        return false;
    }
    
    // Try to safely evaluate - this is just a basic check
    try {
        $result = require $path;
        return is_array($result);
    } catch (Throwable $e) {
        echo "Error evaluating $path: " . $e->getMessage() . "\n";
        return false;
    }
}

// Repair sanctum config if it's causing issues
echo "Checking configuration files...\n";

foreach ($configFiles as $file) {
    $path = __DIR__ . '/config/' . $file;
    
    if (file_exists($path)) {
        if (!is_valid_config($path)) {
            echo "Config file $file appears to be invalid. Creating backup and replacing...\n";
            
            // Backup the file
            copy($path, $path . '.bak' . time());
            
            // Handle specific files that might be problematic
            if ($file === 'sanctum.php') {
                file_put_contents($path, <<<'EOD'
<?php

return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,127.0.0.1')),
    'guard' => ['web'],
    'expiration' => null,
    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],
];
EOD
                );
                echo "Fixed sanctum.php configuration.\n";
            } else {
                echo "Please manually check and fix $file.\n";
            }
        } else {
            echo "$file is valid.\n";
        }
    } else {
        echo "Config file $file not found. Skipping.\n";
    }
}

echo "\nConfiguration repair complete. Please test your application now.\n";
