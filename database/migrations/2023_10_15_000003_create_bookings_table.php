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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('room_count')->default(1);
            $table->string('user_line_id')->nullable();
            $table->string('full_name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->enum('status', ['pending', 'waiting_payment', 'confirmed', 'canceled'])->default('pending');
            $table->decimal('total_price', 10, 2)->default(0.00);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
