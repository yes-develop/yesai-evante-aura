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
        Schema::create('chat_assignments', function (Blueprint $table) {
            $table->id();
            $table->string('line_uuid')->index();
            $table->unsignedBigInteger('user_id');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Ensure one assignment per chat
            $table->unique('line_uuid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_assignments');
    }
};
