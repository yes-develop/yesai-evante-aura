<?php

namespace App\Helpers;

use Illuminate\Support\Facades\DB;

class PermissionHelper
{
    private static $permissionCache = [];

    public static function hasPermission($permission)
    {
        $user = auth()->user();
        if (!$user) return false;

        // admin เห็นทุกหน้า
        if ($user->role === 'admin') {
            return true;
        }

        // Create cache key based on user role
        $cacheKey = $user->role;
        
        // Check if permissions are already cached for this role
        if (!isset(self::$permissionCache[$cacheKey])) {
            // sales เห็นเฉพาะหน้าที่มี permission ใน table
            // (default: ถ้าไม่มีใน table หรือไม่มี permission จะ return false)
            $rolePermission = DB::table('role_permissions')->where('role', $user->role)->first();
            if (!$rolePermission || !$rolePermission->permission) {
                self::$permissionCache[$cacheKey] = [];
            } else {
                $permissions = json_decode($rolePermission->permission, true);
                self::$permissionCache[$cacheKey] = is_array($permissions) ? $permissions : [];
            }
        }

        return in_array($permission, self::$permissionCache[$cacheKey]);
    }

    public static function checkPermission($permission)
    {
        if (!self::hasPermission($permission)) {
            abort(403, 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        }
    }
}