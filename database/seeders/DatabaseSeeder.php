<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        if (!\App\Models\User::where('email', 'admin@evante.com')->exists()) {
            \App\Models\User::create([
                'first_name' => 'Admin',
                'last_name'  => 'Evante',
                'email'      => 'admin@evante.com',
                'password'   => bcrypt('password123'),
                'role'       => 'admin',
            ]);
        }
    }
}
