<?php

$defaultOrigins = 'http://localhost:4200,http://127.0.0.1:4200,http://[::1]:4200';

$fromList = array_values(array_filter(array_map(
    'trim',
    explode(',', (string) env('CORS_ALLOWED_ORIGINS', $defaultOrigins))
)));

$frontendUrl = trim((string) env('FRONTEND_URL', ''));
if ($frontendUrl !== '' && ! in_array($frontendUrl, $fromList, true)) {
    $fromList[] = $frontendUrl;
}

$appUrl = trim((string) env('APP_URL', ''));
if ($appUrl !== '' && ! in_array($appUrl, $fromList, true)) {
    $fromList[] = $appUrl;
}

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Same-origin production (Angular served by Laravel) mostly avoids CORS,
    | but these origins still matter for local split-dev and Sanctum CSRF.
    |
    | Set CORS_ALLOWED_ORIGINS and/or FRONTEND_URL / APP_URL in production.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $fromList,

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
