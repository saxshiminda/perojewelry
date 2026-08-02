<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'material',
        'finish',
        'dimensions',
        'size_options',
        'price',
        'sale_price',
        'discount_type',
        'discount_value',
        'stock',
        'category_id',
        'is_featured',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'discount_value' => 'decimal:2',
        'is_featured' => 'boolean',
        'size_options' => 'array',
    ];

    protected $appends = ['is_on_sale', 'effective_price', 'primary_image_url', 'average_rating', 'reviews_count'];

    public function reviews()
    {
        return $this->hasMany(Review::class)->latest();
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Accessors

    public function getIsOnSaleAttribute(): bool
    {
        return $this->sale_price !== null && $this->sale_price < $this->price;
    }

    public function getEffectivePriceAttribute(): float
    {
        return $this->is_on_sale ? (float) $this->sale_price : (float) $this->price;
    }

    public function getPrimaryImageUrlAttribute(): ?string
    {
        $primary = $this->primaryImage;
        if ($primary) {
            return $primary->image_url;
        }
        // Fallback to first image
        $first = $this->images->first();
        return $first ? $first->image_url : null;
    }

    public function getAverageRatingAttribute(): float
    {
        return round($this->reviews()->avg('rating') ?? 0, 1);
    }

    public function getReviewsCountAttribute(): int
    {
        return $this->reviews()->count();
    }

    // Helper to calculate sale_price from discount
    public function applySaleDiscount(): void
    {
        if ($this->discount_type === 'percentage' && $this->discount_value) {
            $this->sale_price = round($this->price * (1 - $this->discount_value / 100), 2);
        } elseif ($this->discount_type === 'fixed' && $this->discount_value) {
            $this->sale_price = max(0, $this->price - $this->discount_value);
        }
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites');
    }
}
