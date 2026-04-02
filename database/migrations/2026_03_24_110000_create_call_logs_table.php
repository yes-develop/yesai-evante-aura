<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('call_logs', function (Blueprint $table) {
            $table->id();
            $table->string('vapi_call_id')->unique()->nullable();
            $table->string('phone_number')->nullable();
            $table->enum('direction', ['inbound', 'outbound'])->default('inbound');
            $table->enum('status', ['ringing', 'in-progress', 'completed', 'failed', 'no-answer'])->default('ringing');
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->string('assistant_id')->nullable();
            $table->string('customer_name')->nullable();
            $table->text('summary')->nullable();
            $table->enum('sentiment', ['positive', 'neutral', 'negative'])->nullable();
            $table->string('recording_url')->nullable();
            $table->decimal('cost', 10, 6)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('call_logs');
    }
};
