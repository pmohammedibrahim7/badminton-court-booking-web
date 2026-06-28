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
            $table->string('booking_id')->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('name')->nullable(); // For public booking details
            $table->string('email')->nullable(); // For public booking details
            $table->string('phone')->nullable(); // For public booking details
            $table->date('booking_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('type')->default('public'); // public, member, reserved
            $table->string('status')->default('confirmed'); // confirmed, cancelled
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
