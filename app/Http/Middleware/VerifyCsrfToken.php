<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        //
        'api/*', // Exempting all API routes from CSRF verification
        'upload-file', // File upload endpoint
        'webhook.php', // LINE webhook
        'broadcasts/send-line', // Broadcast send endpoint (AJAX)
        'broadcasts/send-in-app', // In-app broadcast endpoint (AJAX)
    ];
}
