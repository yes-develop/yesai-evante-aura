<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('role')->unique();
            $table->text('permission')->nullable(); // JSON array of permission strings
            $table->timestamps();
        });

        // Seed default roles
        DB::table('role_permissions')->insert([
            [
                'role' => 'admin',
                'permission' => json_encode([
                    'dashboard', 'branches', 'rooms', 'bookings',
                    'broadcasts', 'analytics', 'automations', 'ai',
                    'messages', 'contacts',
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role' => 'sales',
                'permission' => json_encode([
                    'dashboard', 'messages', 'contacts', 'bookings',
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};
