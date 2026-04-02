<?php

// This script directly fixes the User model's password casting issue
echo "Fixing User model cast issue...\n";

$userModelPath = __DIR__ . '/app/Models/User.php';

if (!file_exists($userModelPath)) {
    echo "ERROR: User model not found at: $userModelPath\n";
    exit(1);
}

$content = file_get_contents($userModelPath);

// Step 1: Remove the 'password' => 'hashed' cast
$pattern = "/'password'\s*=>\s*'hashed',?/";
$replacement = "// 'password' => 'hashed', // Removed invalid cast";
$content = preg_replace($pattern, $replacement, $content);

// Step 2: Add the password mutator if it doesn't exist
if (strpos($content, 'setPasswordAttribute') === false) {
    // Find the position to insert the mutator - before the last closing brace
    $lastBracePos = strrpos($content, '}');
    if ($lastBracePos !== false) {
        $mutator = <<<'MUTATOR'

    /**
     * Handle password hashing with a mutator instead of casting
     */
    public function setPasswordAttribute($value)
    {
        // Only hash the password if it's not already hashed
        $this->attributes['password'] = (strlen($value) === 60 && preg_match('/^\$2y\$/', $value)) 
            ? $value 
            : \Illuminate\Support\Facades\Hash::make($value);
    }

MUTATOR;

        $content = substr_replace($content, $mutator, $lastBracePos, 0);
    }
}

// Write the updated content back to the file
file_put_contents($userModelPath, $content);
echo "User model fixed successfully!\n";
