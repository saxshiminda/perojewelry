<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $indexNames = collect(Schema::getIndexes('cart_items'))->pluck('name')->all();
        $fkNames = collect(Schema::getForeignKeys('cart_items'))->pluck('name')->all();

        if (in_array('cart_items_user_id_product_id_unique', $indexNames, true)) {
            Schema::table('cart_items', function (Blueprint $table) use ($fkNames) {
                if (in_array('cart_items_user_id_foreign', $fkNames, true)) {
                    $table->dropForeign(['user_id']);
                }
                if (in_array('cart_items_product_id_foreign', $fkNames, true)) {
                    $table->dropForeign(['product_id']);
                }
                $table->dropUnique('cart_items_user_id_product_id_unique');
            });
            $indexNames = collect(Schema::getIndexes('cart_items'))->pluck('name')->all();
            $fkNames = collect(Schema::getForeignKeys('cart_items'))->pluck('name')->all();
        }

        if (!Schema::hasColumn('cart_items', 'selected_size')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->string('selected_size')->default('')->after('quantity');
            });
        }

        if (!in_array('cart_items_user_product_size_unique', $indexNames, true)) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->unique(['user_id', 'product_id', 'selected_size'], 'cart_items_user_product_size_unique');
            });
        }

        $fkNames = collect(Schema::getForeignKeys('cart_items'))->pluck('name')->all();
        Schema::table('cart_items', function (Blueprint $table) use ($fkNames) {
            if (!in_array('cart_items_user_id_foreign', $fkNames, true)) {
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            }
            if (!in_array('cart_items_product_id_foreign', $fkNames, true)) {
                $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            }
        });

        if (!Schema::hasColumn('order_items', 'selected_size')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->string('selected_size')->nullable()->after('quantity');
            });
        }
    }

    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['product_id']);
            $table->dropUnique('cart_items_user_product_size_unique');
            $table->dropColumn('selected_size');
            $table->unique(['user_id', 'product_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('selected_size');
        });
    }
};
