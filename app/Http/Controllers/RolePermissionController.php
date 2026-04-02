<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
    
class RolePermissionController extends Controller
{
    public function edit($role)
    {
        // ดึง role จาก table role_permissions
        $rolePermission = DB::table('role_permissions')->where('role', $role)->first();

        // กำหนด permission ทั้งหมด
        $allPermissions = [
            'dashboard', 'branches', 'rooms', 'bookings',
            'broadcasts', 'analytics', 'automations', 'ai',
            'messages', 'contacts'
        ];

        // แปลง permission เป็น array
        $permissions = [];
        if ($rolePermission && $rolePermission->permission) {
            $permissions = json_decode($rolePermission->permission, true) ?? [];
        }

        // ดึง role ทั้งหมด
        $roles = DB::table('role_permissions')->pluck('role');

        return view('role_permissions.edit', compact('role', 'roles', 'allPermissions', 'permissions'));
    }

    public function update(Request $request, $role)
    {
        $permissions = $request->permissions ?? [];
        DB::table('role_permissions')
            ->where('role', $role)
            ->update(['permission' => json_encode($permissions)]);

        return redirect()->back()->with('success', 'Role permissions updated successfully');
    }
}