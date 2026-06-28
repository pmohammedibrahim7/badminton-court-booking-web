<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Models\User;
use App\Mail\OtpMail;

class PasswordResetController extends Controller
{
    /**
     * Send OTP to member email for password reset.
     */
    public function requestOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();
        // Only members can use this flow
        if ($user->role !== 'member') {
            return response()->json(['message' => 'Only members can reset password via OTP.'], 403);
        }

        // Generate 6‑digit numeric OTP
        $otp = random_int(100000, 999999);
        $expiresAt = Carbon::now()->addMinutes(5); // 5‑minute validity

        $user->otp_code = (string) $otp;
        $user->otp_expires_at = $expiresAt;
        $user->otp_attempts = 0; // reset attempts
        $user->save();

        try {
            Mail::to($user->email)->send(new OtpMail($user->name, $user->email, $otp, $expiresAt));
        } catch (\Exception $e) {
            Log::error('OTP mail failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to send OTP email.'], 500);
        }

        return response()->json(['message' => 'OTP sent successfully.']);
    }

    /**
     * Verify OTP and reset password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|digits:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        // Check attempts
        if ($user->otp_attempts >= 3) {
            return response()->json(['message' => 'Maximum OTP verification attempts exceeded.'], 429);
        }

        // Verify OTP and expiry
        if ($user->otp_code !== $request->otp) {
            $user->increment('otp_attempts');
            return response()->json(['message' => 'Invalid OTP.'], 422);
        }

        if (Carbon::now()->greaterThan($user->otp_expires_at)) {
            $user->increment('otp_attempts');
            return response()->json(['message' => 'OTP has expired.'], 422);
        }

        // All good – update password and clear OTP data
        $user->password = Hash::make($request->password);
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->otp_attempts = 0;
        $user->save();

        return response()->json(['message' => 'Password has been reset successfully.']);
    }
}
?>
