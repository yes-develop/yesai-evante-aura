<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Helpers\PermissionHelper;

class ProfileController extends Controller
{
    public function __construct()
    {
        $user = Auth::user();
        // ให้ sales และ admin เข้าหน้า profile ได้เสมอ
        if ($user && in_array($user->role, ['admin', 'sales'])) {
            return;
        }
        PermissionHelper::checkPermission('profile');
    }

    public function show()
    {
        $user = Auth::user();
        return view('profile.show', compact('user'));
    }

    public function edit()
    {
        $user = Auth::user();
        return view('profile.edit', compact('user'));
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        if ($request->hasFile('profile_image')) {
            $file = $request->file('profile_image');
            $path = $file->store('profile_images', 'public');
            $user->profile_image = $path;
        }
        // ถ้ามีการกรอก password และ password_confirmation ตรงกัน ให้เปลี่ยน password
        if ($request->filled('password')) {
            $request->validate([
                'old_password' => 'required',
                'password' => 'required|string|min:6|confirmed',
            ]);
            // เช็ค old password
            if (!\Hash::check($request->old_password, $user->password)) {
                return back()->withErrors(['old_password' => 'Old password is incorrect'])->withInput();
            }
            $user->password = bcrypt($request->password);
        }
        $user->save();

        return redirect()->route('profile.show')->with('success', 'Profile updated successfully');
    }
}
