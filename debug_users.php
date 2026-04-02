<?php

// สคริปต์สำหรับดูข้อมูลผู้ใช้ทั้งหมดในฐานข้อมูล
require_once __DIR__ . '/vendor/autoload.php';

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\Facades\Hash;
    
    echo "=== ข้อมูลผู้ใช้ทั้งหมดในระบบ ===\n\n";
    
    $users = DB::table('users')->get();
    
    if ($users->isEmpty()) {
        echo "ไม่พบข้อมูลผู้ใช้ในฐานข้อมูล\n";
    } else {
        foreach ($users as $user) {
            echo "ID: {$user->id}\n";
            echo "ชื่อ: {$user->name}\n";
            echo "อีเมล: {$user->email}\n";
            echo "รหัสผ่าน (เข้ารหัส): {$user->password}\n";
            echo "สร้างเมื่อ: {$user->created_at}\n";
            echo "แก้ไขล่าสุด: {$user->updated_at}\n";
            echo "-----------------------------\n";
        }
        
        echo "\nจำนวนผู้ใช้ทั้งหมด: " . $users->count() . " คน\n";
    }
    
    // ตรวจสอบการเชื่อมต่อ Authentication
    echo "\n=== ตรวจสอบ Authentication ===\n";
    echo "Auth driver: " . config('auth.defaults.guard') . "\n";
    echo "User provider: " . config('auth.guards.web.provider') . "\n";
    echo "User model: " . config('auth.providers.users.model') . "\n";
    
} catch (Exception $e) {
    echo "เกิดข้อผิดพลาด: " . $e->getMessage() . "\n";
}
