<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageUploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:5120', // 5MB max
        ]);

        $path = $request->file('image')->store('products', 'public');

        return response()->json([
            'image_url' => '/storage/' . $path,
        ]);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'image_url' => 'required|string',
        ]);

        // Only delete from storage, not external URLs
        $imageUrl = $request->image_url;
        if (str_starts_with($imageUrl, '/storage/')) {
            $path = str_replace('/storage/', '', $imageUrl);
            Storage::disk('public')->delete($path);
        }

        return response()->json(null, 204);
    }
}
