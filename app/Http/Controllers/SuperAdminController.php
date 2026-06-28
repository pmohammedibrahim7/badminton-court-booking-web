<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Models\Setting;
use App\Models\Tournament;

class SuperAdminController extends Controller
{

    /* =========================================================================
       ADMINS CRUD
       ========================================================================= */

    public function indexAdmins()
    {
        // For admin users, we repurpose is_card_paid as is_visible
        $admins = User::where('role', 'admin')->get();
        
        $admins = $admins->map(function ($admin) {
            $admin->is_visible = (bool)$admin->is_card_paid;
            return $admin;
        });

        return response()->json(['admins' => $admins]);
    }

    public function storeAdmin(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'required|string|max:20',
            'status' => 'required|in:active,inactive',
            'is_visible' => 'required|boolean',
        ]);

        $admin = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin',
            'phone' => $request->phone,
            'status' => $request->status,
            'is_card_paid' => $request->is_visible, // Repurposing is_card_paid
        ]);

        $admin->is_visible = (bool)$admin->is_card_paid;

        return response()->json([
            'admin' => $admin,
            'message' => 'Admin created successfully.'
        ]);
    }

    public function updateAdmin(Request $request, $id)
    {
        $admin = User::where('role', 'admin')->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $admin->id,
            'password' => 'nullable|string|min:6',
            'phone' => 'required|string|max:20',
            'status' => 'required|in:active,inactive',
            'is_visible' => 'required|boolean',
        ]);

        $admin->name = $request->name;
        $admin->email = $request->email;
        $admin->phone = $request->phone;
        $admin->status = $request->status;
        $admin->is_card_paid = $request->is_visible; // Repurposing is_card_paid

        if ($request->filled('password')) {
            $admin->password = Hash::make($request->password);
        }

        $admin->save();

        $admin->is_visible = (bool)$admin->is_card_paid;

        return response()->json([
            'admin' => $admin,
            'message' => 'Admin updated successfully.'
        ]);
    }

    public function destroyAdmin($id)
    {
        $admin = User::where('role', 'admin')->findOrFail($id);
        $admin->delete();

        return response()->json([
            'message' => 'Admin deleted successfully.'
        ]);
    }

    /* =========================================================================
       APP INFO SETTINGS
       ========================================================================= */

    public function getAppInfo()
    {
        return response()->json([
            'app_name' => Setting::getValue('app_name', 'Smash Badminton Club'),
            'app_logo' => Setting::getValue('app_logo', ''),
        ]);
    }

    public function saveAppInfo(Request $request)
    {
        $request->validate([
            'app_name' => 'required|string|max:255',
            'app_logo' => 'nullable|image|max:2048', // 2MB Max
        ]);

        Setting::setValue('app_name', $request->app_name);

        if ($request->hasFile('app_logo')) {
            // Delete old logo if exists
            $oldLogo = Setting::getValue('app_logo');
            if ($oldLogo) {
                $oldPath = str_replace('/storage/', '', $oldLogo);
                Storage::disk('public')->delete($oldPath);
            }
            
            $path = $request->file('app_logo')->store('app', 'public');
            Setting::setValue('app_logo', '/storage/' . $path);
        }

        return response()->json([
            'app_name' => Setting::getValue('app_name'),
            'app_logo' => Setting::getValue('app_logo'),
            'message' => 'Application information updated successfully.'
        ]);
    }

    /* =========================================================================
       TOURNAMENTS CRUD
       ========================================================================= */

    public function indexTournaments()
    {
        $tournaments = Tournament::orderBy('date', 'desc')->get();
        return response()->json(['tournaments' => $tournaments]);
    }

    public function storeTournament(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date_format:Y-m-d',
            'prizes' => 'required|array', // e.g. [{"place": 1, "amount": "1000", "type": "cash"}]
            'visibility' => 'required|in:all,members_only',
        ]);

        $tournament = Tournament::create($request->all());

        return response()->json([
            'tournament' => $tournament,
            'message' => 'Tournament created successfully.'
        ]);
    }

    public function updateTournament(Request $request, $id)
    {
        $tournament = Tournament::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date_format:Y-m-d',
            'prizes' => 'required|array',
            'visibility' => 'required|in:all,members_only',
        ]);

        $tournament->update($request->all());

        return response()->json([
            'tournament' => $tournament,
            'message' => 'Tournament updated successfully.'
        ]);
    }

    public function destroyTournament($id)
    {
        $tournament = Tournament::findOrFail($id);
        $tournament->delete();

        return response()->json([
            'message' => 'Tournament deleted successfully.'
        ]);
    }
}
