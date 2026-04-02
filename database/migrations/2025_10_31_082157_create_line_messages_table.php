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
        Schema::create('line_messages', function (Blueprint $table) {
            $table->id();
            $table->string('line_uuid');
            $table->text('message')->nullable();
            $table->text('ai_response')->nullable();
            $table->string('display_name')->nullable();
            $table->string('message_channel')->default('Line');
            $table->string('chat_mode')->default('Active');
            $table->string('message_id')->nullable();
            $table->timestamp('message_timestamp')->nullable();
            $table->timestamps();
            
            $table->index('line_uuid');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('line_messages');
    }
};
