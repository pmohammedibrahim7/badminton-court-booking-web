<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Authenticate user and create session.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            if ($user->status !== 'active') {
                Auth::logout();
                return response()->json([
                    'message' => 'Your account is deactivated. Please contact support.',
                ], 403);
            }

            $request->session()->regenerate();

            // Load membership group if member
            if ($user->role === 'member' && $user->membership_group_id) {
                $user->load('membershipGroup.tier');
            }

            return response()->json([
                'user' => $user,
                'message' => 'Login successful',
            ]);
        }

        return response()->json([
            'message' => 'The provided credentials do not match our records.',
        ], 422);
    }

    /**
     * Logout and destroy session.
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated user.
     */
    public function me(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            if ($user->role === 'member' && $user->membership_group_id) {
                $user->load('membershipGroup.tier');
            }
            return response()->json(['user' => $user]);
        }

        return response()->json(['user' => null], 401);
    }
}
