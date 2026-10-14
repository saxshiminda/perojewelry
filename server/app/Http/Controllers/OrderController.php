<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    private const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

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

    public function adminIndex(Request $request)
    {
        $query = Order::with(['items.product', 'user'])->latest();

        $status = $request->query('status');
        if (is_string($status) && in_array($status, self::STATUSES, true)) {
            $query->where('status', $status);
        }

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('shipping_name', 'like', "%{$search}%")
                    ->orWhere('shipping_email', 'like', "%{$search}%");

                if (ctype_digit($search)) {
                    $builder->orWhere('id', (int) $search);
                }
            });
        }

        return response()->json($query->paginate(15));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,processing,shipped,delivered,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json($order->load(['items.product', 'user']));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'shipping_name' => 'required|string|max:255',
            'shipping_email' => 'required|email',
            'shipping_phone' => 'required|string|max:50',
            'shipping_country' => 'required|string|max:255',
            'shipping_city' => 'required|string|max:255',
            'shipping_street' => 'required|string|max:255',
            'shipping_building' => 'required|string|max:255',
            'shipping_apartment' => 'nullable|string|max:255',
            'shipping_zip' => 'required|string|max:32',
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

            $addressParts = array_values(array_filter([
                $validated['shipping_street'],
                $validated['shipping_building'],
                $validated['shipping_apartment'] ?? null,
            ], fn ($part) => is_string($part) && trim($part) !== ''));

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'shipping' => $shipping,
                'total' => $total,
                'shipping_name' => $validated['shipping_name'],
                'shipping_email' => $validated['shipping_email'],
                'shipping_phone' => $validated['shipping_phone'],
                'shipping_country' => $validated['shipping_country'],
                'shipping_address' => implode(', ', $addressParts),
                'shipping_street' => $validated['shipping_street'],
                'shipping_building' => $validated['shipping_building'],
                'shipping_apartment' => $validated['shipping_apartment'] ?? null,
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
