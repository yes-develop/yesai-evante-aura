<?php

// สคริปต์สำหรับสร้างตาราง users และเพิ่มผู้ใช้เริ่มต้น
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Carbon\Carbon;

try {
    echo "เริ่มดำเนินการสร้างตาราง users...\n";

    // ตรวจสอบว่ามีตารางอยู่แล้วหรือไม่
    if (!Schema::hasTable('users')) {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('phone')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
        echo "สร้างตาราง users สำเร็จ\n";
    } else {
        echo "ตาราง users มีอยู่แล้ว\n";
    }

    // สร้างตาราง sessions ถ้ายังไม่มี
    if (!Schema::hasTable('sessions')) {
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->text('payload');
            $table->integer('last_activity')->index();
        });
        echo "สร้างตาราง sessions สำเร็จ\n";
    } else {
        echo "ตาราง sessions มีอยู่แล้ว\n";
    }

    // สร้างผู้ใช้เริ่มต้น
    $userExists = DB::table('users')->where('email', 'admin@example.com')->exists();

    if (!$userExists) {
        DB::table('users')->insert([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
        echo "สร้างผู้ใช้เริ่มต้น 'admin@example.com' สำเร็จ (รหัสผ่าน: password)\n";
    } else {
        echo "ผู้ใช้ 'admin@example.com' มีอยู่แล้ว\n";
    }

    echo "เสร็จสิ้นการดำเนินการทั้งหมด!\n";
} catch (Exception $e) {
    echo "เกิดข้อผิดพลาด: " . $e->getMessage() . "\n";
}
