<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['booking_id', 'user_id', 'name', 'email', 'phone', 'booking_date', 'start_time', 'end_time', 'type', 'status'])]
class Booking extends Model
{
    /**
     * Get the user who made the booking.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
