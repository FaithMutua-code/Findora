<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\ApiLoginController;
use App\Http\Controllers\Api\Auth\ApiRegisterController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\MessageController;
Route::post('/login', [ApiLoginController::class, 'login']);
Route::post('/register', [ApiRegisterController::class, 'register']);
Route::post('/logout', [ApiLoginController::class, 'logout'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'show']);
    Route::put('/user', [UserController::class, 'update']);
    Route::post('/items', [ItemController::class, 'store']);
      Route::get('/items', [ItemController::class, 'index']);
         Route::post('/messages', [MessageController::class, 'send']);
    Route::get('/messages/{userId}', [MessageController::class, 'fetch']);
});
