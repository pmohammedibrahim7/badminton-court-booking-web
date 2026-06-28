<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Super Admin
        \Illuminate\Support\Facades\DB::table('users')->insertOrIgnore([
            'id' => 1,
            'name' => 'Super Admin',
            'email' => 'super@booking.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'super_admin',
            'phone' => '1234567890',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed Default Admin
        \Illuminate\Support\Facades\DB::table('users')->insertOrIgnore([
            'id' => 2,
            'name' => 'Admin User',
            'email' => 'admin@booking.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'admin',
            'phone' => '9876543210',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed Membership Tiers
        \Illuminate\Support\Facades\DB::table('membership_tiers')->insertOrIgnore([
            [
                'id' => 1,
                'name' => 'Monthly Tier',
                'price' => 30.00,
                'tier_type' => 'monthly',
                'description' => 'Standard monthly membership with access during reserved hours.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Quarterly Tier',
                'price' => 80.00,
                'tier_type' => 'quarterly',
                'description' => 'Save with a quarterly membership and access during reserved hours.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Yearly Tier',
                'price' => 280.00,
                'tier_type' => 'yearly',
                'description' => 'Ultimate yearly membership with full privileges and best value.',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // Seed App & Admin Settings
        $defaultSettings = [
            'app_name' => 'Smash Badminton Club',
            'app_logo' => '',
            'admin_name' => 'Admin User',
            'admin_phone' => '9876543210',
            'reserved_hours' => json_encode([
                ['day' => 'Monday', 'start' => '18:00', 'end' => '20:00'],
                ['day' => 'Tuesday', 'start' => '18:00', 'end' => '20:00'],
                ['day' => 'Wednesday', 'start' => '18:00', 'end' => '20:00'],
                ['day' => 'Thursday', 'start' => '18:00', 'end' => '20:00'],
                ['day' => 'Friday', 'start' => '18:00', 'end' => '20:00'],
                ['day' => 'Saturday', 'start' => '16:00', 'end' => '19:00'],
                ['day' => 'Sunday', 'start' => '09:00', 'end' => '12:00'],
            ])
        ];

        foreach ($defaultSettings as $key => $value) {
            \Illuminate\Support\Facades\DB::table('settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $value, 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
