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
        Schema::create('automations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['Automatic message', 'Team Collaboration', 'Chatbots', 'Chat Management']);
            $table->enum('mode', ['AI', 'Manual'])->default('AI');
            $table->string('integration')->nullable();
            $table->string('created_by');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->integer('response_time')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('automations');
    }
}; 