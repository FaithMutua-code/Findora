<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;
class GoogleController extends Controller
{
public function callback()
{
    try {
        /** @var \Laravel\Socialite\Two\GoogleProvider $driver */
        $driver = Socialite::driver('google');
        $googleUser = $driver->stateless()->user();

        $user = User::updateOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
                'password' => null, // ← explicitly set null
                'email_verified_at' => now(),
            ]
        );

        $token = $user->createToken('auth_token')->plainTextToken;

        $appUrl = 'findora://auth/callback?' . http_build_query([
            'token' => $token,
            'user' => json_encode($user)
        ]);

        return redirect($appUrl);

    } catch (\Exception $e) {
        Log::error('Google auth failed: ' . $e->getMessage());
        return redirect('findora://auth/callback?error=failed');
    }
}
}
