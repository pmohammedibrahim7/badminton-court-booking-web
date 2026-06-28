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
        Schema::create('membership_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('tier_id')->constrained('membership_tiers')->cascadeOnDelete();
            $table->string('status')->default('pending'); // pending, paid, expired
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('membership_groups');
    }
};
