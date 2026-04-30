<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Validation\Rule;

class PasswordResetController extends Controller
{
    public function sendOtp(Request $request)
    {
   $request->validate([
    'email' => ['required', 'email', Rule::exists('users', 'email')],
]);
     $otp =str_pad(random_int(0,999999),6,'0',STR_PAD_LEFT);

     DB::table('password_reset_tokens')->updateOrInsert(
        ['email'=>$request->email],
        [
            'token'=>Hash::make($otp),
            'created_at'=>Carbon::now(),
        ]
     );
    Mail::send('emails.otp',['otp' =>$otp], function ($email) use ($request)
    {
        $email->to($request->email)
              ->subject('Findora -Password Reset OTP');  
    }); 
      return response()->json([
            'status'  => true,
            'message' => 'OTP sent to your email',
        ]);
    }

    public function verifyOtp(Request $request){
        $request->validate([
            'email'=>'required|email',
            'otp'=>'required|string|size:6',
        ]);
    $record =DB::table('password_reset_tokens')->where('email',$request->email)->first();
    
    if(!$record){
        return response()->json(['status'=>false,'messages'=>'OTP not found'],404);
    }
    //expiry

    if(Carbon::parse($record->created_at)->addMinutes(10)->isPast()){
        DB::table('password_reset_tokens')->where('email',$request->email)->delete();
          return response()->json(['status'=>false,'messages'=>'OTP has Expired'],400);
    }
    if(!Hash::check($request->otp,$record->token)){
          return response()->json(['status'=>false,'messages'=>'Invalid OTP']);
    }
      return response()->json(['status'=>true,'messages'=>'OTP Verified']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'                 => 'required|email|exists:users,email',
            'otp'                   => 'required|string|size:6',
            'password'              => 'required|min:8|confirmed',
            'password_confirmation' => 'required',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->otp, $record->token)) {
            return response()->json(['status' => false, 'message' => 'Invalid or expired OTP'], 400);
        }

        if (Carbon::parse($record->created_at)->addMinutes(10)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['status' => false, 'message' => 'OTP has expired'], 400);
        }

        // Update password
        User::where('email', $request->email)->update([
            'password' => Hash::make($request->password),
        ]);

        // Delete token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Password reset successfully',
        ]);
    }

}
