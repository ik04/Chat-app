<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Ramsey\Uuid\Uuid;

class RoomController extends Controller
{
    public function createRoom(Request $request){
            $room = Room::create([
                "uuid" => Uuid::uuid4(),
            ]);
            return response()->json($room->uuid,201);
        
    }
}