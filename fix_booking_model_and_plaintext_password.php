<?php

// สคริปต์แก้ไขปัญหา Class Booking Not Found และปรับรหัสผ่านเป็นแบบไม่ hash
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "เริ่มการตรวจสอบและแก้ไขปัญหา...\n";

// 1. ตรวจสอบว่ามีคลาส Booking หรือไม่
$bookingModelPath = __DIR__ . '/app/Models/Booking.php';
if (!file_exists($bookingModelPath)) {
    echo "ไม่พบไฟล์ Booking Model, กำลังสร้าง...\n";
    
    $bookingModelContent = <<<'EOD'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $table = 'bookings';
    
    protected $fillable = [
        'room_id',
        'check_in',
        'check_out',
        'room_count',
        'user_line_id',
        'full_name',
        'phone',
        'status',
    ];

    public $timestamps = false;

    protected $guarded = ['id', 'created_at'];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
    
    public function user()
    {
        return $this->belongsTo(User::class, 'user_line_id', 'id');
    }
}
EOD;

    // สร้างไดเรกทอรีถ้ายังไม่มี
    if (!is_dir(dirname($bookingModelPath))) {
        mkdir(dirname($bookingModelPath), 0755, true);
    }
    
    file_put_contents($bookingModelPath, $bookingModelContent);
    echo "สร้าง Booking Model เรียบร้อยแล้ว\n";
}

// 2. ทดสอบการเปลี่ยนรหัสผ่านจาก hash เป็น plain text
echo "\nกำลังทดสอบการอัพเดทรหัสผ่านเป็นรูปแบบ plain text...\n";

if (Schema::hasTable('users')) {
    // แสดงข้อมูลผู้ใช้ที่มีอยู่
    $users = DB::table('users')->get();
    
    echo "พบผู้ใช้จำนวน " . count($users) . " คน:\n";
    
    foreach ($users as $user) {
        echo "ID: {$user->id}, ชื่อ: {$user->name}, อีเมล: {$user->email}, รหัสผ่าน: {$user->password}\n";
        
        // ถามผู้ใช้ว่าต้องการเปลี่ยนรหัสผ่านเป็น plain text หรือไม่
        echo "ต้องการเปลี่ยนรหัสผ่านของ {$user->email} เป็น plain text หรือไม่? (y/n): ";
        $handle = fopen("php://stdin", "r");
        $line = trim(fgets($handle));
        
        if (strtolower($line) === 'y') {
            echo "กรุณาระบุรหัสผ่านใหม่ (plain text): ";
            $plainPassword = trim(fgets($handle));
            
            DB::table('users')
                ->where('id', $user->id)
                ->update(['password' => $plainPassword]);
            
            echo "อัพเดทรหัสผ่านเรียบร้อยแล้ว\n";
        }
    }
} else {
    echo "ไม่พบตาราง users\n";
}

echo "\nดำเนินการเสร็จสิ้น\n";
