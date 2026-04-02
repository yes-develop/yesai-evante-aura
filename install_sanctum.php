<?php

echo "Attempting to install Laravel Sanctum via Composer...\n";

// Set working directory
chdir(__DIR__);

// Execute composer command
$command = 'composer require laravel/sanctum';
echo "Running: $command\n";

// Execute the command and capture output
$output = [];
$return_var = 0;
exec($command, $output, $return_var);

// Display output
foreach ($output as $line) {
    echo $line . "\n";
}

// Check if command was successful
if ($return_var === 0) {
    echo "Laravel Sanctum installed successfully!\n";
} else {
    echo "Error installing Laravel Sanctum. Please run 'composer require laravel/sanctum' manually.\n";
}
