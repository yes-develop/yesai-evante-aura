<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect_uri' => env('GOOGLE_REDIRECT_URI'),
    ],

    'google_sheets' => [
        'api_key'          => env('GOOGLE_SHEETS_API_KEY', ''),
        'id'               => env('GOOGLE_SHEETS_ID', ''),
        'contacts_sheet_id' => env('GOOGLE_CONTACTS_SHEET_ID', ''),
    ],

    'make' => [
        'webhook_url'            => env('MAKE_WEBHOOK_URL', ''),
        'webhook_automations_url' => env('MAKE_WEBHOOK_AUTOMATIONS_URL', ''),
        'webhook_scenario_url'   => env('MAKE_WEBHOOK_SCENARIO_URL', ''),
        'webhook_knowledge_url'  => env('MAKE_WEBHOOK_KNOWLEDGE_URL', ''),
        'webhook_ai_chat_url'    => env('MAKE_WEBHOOK_AI_CHAT_URL', ''),
    ],

    'n8n' => [
        'unread_tracking_url' => env('N8N_UNREAD_TRACKING_URL'),
    ],

    'evante' => [
        'url' => env('EVANTE_API_URL', 'http://localhost:8000'),
        'key' => env('EVANTE_API_KEY', ''),
    ],

    'reverb' => [
        'app_key' => env('REVERB_APP_KEY', ''),
        'host'    => env('REVERB_HOST', 'localhost'),
        'port'    => env('REVERB_PORT', 8080),
        'scheme'  => env('REVERB_SCHEME', 'http'),
    ],

    'vapi' => [
        'api_key'          => env('VAPI_API_KEY'),
        'webhook_secret'   => env('VAPI_WEBHOOK_SECRET'),
        'assistant_id'     => env('VAPI_ASSISTANT_ID'),
    ],

];
