<?php

namespace App\Http\Controllers;

use App\Models\chat_members;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChatMembersController extends Controller
{
    // * for the first time i wanna assume dm only
    public function addMemberRecord(Request $request){
        $validation = Validator::make($request->all(),[
            "room_id"=>'uuid',
            'user_id'=>'uuid',
            'user_id2'=>'uuid'
        ]);
        if($validation->fails()){
            return response()->json($validation->errors()->all(),400);
        }
        $validated = $validation->validated();
        $user1 = User::select("id")->where('user_id',$validated["user_id"])->first("id");
        $user2 = User::select("id")->where('user_id',$validated["user_id2"])->first("id");
        
        $record = chat_members::create([
                "room_id" => $validated['room_id'],
                "user_id" => $validated["user_id"],
                "user_id2" =>$validated["user_id2"]
            ]);
            return response()->json($record,201);
    }
    public function checkRecord(Request $request){
        $validation = Validator::make($request->all(),[
            'user_id'=>'uuid',
            'user_id2'=>'uuid'
        ]);
        if($validation->fails()){
            return response()->json($validation->errors()->all(),400);
        }
        $validated = $validation->validated();
        //! don't allow user 1 and 2 to be the same, user can't text themselves
        if($validated["user_id"] === $validated["user_id2"]){
            return response()->json("user cannot text themselves",403);
        }
        // $user1 = User::select("id")->where('uuid',$validated["user_id"])->first("id");
        // $user2 = User::select("id")->where('uuid',$validated["user_id2"])->first("id");
        $room = chat_members::where("user_id",$validated["user_id"])->where("user_id2",$validated["user_id2"])->first();
        if(($room)){
            return response()->json($room,200);
        }
        else{
            return response()->noContent();
        }
    }
}

/*
* if no content is returned in check the create room function is run and the obtained room id passed into create record,
* otherwise the existing record is passed with the room id ready for use.
* issue: refresh causes user change?????
? not an issue just implement ssr to fix (redir to login when stored cookie is change), discuss with pranav or armaan
*/