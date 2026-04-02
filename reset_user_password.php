<?php

// สคริปต์สำหรับรีเซ็ตรหัสผ่านของผู้ใช้เป็นแบบ plain text
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

// รับข้อมูลจากการพิมพ์ในคอนโซล
echo "ระบุอีเมลผู้ใช้ที่ต้องการรีเซ็ตรหัสผ่าน: ";
$email = trim(fgets(STDIN));

// ตรวจสอบว่ามีผู้ใช้นี้อยู่หรือไม่
$user = DB::table('users')->where('email', $email)->first();

if (!$user) {
    echo "ไม่พบผู้ใช้อีเมล $email ในระบบ\n";
    exit(1);
}

echo "พบผู้ใช้ $email ในระบบ\n";
echo "ระบุรหัสผ่านใหม่ (plain text): ";
$newPassword = trim(fgets(STDIN));

// อัปเดตรหัสผ่านเป็น plain text
DB::table('users')
    ->where('email', $email)
    ->update(['password' => $newPassword]);

echo "รีเซ็ตรหัสผ่านสำเร็จ! ตอนนี้ผู้ใช้ $email สามารถเข้าสู่ระบบด้วยรหัสผ่าน $newPassword ได้\n";
