<?php

// สคริปต์สำหรับทดสอบการตรวจสอบรหัสผ่าน
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

echo "=== ทดสอบการตรวจสอบรหัสผ่าน ===\n\n";

// รับข้อมูลจากการพิมพ์ในคอนโซล
echo "ระบุอีเมลผู้ใช้: ";
$email = trim(fgets(STDIN));

// ตรวจสอบว่ามีผู้ใช้นี้อยู่หรือไม่
$user = DB::table('users')->where('email', $email)->first();

if (!$user) {
    echo "ไม่พบผู้ใช้อีเมล $email ในระบบ\n";
    exit(1);
}

echo "พบผู้ใช้ $email ในระบบ\n";
echo "รหัสผ่านที่เก็บในฐานข้อมูล: {$user->password}\n\n";

echo "ระบุรหัสผ่านที่ต้องการทดสอบ: ";
$password = trim(fgets(STDIN));

// ทดสอบรหัสผ่านแบบ plain text
$plainTextMatch = ($user->password === $password);
echo "ตรงกับ Plain Text: " . ($plainTextMatch ? "ใช่ ✓" : "ไม่ใช่ ✗") . "\n";

// ทดสอบรหัสผ่านแบบ hash
$hashMatch = Hash::check($password, $user->password);
echo "ตรงกับ Hash: " . ($hashMatch ? "ใช่ ✓" : "ไม่ใช่ ✗") . "\n";

// สรุปผล
if ($plainTextMatch || $hashMatch) {
    echo "\nผลการทดสอบ: รหัสผ่านถูกต้อง ✓\n";
} else {
    echo "\nผลการทดสอบ: รหัสผ่านไม่ถูกต้อง ✗\n";
}
