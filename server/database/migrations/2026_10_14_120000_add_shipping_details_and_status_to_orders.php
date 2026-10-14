<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_phone')->nullable()->after('shipping_email');
            $table->string('shipping_country')->nullable()->after('shipping_phone');
            $table->string('shipping_street')->nullable()->after('shipping_address');
            $table->string('shipping_building')->nullable()->after('shipping_street');
            $table->string('shipping_apartment')->nullable()->after('shipping_building');
        });

        DB::table('orders')->where('status', 'completed')->update(['status' => 'delivered']);
    }

    public function down(): void
    {
        DB::table('orders')->where('status', 'delivered')->update(['status' => 'completed']);

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'shipping_phone',
                'shipping_country',
                'shipping_street',
                'shipping_building',
                'shipping_apartment',
            ]);
        });
    }
};
