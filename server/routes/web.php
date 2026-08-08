<?php

use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

/**
 * Same-origin SPA: Angular build is copied to public/spa.html (+ hashed assets).
 * API stays on /api; Sanctum on /sanctum; files under /storage are served statically.
 */
Route::get('/{any?}', SpaController::class)
    ->where('any', '^(?!api(?:/|$)|sanctum(?:/|$)|storage(?:/|$)|up$).*');
