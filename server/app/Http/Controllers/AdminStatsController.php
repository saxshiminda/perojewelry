<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminStatsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'total_products' => Product::count(),
            'total_orders' => Order::count(),
            'total_users' => User::where('role', '!=', 'admin')->count(),
            'revenue' => (float) Order::sum('total'),
        ]);
    }
}
