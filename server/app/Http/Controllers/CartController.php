<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $items = CartItem::with(['product.images'])
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'integer|min:1',
            'selected_size' => 'nullable|string|max:50',
        ]);

        $selectedSize = $validated['selected_size'] ?? '';

        $cartItem = CartItem::where('user_id', $request->user()->id)
            ->where('product_id', $validated['product_id'])
            ->where('selected_size', $selectedSize)
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $validated['quantity'] ?? 1;
            $cartItem->save();
        } else {
            $cartItem = CartItem::create([
                'user_id' => $request->user()->id,
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'] ?? 1,
                'selected_size' => $selectedSize,
            ]);
        }

        return response()->json($cartItem->load('product.images'), 201);
    }

    public function update(Request $request, CartItem $cartItem)
    {
        if ($cartItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem->update($validated);

        return response()->json($cartItem->load('product.images'));
    }

    public function destroy(Request $request, CartItem $cartItem)
    {
        if ($cartItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cartItem->delete();
        return response()->json(null, 204);
    }

    public function count(Request $request)
    {
        $count = CartItem::where('user_id', $request->user()->id)->sum('quantity');
        return response()->json(['count' => $count]);
    }
}
