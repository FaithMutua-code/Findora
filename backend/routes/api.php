<?php
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\ApiLoginController;
use App\Http\Controllers\Api\Auth\ApiRegisterController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\GoogleController;

Route::post('/login', [ApiLoginController::class, 'login']);
Route::post('/register', [ApiRegisterController::class, 'register']);
Route::post('/logout', [ApiLoginController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/auth/google', [GoogleController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleController::class, 'callback']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'show']);
    Route::put('/user', [UserController::class, 'update']);
    Route::post('/items', [ItemController::class, 'store']);
      Route::get('/items', [ItemController::class, 'index']);
      Route::get('/items/{id}', [ItemController::class, 'show']);
      Route::get('/matches/{id}', [ItemController::class, 'findMatches']);
    Route::get('/messages/{userId}', [MessageController::class, 'fetch']);
       Route::post('/items/{id}/recover', [ItemController::class, 'markAsReturned']);
    Route::get('/recovery-stats', [ItemController::class, 'recoveryStats']);
    Route::post('/messages', [MessageController::class, 'send']);
    Route::post('/fcm-token',[UserController::class, 'updateFcmToken']);
});

    Route::post('/broadcasting/auth', function () {
        return Broadcast::auth(request());
    });
