<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('sale_price', 10, 2)->nullable()->after('price');
            $table->string('discount_type')->nullable()->after('sale_price'); // 'percentage' or 'fixed'
            $table->decimal('discount_value', 10, 2)->nullable()->after('discount_type');
            $table->boolean('is_featured')->default(false)->after('category');
            $table->dropColumn('image_url');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('image_url')->nullable();
            $table->dropColumn(['sale_price', 'discount_type', 'discount_value', 'is_featured']);
        });
    }
};
