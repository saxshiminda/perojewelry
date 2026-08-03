<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('posts');
    }

    public function down(): void
    {
        // Blog feature removed — no restore
    }
};
