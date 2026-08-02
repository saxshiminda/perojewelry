<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('images', 'category');

        if ($request->has('category_id') && $request->category_id !== '') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search') && $request->search !== '') {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('min_price') && $request->min_price !== '') {
            $query->where(function ($q) use ($request) {
                $q->whereNotNull('sale_price')->where('sale_price', '>=', $request->min_price)
                  ->orWhereNull('sale_price')->where('price', '>=', $request->min_price);
            });
        }

        if ($request->has('max_price') && $request->max_price !== '') {
            $query->where(function ($q) use ($request) {
                $q->whereNotNull('sale_price')->where('sale_price', '<=', $request->max_price)
                  ->orWhereNull('sale_price')->where('price', '<=', $request->max_price);
            });
        }

        $sortBy = $request->get('sort', 'default');
        switch ($sortBy) {
            case 'price_asc':
                $query->orderByRaw('COALESCE(sale_price, price) ASC');
                break;
            case 'price_desc':
                $query->orderByRaw('COALESCE(sale_price, price) DESC');
                break;
            case 'popularity':
                $query->withCount('orderItems')->orderByDesc('order_items_count');
                break;
            case 'newest':
                $query->latest();
                break;
            default:
                $query->orderBy('id');
        }

        $perPage = $request->get('per_page', 9);
        return response()->json($query->paginate($perPage));
    }

    public function priceRange()
    {
        $minPrice = Product::selectRaw('MIN(COALESCE(sale_price, price)) as min_price')->value('min_price');
        $maxPrice = Product::selectRaw('MAX(COALESCE(sale_price, price)) as max_price')->value('max_price');

        return response()->json([
            'min' => $minPrice ? (float) $minPrice : 0,
            'max' => $maxPrice ? (float) $maxPrice : 0
        ]);
    }

    public function show(Product $product)
    {
        $product->load('images', 'category');
        return response()->json($product);
    }

    public function featured(Request $request)
    {
        $limit = $request->get('limit', 4);
        $products = Product::with('images', 'category')
            ->where('is_featured', true)
            ->limit($limit)
            ->get();

        return response()->json($products);
    }

    public function bestSellers(Request $request)
    {
        $limit = $request->get('limit', 4);

        $products = Product::with('images', 'category')
            ->withCount('orderItems')
            ->orderByDesc('order_items_count')
            ->limit($limit)
            ->get();

        return response()->json($products);
    }

    public function newArrivals(Request $request)
    {
        $limit = $request->get('limit', 4);
        $products = Product::with('images', 'category')
            ->latest()
            ->limit($limit)
            ->get();

        return response()->json($products);
    }

    public function onSale(Request $request)
    {
        $limit = $request->get('limit', 4);
        $products = Product::with('images', 'category')
            ->whereNotNull('sale_price')
            ->where('sale_price', '<', DB::raw('price'))
            ->limit($limit)
            ->get();

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'material' => 'nullable|string|max:255',
            'finish' => 'nullable|string|max:255',
            'dimensions' => 'nullable|string|max:255',
            'size_options' => 'nullable|array',
            'size_options.*.label' => 'required_with:size_options|string|max:50',
            'size_options.*.stock' => 'required_with:size_options|integer|min:0',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'is_featured' => 'boolean',
            'discount_type' => 'nullable|in:percentage,fixed',
            'discount_value' => 'nullable|numeric|min:0',
            'images' => 'nullable|array',
            'images.*.image_url' => 'required|string|max:2048',
            'images.*.is_primary' => 'boolean',
        ]);

        $product = Product::create($validated);

        if ($product->discount_type && $product->discount_value) {
            $product->applySaleDiscount();
            $product->save();
        }

        if ($request->has('images')) {
            foreach ($request->images as $index => $imageData) {
                $product->images()->create([
                    'image_url' => $imageData['image_url'],
                    'is_primary' => $imageData['is_primary'] ?? ($index === 0),
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json($product->load('images', 'category'), 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'material' => 'nullable|string|max:255',
            'finish' => 'nullable|string|max:255',
            'dimensions' => 'nullable|string|max:255',
            'size_options' => 'nullable|array',
            'size_options.*.label' => 'required_with:size_options|string|max:50',
            'size_options.*.stock' => 'required_with:size_options|integer|min:0',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'is_featured' => 'boolean',
            'discount_type' => 'nullable|in:percentage,fixed',
            'discount_value' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'images' => 'nullable|array',
            'images.*.id' => 'nullable|integer',
            'images.*.image_url' => 'required|string|max:2048',
            'images.*.is_primary' => 'boolean',
        ]);

        $product->update($validated);

        if ($product->discount_type && $product->discount_value) {
            $product->applySaleDiscount();
            $product->save();
        } elseif (!$product->discount_type) {
            $product->sale_price = null;
            $product->save();
        }

        if ($request->has('images')) {
            $product->images()->delete();
            foreach ($request->images as $index => $imageData) {
                $product->images()->create([
                    'image_url' => $imageData['image_url'],
                    'is_primary' => $imageData['is_primary'] ?? ($index === 0),
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json($product->load('images', 'category'));
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(null, 204);
    }
}
