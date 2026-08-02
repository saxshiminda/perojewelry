<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with('items.product.images')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($orders);
    }

    public function show(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($order->load('items.product.images'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'shipping_name' => 'required|string|max:255',
            'shipping_email' => 'required|email',
            'shipping_address' => 'required|string',
            'shipping_city' => 'required|string',
            'shipping_zip' => 'required|string',
            'payment_method' => 'required|string|in:credit_card,paypal',
        ]);

        $user = $request->user();

        // Get cart items
        $cartItems = CartItem::with('product')
            ->where('user_id', $user->id)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 422);
        }

        // Validate stock availability
        foreach ($cartItems as $item) {
            if ($item->product->stock < $item->quantity) {
                return response()->json([
                    'message' => "Not enough stock for {$item->product->name}. Available: {$item->product->stock}"
                ], 422);
            }
        }

        return DB::transaction(function () use ($validated, $user, $cartItems) {
            // Calculate totals
            $subtotal = $cartItems->sum(function ($item) {
                $price = $item->product->effective_price;
                return $price * $item->quantity;
            });

            $shipping = $subtotal > 200 ? 0 : 15;
            $total = $subtotal + $shipping;

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'status' => 'completed',
                'subtotal' => $subtotal,
                'shipping' => $shipping,
                'total' => $total,
                'shipping_name' => $validated['shipping_name'],
                'shipping_email' => $validated['shipping_email'],
                'shipping_address' => $validated['shipping_address'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_zip' => $validated['shipping_zip'],
                'payment_method' => $validated['payment_method'],
            ]);

            // Create order items and decrement stock
            foreach ($cartItems as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'selected_size' => $item->selected_size ?: null,
                    'price' => $item->product->effective_price,
                ]);

                // Decrement stock
                $item->product->decrement('stock', $item->quantity);
            }

            // Clear cart
            CartItem::where('user_id', $user->id)->delete();

            return response()->json($order->load('items.product.images'), 201);
        });
    }
}
