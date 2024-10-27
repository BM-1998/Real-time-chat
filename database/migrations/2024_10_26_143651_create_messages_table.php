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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade'); // FK to users
            $table->text('content'); // Message content
            $table->foreignId('room_id')->nullable()->constrained()->onDelete('cascade'); // Nullable for individual messages
            $table->foreignId('receiver_id')->nullable()->constrained('users')->onDelete('cascade'); // Nullable for group messages
            $table->boolean('is_group')->default(false); // True for group, false for individual
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
