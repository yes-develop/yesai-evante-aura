<?php

namespace App\Providers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use Illuminate\Filesystem\FilesystemAdapter as LaravelFilesystemAdapter;
use League\Flysystem\Filesystem;
use League\Flysystem\GoogleCloudStorage\GoogleCloudStorageAdapter;
use Google\Cloud\Storage\StorageClient;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register custom GCS filesystem driver
        Storage::extend('gcs', function ($app, $config) {
            $storageClient = new StorageClient([
                'projectId' => $config['project_id'] ?? null,
                // Prefer explicit key_file path for server environments
                'keyFilePath' => $config['key_file'] ?? null,
            ]);

            $bucket = $storageClient->bucket($config['bucket']);
            $pathPrefix = $config['path_prefix'] ?? '';
            $adapter = new GoogleCloudStorageAdapter($bucket, $pathPrefix);

            $flysystem = new Filesystem($adapter);
            return new LaravelFilesystemAdapter($flysystem, $adapter, $config);
        });
    }
}
