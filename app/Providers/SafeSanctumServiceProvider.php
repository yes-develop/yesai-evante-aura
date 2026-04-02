<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class SafeSanctumServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Check if the Sanctum package exists
        if (!class_exists('Laravel\Sanctum\SanctumServiceProvider')) {
            // It doesn't exist, so register a substitute configuration
            $this->app['config']->set('sanctum', [
                'stateful' => ['localhost', '127.0.0.1'],
                'guard' => ['web'],
                'expiration' => null,
                'middleware' => [
                    'verify_csrf_token' => \App\Http\Middleware\VerifyCsrfToken::class,
                    'encrypt_cookies' => \App\Http\Middleware\EncryptCookies::class,
                ],
            ]);
            
            return;
        }
        
        // Sanctum exists, register it normally
        $this->app->register(\Laravel\Sanctum\SanctumServiceProvider::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
