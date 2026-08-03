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

        $cartItem = $this->upsertItem(
            $request->user()->id,
            $validated['product_id'],
            $validated['quantity'] ?? 1,
            $validated['selected_size'] ?? ''
        );

        return response()->json($cartItem->load('product.images'), 201);
    }

    public function merge(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'integer|min:1',
            'items.*.selected_size' => 'nullable|string|max:50',
        ]);

        foreach ($validated['items'] as $item) {
            $this->upsertItem(
                $request->user()->id,
                $item['product_id'],
                $item['quantity'] ?? 1,
                $item['selected_size'] ?? ''
            );
        }

        return $this->index($request);
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

    private function upsertItem(int $userId, int $productId, int $quantity, string $selectedSize): CartItem
    {
        $cartItem = CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('selected_size', $selectedSize)
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            $cartItem = CartItem::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'quantity' => $quantity,
                'selected_size' => $selectedSize,
            ]);
        }

        return $cartItem;
    }
}
