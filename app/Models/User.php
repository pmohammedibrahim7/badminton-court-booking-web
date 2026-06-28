<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role', 'phone', 'profile_pic', 'membership_group_id', 'status', 'is_card_paid', 'card_number'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_card_paid' => 'boolean',
        ];
    }

    /**
     * Get the membership group that this user belongs to.
     */
    public function membershipGroup()
    {
        return $this->belongsTo(MembershipGroup::class, 'membership_group_id');
    }

    /**
     * Get the bookings made by this user.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
