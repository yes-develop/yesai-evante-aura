<?php

// Script to debug configuration issues
require_once __DIR__.'/vendor/autoload.php';

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    // Function to check if a file returns an array
    function check_config_file($path) {
        echo "Checking file: $path\n";
        try {
            $value = require $path;
            $type = gettype($value);
            echo "  Returns: $type\n";
            
            if ($type !== 'array') {
                echo "  ERROR: Configuration file must return an array!\n";
                if ($type === 'integer') {
                    echo "  This file is likely returning a status code or error number instead of an array.\n";
                }
                echo "  File content:\n";
                echo file_get_contents($path);
                echo "\n";
            } else {
                echo "  OK: File returns an array as expected.\n";
            }
        } catch (Throwable $e) {
            echo "  ERROR loading file: " . $e->getMessage() . "\n";
        }
    }

    // Check all configuration files in config directory
    echo "Checking all configuration files...\n\n";
    $configDir = __DIR__ . '/config';
    $files = scandir($configDir);
    
    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) === 'php') {
            check_config_file("$configDir/$file");
            echo "\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
