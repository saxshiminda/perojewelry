<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class UserProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            if ($request->hasFile('image')) {
                Log::info('Processing profile image upload', ['original_name' => $request->file('image')->getClientOriginalName()]);
                $path = $request->file('image')->store('users', 'public');
                $user->image = $path;
                Log::info('Stored profile image', ['path' => $path]);
            } elseif ($request->boolean('remove_image')) {
                Log::info('Removing profile image', ['user_id' => $user->id]);
                $user->image = null;
            }

            $user->name = $validated['name'];
            $user->email = $validated['email'];
            $user->save();
            Log::info('User profile saved', ['user_id' => $user->id]);

            return response()->json(['message' => 'Profile updated successfully', 'user' => $user]);
        } catch (\Exception $e) {
            Log::error('Profile update failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Profile update failed: ' . $e->getMessage()], 500);
        }
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();
        $user->password = bcrypt($validated['new_password']);
        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }
}
