<?php

use Illuminate\Support\Facades\Route;

// This is a strictly API-driven application.
// All routes should be registered in routes/api.php

Route::get('/', function () {
    return response()->json([
        'message' => 'Backend is running successfully!',
        'api_url' => url('/api')
    ]);
});
