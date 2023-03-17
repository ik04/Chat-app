<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Ramsey\Uuid\Uuid;

class MessageController extends Controller
{
   public function storeMessage(Request $request){
    $validation = Validator::make($request->all(),[
        "user_id" =>"uuid|required",
        "room_id"=>"uuid|required",
        "message"=>"string|required",
    ]);
    if($validation->fails()){
        return response()->json($validation->errors()->all(),400);
    }
    $validated = $validation->validated();
    $message = Message::create([
        "user_id" =>$validated['user_id'],
        "room_id"=>$validated['room_id'],
        "message"=>$validated['message'],
        "uuid"=>Uuid::uuid4(),
    ]);
    return response()->json($message,201);
   }

   public function getMessages(Request $request){
    $validation = Validator::make($request->all(),[
        "room_id"=>"uuid|required",
    ]);
    if($validation->fails()){
        return response()->json($validation->errors()->all(),400);
    }
    $validated = $validation->validated();
    //* implement inner join
    // $messages = Message::where("room_id",$validated['room_id'])->orderBy("created_at")->get();
    $messages = Message::join("users","messages.user_id","=","users.user_id")->get(["name","message"]);
    return response()->json($messages,200);

    

    
    
   }
}