<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Models\Booking;
use App\Models\Setting;
use App\Models\Tournament;
use App\Mail\BookingConfirmationMail;
use Carbon\Carbon;

class BookingController extends Controller
{
    /**
     * Get availability, reserved hours, and admin contacts.
     */
    public function getAvailability(Request $request)
    {
        $request->validate([
            'date' => 'required|date_format:Y-m-d',
        ]);

        $date = $request->query('date');
        $dayOfWeek = Carbon::parse($date)->format('l'); // e.g. "Monday"

        // Fetch confirmed bookings for this date
        $bookings = Booking::where('booking_date', $date)
            ->where('status', 'confirmed')
            ->get(['start_time', 'end_time', 'type', 'id']);

        // Fetch reserved hours
        $reservedHoursJson = Setting::getValue('reserved_hours');
        $reservedHours = [];
        if ($reservedHoursJson) {
            $allReserved = json_decode($reservedHoursJson, true);
            foreach ($allReserved as $rh) {
                if (strtolower($rh['day']) === strtolower($dayOfWeek)) {
                    $reservedHours[] = [
                        'start' => $rh['start'],
                        'end' => $rh['end']
                    ];
                }
            }
        }

        // Admin contacts
        $adminName = Setting::getValue('admin_name', 'Admin');
        $adminPhone = Setting::getValue('admin_phone', '9876543210');

        return response()->json([
            'date' => $date,
            'day_of_week' => $dayOfWeek,
            'bookings' => $bookings,
            'reserved_hours' => $reservedHours,
            'admin_details' => [
                'name' => $adminName,
                'phone' => $adminPhone,
            ]
        ]);
    }

    /**
     * Create a court booking.
     */
    public function bookCourt(Request $request)
    {
        $request->validate([
            'booking_date' => 'required|date_format:Y-m-d',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'booking_type' => 'required|in:public,member',
        ]);

        $date = $request->input('booking_date');
        $startTime = $request->input('start_time');
        $endTime = $request->input('end_time');
        $bookingType = $request->input('booking_type');

        // Prevent double booking
        $overlapExists = Booking::where('booking_date', $date)
            ->where('status', 'confirmed')
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
            })
            ->exists();

        if ($overlapExists) {
            return response()->json([
                'message' => 'This slot is already booked. Please choose another time.',
            ], 422);
        }

        $bookingData = [
            'booking_date' => $date,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => 'confirmed',
        ];

        if ($bookingType === 'public') {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
            ]);

            // Check if slot falls in reserved hours (for public users)
            $dayOfWeek = Carbon::parse($date)->format('l');
            $reservedHoursJson = Setting::getValue('reserved_hours');
            if ($reservedHoursJson) {
                $allReserved = json_decode($reservedHoursJson, true);
                foreach ($allReserved as $rh) {
                    if (strtolower($rh['day']) === strtolower($dayOfWeek)) {
                        // Check time overlap
                        // start_time < reserved_end AND end_time > reserved_start
                        if ($startTime < $rh['end'] && $endTime > $rh['start']) {
                            $adminName = Setting::getValue('admin_name', 'Admin');
                            $adminPhone = Setting::getValue('admin_phone', '9876543210');
                            return response()->json([
                                'message' => "This slot is in reserved hours (Members only).",
                                'is_reserved' => true,
                                'admin_details' => [
                                    'name' => $adminName,
                                    'phone' => $adminPhone,
                                ]
                            ], 403);
                        }
                    }
                }
            }

            $bookingData['user_id'] = null;
            $bookingData['name'] = $request->input('name');
            $bookingData['email'] = $request->input('email');
            $bookingData['phone'] = $request->input('phone');
            $bookingData['type'] = 'public';
        } else {
            // Member booking
            if (!Auth::check()) {
                return response()->json([
                    'message' => 'You must be logged in as a member to book this slot.',
                ], 401);
            }

            $user = Auth::user();
            if ($user->role !== 'member') {
                return response()->json([
                    'message' => 'Only members can perform member bookings.',
                ], 403);
            }

            $bookingData['user_id'] = $user->id;
            $bookingData['name'] = $user->name;
            $bookingData['email'] = $user->email;
            $bookingData['phone'] = $user->phone;
            $bookingData['type'] = 'member';
        }

        // Generate unique Booking ID
        do {
            $bookingId = 'BK-' . strtoupper(Str::random(6));
        } while (Booking::where('booking_id', $bookingId)->exists());

        $bookingData['booking_id'] = $bookingId;

        // Create booking
        $booking = Booking::create($bookingData);

        // Send confirmation email
        try {
            Mail::to($booking->email)->send(new BookingConfirmationMail($booking));
        } catch (\Exception $e) {
            // Log error but proceed
            logger('Mail failed to send: ' . $e->getMessage());
        }

        return response()->json([
            'booking' => $booking,
            'message' => 'Booking confirmed! A confirmation email has been sent.',
        ]);
    }

    /**
     * Get list of tournaments.
     */
    public function getTournaments(Request $request)
    {
        $isMember = Auth::check() && Auth::user()->role === 'member';

        $query = Tournament::query()->orderBy('date', 'asc');

        if (!$isMember) {
            $query->where('visibility', 'all');
        }

        $tournaments = $query->get();

        return response()->json([
            'tournaments' => $tournaments
        ]);
    }
}
