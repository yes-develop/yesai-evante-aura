<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('call_transcripts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('call_log_id')->constrained('call_logs')->onDelete('cascade');
            $table->enum('speaker', ['ai', 'human', 'system'])->default('human');
            $table->text('content');
            $table->unsignedInteger('timestamp_ms')->nullable();
            $table->boolean('is_final')->default(true);
            $table->float('confidence')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('call_transcripts');
    }
};
