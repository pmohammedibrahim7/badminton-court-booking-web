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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('public'); // super_admin, admin, member, public
            $table->string('phone')->nullable();
            $table->string('profile_pic')->nullable();
            $table->foreignId('membership_group_id')->nullable()->constrained('membership_groups')->nullOnDelete();
            $table->string('status')->default('active'); // active, inactive
            $table->boolean('is_card_paid')->default(false);
            $table->string('card_number')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['membership_group_id']);
            $table->dropColumn([
                'role',
                'phone',
                'profile_pic',
                'membership_group_id',
                'status',
                'is_card_paid',
                'card_number'
            ]);
        });
    }
};
