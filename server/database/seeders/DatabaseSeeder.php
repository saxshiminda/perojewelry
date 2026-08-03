<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@perojewelry.com'],
            [
                'name' => 'Admin User',
                'password' => 'password',
            ]
        );
        $admin->forceFill(['role' => 'admin'])->save();

        $this->call(ProductSeeder::class);
    }
}
