<?php

use App\Http\Controllers\ChatMembersController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/register',[UserController::class,'register']);
Route::post('/login',[UserController::class,'login']);
Route::get('/user-data',[UserController::class,'getUserData']);
Route::post('/is-user',[UserController::class,'isUser']);
// Route::get('/index',[UserController::class,'index']);

Route::group(['middleware'=>['auth:sanctum']],function(){
    Route::post("/isLog", function () {  
        return response()->noContent();
    });
    Route::post('/logout',[UserController::class,'logout']);
    Route::post('/search',[UserController::class,'searchUser']);
    Route::post('/room',[RoomController::class,'createRoom']);
    Route::post('/check-members',[ChatMembersController::class,'checkRecord']);
    Route::post('/members',[ChatMembersController::class,'addMemberRecord']);
    Route::post('/store-message',[MessageController::class,'storeMessage']);
    Route::post('/get-messages',[MessageController::class,'getMessages']);
    Route::post('/rooms',[ChatMembersController::class,'getRooms']);
});