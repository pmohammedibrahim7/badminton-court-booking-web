<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\MembershipGroup;
use App\Models\MembershipTier;
use App\Models\Booking;
use App\Models\Setting;
use App\Mail\MembershipCredentialsMail;

class AdminController extends Controller
{

    /* =========================================================================
       MEMBERSHIP GROUPS CRUD
       ========================================================================= */

    public function indexGroups()
    {
        $groups = MembershipGroup::with('tier')->withCount('members')->get();
        return response()->json(['groups' => $groups]);
    }

    public function showGroup($id)
    {
        $group = MembershipGroup::with(['tier', 'members'])->findOrFail($id);
        return response()->json(['group' => $group]);
    }

    public function storeGroup(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'tier_id' => 'required|exists:membership_tiers,id',
            'status' => 'required|in:pending,paid,expired',
            'expires_at' => 'nullable|date',
        ]);

        $group = MembershipGroup::create($request->all());

        return response()->json([
            'group' => $group,
            'message' => 'Membership group created successfully.'
        ]);
    }

    public function updateGroup(Request $request, $id)
    {
        $group = MembershipGroup::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'tier_id' => 'required|exists:membership_tiers,id',
            'status' => 'required|in:pending,paid,expired',
            'expires_at' => 'nullable|date',
        ]);

        $group->update($request->all());

        return response()->json([
            'group' => $group,
            'message' => 'Membership group updated successfully.'
        ]);
    }

    public function destroyGroup($id)
    {
        $group = MembershipGroup::findOrFail($id);
        
        // Delete all members in this group
        User::where('membership_group_id', $group->id)->delete();
        $group->delete();

        return response()->json([
            'message' => 'Membership group and all its members deleted successfully.'
        ]);
    }

    /* =========================================================================
       MEMBERSHIP PERSONS CRUD
       ========================================================================= */

    public function addMember(Request $request, $groupId)
    {
        $group = MembershipGroup::findOrFail($groupId);

        // Check if group already has 50 members
        $memberCount = User::where('membership_group_id', $group->id)->count();
        if ($memberCount >= 50) {
            return response()->json([
                'message' => 'This group has reached the limit of 50 members.'
            ], 422);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'profile_pic' => 'nullable|image|max:2048', // 2MB Max
        ]);

        $profilePicPath = null;
        if ($request->hasFile('profile_pic')) {
            $profilePicPath = $request->file('profile_pic')->store('profiles', 'public');
        }

        // Generate temporary password
        $tempPassword = Str::random(8);

        $member = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($tempPassword),
            'role' => 'member',
            'membership_group_id' => $group->id,
            'status' => 'active',
            'profile_pic' => $profilePicPath ? '/storage/' . $profilePicPath : null,
            'is_card_paid' => false,
        ]);

        // Send Email with credentials
        try {
            Mail::to($member->email)->send(new MembershipCredentialsMail($member->name, $member->email, $tempPassword, false));
        } catch (\Exception $e) {
            logger('Mail failed: ' . $e->getMessage());
        }

        return response()->json([
            'member' => $member,
            'message' => 'Member added successfully. Login credentials sent to email.'
        ]);
    }

    public function updateMember(Request $request, $id)
    {
        $member = User::where('role', 'member')->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $member->id,
            'phone' => 'required|string|max:20',
            'profile_pic' => 'nullable|image|max:2048',
            'status' => 'required|in:active,inactive',
        ]);

        $emailChanged = strtolower($request->email) !== strtolower($member->email);
        $tempPassword = null;

        if ($request->hasFile('profile_pic')) {
            // Delete old pic if exists
            if ($member->profile_pic) {
                $oldPath = str_replace('/storage/', '', $member->profile_pic);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('profile_pic')->store('profiles', 'public');
            $member->profile_pic = '/storage/' . $path;
        }

        $member->name = $request->name;
        $member->email = $request->email;
        $member->phone = $request->phone;
        $member->status = $request->status;

        if ($emailChanged) {
            $tempPassword = Str::random(8);
            $member->password = Hash::make($tempPassword);
        }

        $member->save();

        if ($emailChanged && $tempPassword) {
            // Email credentials update
            try {
                Mail::to($member->email)->send(new MembershipCredentialsMail($member->name, $member->email, $tempPassword, true));
            } catch (\Exception $e) {
                logger('Mail failed: ' . $e->getMessage());
            }
        }

        return response()->json([
            'member' => $member,
            'message' => $emailChanged 
                ? 'Member updated successfully. Email updated and new login credentials sent.'
                : 'Member updated successfully.'
        ]);
    }

    public function destroyMember($id)
    {
        $member = User::where('role', 'member')->findOrFail($id);
        
        if ($member->profile_pic) {
            $oldPath = str_replace('/storage/', '', $member->profile_pic);
            Storage::disk('public')->delete($oldPath);
        }

        $member->delete();

        return response()->json([
            'message' => 'Member deleted successfully.'
        ]);
    }

    public function toggleCardPaid(Request $request, $id)
    {
        $member = User::where('role', 'member')->findOrFail($id);

        $request->validate([
            'is_card_paid' => 'required|boolean',
            'card_number' => 'nullable|string|max:100',
        ]);

        $member->is_card_paid = $request->is_card_paid;
        
        if ($request->is_card_paid && !$request->card_number) {
            // Generate random card number if empty
            $member->card_number = 'MC-' . strtoupper(Str::random(10));
        } else {
            $member->card_number = $request->card_number;
        }

        $member->save();

        return response()->json([
            'member' => $member,
            'message' => $member->is_card_paid ? 'Card generated/paid successfully.' : 'Card unpaid.'
        ]);
    }

    /* =========================================================================
       MEMBERSHIP TIERS CRUD
       ========================================================================= */

    public function indexTiers()
    {
        $tiers = MembershipTier::all();
        return response()->json(['tiers' => $tiers]);
    }

    public function storeTier(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'tier_type' => 'required|in:monthly,quarterly,yearly',
            'description' => 'nullable|string',
        ]);

        $tier = MembershipTier::create($request->all());

        return response()->json([
            'tier' => $tier,
            'message' => 'Membership tier created successfully.'
        ]);
    }

    public function updateTier(Request $request, $id)
    {
        $tier = MembershipTier::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'tier_type' => 'required|in:monthly,quarterly,yearly',
            'description' => 'nullable|string',
        ]);

        $tier->update($request->all());

        return response()->json([
            'tier' => $tier,
            'message' => 'Membership tier updated successfully.'
        ]);
    }

    public function destroyTier($id)
    {
        $tier = MembershipTier::findOrFail($id);
        $tier->delete();

        return response()->json([
            'message' => 'Membership tier deleted successfully.'
        ]);
    }

    /* =========================================================================
       BOOKINGS MANAGEMENT
       ========================================================================= */

    public function indexBookings()
    {
        $bookings = Booking::with('user')->orderBy('booking_date', 'desc')->orderBy('start_time', 'asc')->get();
        return response()->json(['bookings' => $bookings]);
    }

    public function cancelBooking($id)
    {
        $booking = Booking::findOrFail($id);
        $booking->status = 'cancelled';
        $booking->save();

        return response()->json([
            'booking' => $booking,
            'message' => 'Booking cancelled successfully.'
        ]);
    }

    public function storeAdminBooking(Request $request)
    {
        $request->validate([
            'booking_date' => 'required|date_format:Y-m-d',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'type' => 'required|in:public,member,reserved',
        ]);

        $date = $request->input('booking_date');
        $startTime = $request->input('start_time');
        $endTime = $request->input('end_time');

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
                'message' => 'This slot overlaps with an existing booking.',
            ], 422);
        }

        do {
            $bookingId = 'BK-' . strtoupper(Str::random(6));
        } while (Booking::where('booking_id', $bookingId)->exists());

        $booking = Booking::create([
            'booking_id' => $bookingId,
            'booking_date' => $date,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'type' => $request->type,
            'status' => 'confirmed'
        ]);

        return response()->json([
            'booking' => $booking,
            'message' => 'Booking reserved successfully.'
        ]);
    }

    /* =========================================================================
       SETTINGS MANAGEMENT
       ========================================================================= */

    public function getSettings()
    {
        $settings = [
            'admin_name' => Setting::getValue('admin_name', 'Admin User'),
            'admin_phone' => Setting::getValue('admin_phone', '9876543210'),
            'reserved_hours' => json_decode(Setting::getValue('reserved_hours', '[]'), true),
        ];

        return response()->json(['settings' => $settings]);
    }

    public function saveSettings(Request $request)
    {
        $request->validate([
            'admin_name' => 'required|string|max:255',
            'admin_phone' => 'required|string|max:20',
            'reserved_hours' => 'required|array',
            'reserved_hours.*.day' => 'required|string',
            'reserved_hours.*.start' => 'required|date_format:H:i',
            'reserved_hours.*.end' => 'required|date_format:H:i|after:reserved_hours.*.start',
        ]);

        Setting::setValue('admin_name', $request->admin_name);
        Setting::setValue('admin_phone', $request->admin_phone);
        Setting::setValue('reserved_hours', json_encode($request->reserved_hours));

        return response()->json([
            'message' => 'Admin details and reserved hours saved successfully.'
        ]);
    }
}
