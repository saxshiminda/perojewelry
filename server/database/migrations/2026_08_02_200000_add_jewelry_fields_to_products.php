<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('material')->nullable()->after('description');
            $table->string('finish')->nullable()->after('material');
            $table->string('dimensions')->nullable()->after('finish');
            $table->json('size_options')->nullable()->after('dimensions');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['material', 'finish', 'dimensions', 'size_options']);
        });
    }
};
