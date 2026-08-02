<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = $request->user()->favorites()->get();
        return response()->json($favorites);
    }

    public function toggle(Request $request, Product $product)
    {
        $user = $request->user();
        
        if ($user->favorites()->where('product_id', $product->id)->exists()) {
            $user->favorites()->detach($product->id);
            $message = 'Removed from favorites';
        } else {
            $user->favorites()->attach($product->id);
            $message = 'Added to favorites';
        }

        return response()->json(['message' => $message]);
    }
}
