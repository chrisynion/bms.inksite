<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    public function redirect($provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    public function callback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            return redirect('/login')->withErrors(['error' => 'Authentication failed.']);
        }

        // Find or create user
        $user = User::where('provider_name', $provider)
                    ->where('provider_id', $socialUser->getId())
                    ->first();

        if (!$user) {
            // Check if email already exists
            $userByEmail = User::where('email', $socialUser->getEmail())->first();
            
            if ($userByEmail) {
                // Link account
                $userByEmail->update([
                    'provider_name' => $provider,
                    'provider_id' => $socialUser->getId(),
                ]);
                $user = $userByEmail;
            } else {
                // Register new user
                $name = $socialUser->getName();
                if (empty($name)) {
                    $name = $socialUser->getNickname() ?? 'OAuth User';
                }
                
                $user = User::create([
                    'name' => $name,
                    'email' => $socialUser->getEmail(),
                    'provider_name' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'role' => 'staff', // Default role
                ]);
            }
        }

        Auth::login($user);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
