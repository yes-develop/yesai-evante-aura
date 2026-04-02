<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class PublishThemeAssets extends Command
{
    protected $signature = 'theme:publish';
    protected $description = 'Publish theme assets to the public directory';

    public function handle()
    {
        $this->info('Publishing theme assets...');
        
        // Create directories if they don't exist
        $directories = [
            public_path('assets/img/team'),
            public_path('assets/img/favicon'),
            public_path('assets/css'),
            public_path('assets/js'),
            public_path('assets/vendor'),
        ];
        
        foreach ($directories as $dir) {
            if (!File::exists($dir)) {
                File::makeDirectory($dir, 0755, true);
                $this->info("Created directory: $dir");
            }
        }
        
        $this->info('Theme assets structure prepared!');
        $this->info('Please copy your actual theme files to these directories.');
        
        return 0;
    }
}
