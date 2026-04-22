<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;
class GoogleController extends Controller
{
  public function redirect()
{
    $url = Socialite::driver('google')
        ->stateless()
        ->redirect()
        ->getTargetUrl();

    // Temporarily log it to see exact URI
    Log::info('Google redirect URL: ' . $url);

    return response()->json(['url' => $url]);
}

    public function callback()
{
    $googleUser = Socialite::driver('google')->stateless()->user();

    $user = User::updateOrCreate(
        ['email' => $googleUser->getEmail()],
        [
            'name' => $googleUser->getName(),
            'google_id' => $googleUser->getId(),
        ]
    );

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'user' => $user,
        'token' => $token,
    ]);
}
}
