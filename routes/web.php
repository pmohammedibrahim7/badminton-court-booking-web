<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SuperAdminController;

// Public & Session routes
Route::prefix('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    Route::get('/availability', [BookingController::class, 'getAvailability']);
    Route::post('/bookings', [BookingController::class, 'bookCourt']);
    Route::get('/tournaments', [BookingController::class, 'getTournaments']);

    // Admin APIs (protected by AdminMiddleware)
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/groups', [AdminController::class, 'indexGroups']);
        Route::get('/groups/{id}', [AdminController::class, 'showGroup']);
        Route::post('/groups', [AdminController::class, 'storeGroup']);
        Route::put('/groups/{id}', [AdminController::class, 'updateGroup']);
        Route::delete('/groups/{id}', [AdminController::class, 'destroyGroup']);

        Route::post('/groups/{groupId}/members', [AdminController::class, 'addMember']);
        Route::post('/members/{id}', [AdminController::class, 'updateMember']); // using POST to support file upload
        Route::delete('/members/{id}', [AdminController::class, 'destroyMember']);
        Route::post('/members/{id}/card', [AdminController::class, 'toggleCardPaid']);

        Route::get('/tiers', [AdminController::class, 'indexTiers']);
        Route::post('/tiers', [AdminController::class, 'storeTier']);
        Route::put('/tiers/{id}', [AdminController::class, 'updateTier']);
        Route::delete('/tiers/{id}', [AdminController::class, 'destroyTier']);

        Route::get('/bookings', [AdminController::class, 'indexBookings']);
        Route::post('/bookings', [AdminController::class, 'storeAdminBooking']);
        Route::delete('/bookings/{id}', [AdminController::class, 'cancelBooking']);

        Route::get('/settings', [AdminController::class, 'getSettings']);
        Route::post('/settings', [AdminController::class, 'saveSettings']);
    });

    // Super Admin APIs (protected by SuperAdminMiddleware)
    Route::prefix('super')->middleware('super_admin')->group(function () {
        Route::get('/admins', [SuperAdminController::class, 'indexAdmins']);
        Route::post('/admins', [SuperAdminController::class, 'storeAdmin']);
        Route::put('/admins/{id}', [SuperAdminController::class, 'updateAdmin']);
        Route::delete('/admins/{id}', [SuperAdminController::class, 'destroyAdmin']);

        Route::get('/app-info', [SuperAdminController::class, 'getAppInfo']);
        Route::post('/app-info', [SuperAdminController::class, 'saveAppInfo']); // using POST to support logo file upload

        Route::get('/tournaments', [SuperAdminController::class, 'indexTournaments']);
        Route::post('/tournaments', [SuperAdminController::class, 'storeTournament']);
        Route::put('/tournaments/{id}', [SuperAdminController::class, 'updateTournament']);
        Route::delete('/tournaments/{id}', [SuperAdminController::class, 'destroyTournament']);
    });
});

// Fallback to serve the built React frontend
Route::fallback(function () {
    $path = public_path('frontend/index.html');
    if (file_exists($path)) {
        return response()->file($path);
    }
    return view('welcome');
});
