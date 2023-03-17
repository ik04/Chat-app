<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

use Ramsey\Uuid\Uuid;

class UserController extends Controller
{
    public function register(Request $request){
        $validation = Validator::make($request->all(),[
            'name' =>'required|string',
            "email"=>'required|string|unique:users',
            'password'=>'required|string|confirmed'
        ]);
        if($validation->fails()){
            return response()->json($validation->errors()->all(),400);
        }
        $validated = $validation->validated();
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'user_id' => Uuid::uuid4(),
        ]);
        return response()->json(['user'=>$user],201);
    }
    public function login(Request $request){
        $validation = Validator::make($request->all(),[
            "email"=>'required|string',
            'password'=>'required|string'
        ]);
        if($validation->fails()){
            return response()->json($validation->errors()->all(),400);
        }
        $validated = $validation->validated();
        $user = User::where('email',$validated['email'])->first();
        if(!$user){
            return response()->json(['error'=>"Email Not registered"],400);
        }
        if(!Hash::check($validated['password'],$user->password)){
            return response()->json(['error'=>'Invalid Credentials'],400);
        }
        $token = $user->createToken('myapptoken')->plainTextToken;
        return response()->json(['user'=>$user,'token'=>$token],200)->withCookie(cookie()->forever('at',$token));

    }
    public function logout(Request $request){

        $request->user()->currentAccessToken()->delete();
        $response =  [
            'message' => 'logged out'
        ];
        return response($response,200);

    }
    public function index(Request $request){
        return response()->json(User::all(),200);
    }
    public function getUserData(Request $request){
        if(!$request->hasCookie("at")){
            return response()->json([
                'message' => "Unauthenticated1"
            ],401);
        }
        if($token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->cookie("at"))){
            $user = $token->tokenable;
        }
        else{
            return response()->json([
                'message' => "unauthenticated2"
            ]);
        }
        if(is_null($user)){
            return response()->json([
                'message' => "Unauthenticated3"
            ],401);
        }
        return response() -> json([
            'user' => $user,
            'access_token' => $request -> cookie('at')
        ]);
    }
    public function isUser(Request $request){
        $fields = $request->validate([
            'user_id' =>'uuid',
        ]);
        $check = User::where('user_id',$fields['user_id'])->first();
        if($check){
            return response()->json($check,200);
        }else{
            return response("user not found",404); 
        }
    }
    public function searchUser(Request $request){
        try{
            $fields = $request->validate([
                'search' =>'string',
            ]);
            if($request->has('search')){    
                $users = User::select('name','user_id')->where('name','LIKE','%'.$fields['search'].'%')->orWhere('name','LIKE','%'.$fields['search'].'%')->get();
                // $users = Profile::select('image','name','username')->where(['name','LIKE','%'.$fields['search'].'%'],['username','LIKE','%'.$fields['search'].'%'])->get();
                return response()->json($users,200);
            }else{
                $users = User::select('name','user_id')->limit(8)->get();
                // * learn lazy loading
                return response()->json($users,200);
                // return response()->json("an error has occured",500);
            }
        }catch(Exception $e){
            return response($e->getMessage(),400);
        }
        }
}