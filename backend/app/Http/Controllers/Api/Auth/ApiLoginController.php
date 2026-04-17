<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
class ApiLoginController extends Controller
{
    public function login(Request $request)
    {
        $validationRule=[
            'email' => 'required|email',
            'password' => 'required'
        ];
        $validation = Validator::make(data:$request->all(),rules:$validationRule);
 if ($validation->fails()) {
       return response()->json([
        'status' => false,
        'message' => $validation->errors()->all(),
    ]);
    }

    $credentials = $request->only('email', 'password');

    if(!Auth::attempt($credentials)){
        return response()->json([
            'status' => false,
            'message' => 'Invalid email or password',
        ]);
    }
    $user =Auth::user();
    $token = $user->createToken('auth_token')->plainTextToken;
     return response()->json([
        'status' => true,
        'message' => 'Login successful',
        'user'=>$user,
        'token' => $token,
    ]);
}
public function logout(Request $request)
{
    $user = $request->user();

    $user->tokens()->delete();
    $user->delete();

    return response()->json([
        'message' => 'Account deleted'
    ]);
}
}
