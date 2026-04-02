<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Helpers\PermissionHelper;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function __construct()
    {
        PermissionHelper::checkPermission('permissions');
        PermissionHelper::checkPermission('admin');
    }

    public function index()
    {
        $users = User::all();
        return view('permissions.index', compact('users'));
    }

    public function edit($id)
{
    $user = User::findOrFail($id);
    $user->permissions = is_string($user->permissions) 
        ? json_decode($user->permissions, true) 
        : ($user->permissions ?? []);

    // เพิ่ม permissions ให้ครบ
    $allPermissions = [
        'dashboard',
        'branches',
        'rooms',
        'bookings',
        'broadcasts',
        'analytics',
        'automations',
        'ai',
        'messages',   // << เพิ่มตรงนี้
        'contacts'    // << เพิ่มตรงนี้
    ];

    return view('permissions.edit', compact('user', 'allPermissions'));
}

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // อัพเดท role เท่านั้น
        $user->role = $request->role;
        $user->save();

        return redirect()->route('permissions.index')
            ->with('success', 'User role updated successfully');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->route('permissions.index')
            ->with('success', 'User deleted successfully');
    }
}
