<?php

// Script to scan and fix invalid cast types in all model files
echo "Starting model cast fixer...\n";

$modelsDir = __DIR__ . '/app/Models';
$problemCasts = ['hashed'];
$fixedFiles = 0;

if (!is_dir($modelsDir)) {
    echo "Models directory not found at: $modelsDir\n";
    exit(1);
}

// Function to fix invalid casts in a model file
function fixInvalidCastsInFile($filePath, $problemCasts) {
    $content = file_get_contents($filePath);
    $originalContent = $content;
    $changed = false;
    
    foreach ($problemCasts as $cast) {
        // Look for patterns like: 'field' => 'hashed',
        if (preg_match("/'[a-zA-Z0-9_]+'\s*=>\s*'$cast'/", $content)) {
            echo "  - Found invalid cast '$cast' in file\n";
            
            // Replace the cast line with a commented version
            $content = preg_replace(
                "/([\s]*)('[a-zA-Z0-9_]+'\s*=>\s*'$cast',)/",
                "$1// Removed invalid cast: $2",
                $content
            );
            
            $changed = true;
        }
    }
    
    if ($changed) {
        file_put_contents($filePath, $content);
        return true;
    }
    
    return false;
}

// Scan all PHP files in models directory
$modelFiles = glob("$modelsDir/*.php");
echo "Found " . count($modelFiles) . " model files to check.\n";

foreach ($modelFiles as $file) {
    $baseName = basename($file);
    echo "Checking $baseName...\n";
    
    if (fixInvalidCastsInFile($file, $problemCasts)) {
        $fixedFiles++;
        echo "  - Fixed invalid casts in $baseName\n";
    } else {
        echo "  - No issues found in $baseName\n";
    }
}

echo "Scan complete. Fixed $fixedFiles files with invalid casts.\n";

// Check if User model needs additional fixes
$userModelPath = "$modelsDir/User.php";
if (file_exists($userModelPath)) {
    echo "\nChecking if User model needs setPasswordAttribute mutator...\n";
    
    $content = file_get_contents($userModelPath);
    
    // Check if the model already has a password mutator
    if (!strpos($content, 'setPasswordAttribute')) {
        echo "Adding password mutator to User model...\n";
        
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
            file_put_contents($userModelPath, $content);
            echo "Password mutator added to User model.\n";
        }
    } else {
        echo "User model already has a password mutator. No changes needed.\n";
    }
}

echo "\nDone!\n";
