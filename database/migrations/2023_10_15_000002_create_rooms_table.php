<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price_per_night', 10, 2);
            $table->integer('max_guests')->default(2);
            $table->string('bed_type')->nullable();
            $table->string('size_room')->nullable();
            $table->enum('status', ['available', 'unavailable'])->default('available');
            $table->json('amenities')->nullable();
            $table->integer('total_rooms')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
