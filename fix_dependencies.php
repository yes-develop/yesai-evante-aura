<?php

// Initialize
echo "Fixing application dependencies...\n";
require_once __DIR__.'/vendor/autoload.php';

// Run these commands only if the application is properly loaded
try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    // Functions to simulate artisan commands
    function clearCache() {
        echo "Clearing application cache...\n";
        Illuminate\Support\Facades\Artisan::call('cache:clear');
        echo "Cache cleared.\n";
    }
    
    function clearConfig() {
        echo "Clearing configuration cache...\n";
        Illuminate\Support\Facades\Artisan::call('config:clear');
        echo "Configuration cache cleared.\n";
    }
    
    function clearRoutes() {
        echo "Clearing route cache...\n";
        Illuminate\Support\Facades\Artisan::call('route:clear');
        echo "Route cache cleared.\n";
    }
    
    function clearViews() {
        echo "Clearing view cache...\n";
        Illuminate\Support\Facades\Artisan::call('view:clear');
        echo "View cache cleared.\n";
    }
    
    // Run the cache clearing commands
    clearCache();
    clearConfig();
    clearRoutes();
    clearViews();
    
    echo "All caches cleared successfully.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Could not bootstrap Laravel to clear caches. Please run php artisan cache:clear manually.\n";
}

// Manual file cleanup for bootstrap/cache
echo "Manually clearing bootstrap/cache files...\n";
$cacheDir = __DIR__.'/bootstrap/cache';

if (is_dir($cacheDir)) {
    $files = glob($cacheDir.'/*.php');
    foreach ($files as $file) {
        if (is_file($file)) {
            echo "Deleting: " . basename($file) . "\n";
            @unlink($file);
        }
    }
    echo "Bootstrap cache files cleared.\n";
} else {
    echo "Bootstrap cache directory not found.\n";
}

// Check if composer.json exists
echo "Checking composer.json...\n";
$composerJsonPath = __DIR__.'/composer.json';

if (file_exists($composerJsonPath)) {
    $composerJson = json_decode(file_get_contents($composerJsonPath), true);
    
    // Check if laravel/sanctum is in require section
    if (!isset($composerJson['require']['laravel/sanctum'])) {
        echo "laravel/sanctum not found in composer.json requirements!\n";
        echo "Please add it manually by running: composer require laravel/sanctum\n";
    } else {
        echo "laravel/sanctum found in composer.json requirements.\n";
    }
} else {
    echo "composer.json not found!\n";
}

echo "\nDependency check complete.\n";
echo "If you're still experiencing issues, please run:\n";
echo "1. composer require laravel/sanctum\n";
echo "2. php artisan cache:clear\n";
echo "3. php artisan config:clear\n";
