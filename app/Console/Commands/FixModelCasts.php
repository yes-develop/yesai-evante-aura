<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class FixModelCasts extends Command
{
    protected $signature = 'models:fix-casts {--model= : Specify a specific model to fix}';
    protected $description = 'Fix invalid cast types in models';

    public function handle()
    {
        $this->info('Starting to fix invalid model casts...');
        
        $modelsDir = app_path('Models');
        $problemCasts = ['hashed']; // Add any other problematic casts here
        
        $specificModel = $this->option('model');
        
        if ($specificModel) {
            $modelPath = $modelsDir . '/' . $specificModel . '.php';
            if (File::exists($modelPath)) {
                $this->processModel($modelPath, $problemCasts);
            } else {
                $this->error("Model file not found: $modelPath");
                return 1;
            }
        } else {
            // Process all model files
            $modelFiles = File::glob("$modelsDir/*.php");
            $this->info("Found " . count($modelFiles) . " model files to check");
            
            foreach ($modelFiles as $file) {
                $this->processModel($file, $problemCasts);
            }
        }
        
        $this->info('Completed fixing invalid model casts!');
        return 0;
    }
    
    private function processModel($filePath, $problemCasts)
    {
        $baseName = basename($filePath);
        $this->info("Processing model: $baseName");
        
        $content = File::get($filePath);
        $originalContent = $content;
        $changed = false;
        
        foreach ($problemCasts as $cast) {
            // Look for patterns like: 'field' => 'hashed',
            if (preg_match("/'[a-zA-Z0-9_]+'\s*=>\s*'$cast'/", $content)) {
                $this->warn("  - Found invalid cast '$cast' in file");
                
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
            File::put($filePath, $content);
            $this->info("  - Fixed invalid casts in $baseName");
            
            // Add mutator for password field if this is the User model and it has a hashed cast
            if (Str::contains($baseName, 'User.php') && !Str::contains($content, 'setPasswordAttribute')) {
                $this->addPasswordMutator($filePath);
            }
        } else {
            $this->info("  - No issues found in $baseName");
        }
    }
    
    private function addPasswordMutator($filePath)
    {
        $this->info("Adding password mutator to User model");
        
        $content = File::get($filePath);
        
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
            File::put($filePath, $content);
            $this->info("Password mutator added successfully");
        }
    }
}
