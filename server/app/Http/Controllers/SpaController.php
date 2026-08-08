<?php

namespace App\Http\Controllers;

class SpaController extends Controller
{
    public function __invoke()
    {
        $spa = public_path('spa.html');

        if (! is_file($spa)) {
            return response()->json([
                'message' => 'Frontend is not built. For local API-only use, run the Angular client separately.',
                'api_url' => url('/api'),
            ], 503);
        }

        return response(
            file_get_contents($spa),
            200,
            ['Content-Type' => 'text/html; charset=UTF-8']
        );
    }
}
