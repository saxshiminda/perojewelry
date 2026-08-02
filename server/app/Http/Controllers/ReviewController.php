<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function index(Product $product)
    {
        $reviews = $product->reviews()->with('user')->latest()->paginate(10);
        return response()->json($reviews);
    }

    public function store(Request $request, Product $product)
    {
        $user = $request->user();

        // Ensure user has ordered this product
        $hasOrdered = $user->orders()
            ->whereHas('items', function ($query) use ($product) {
                $query->where('product_id', $product->id);
            })
            ->exists();

        if (!$hasOrdered) {
            return response()->json([
                'message' => 'You can only review products you have purchased.'
            ], 403);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = $product->reviews()->updateOrCreate(
            ['user_id' => $user->id, 'product_id' => $product->id],
            [
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
            ]
        );

        return response()->json($review->load('user'), 201);
    }

    public function destroy(Review $review)
    {
        if ($review->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->delete();
        return response()->json(null, 204);
    }
}
