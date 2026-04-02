<?php

// สคริปต์ตรวจสอบและสร้าง Model ที่จำเป็น
require_once __DIR__ . '/vendor/autoload.php';

echo "เริ่มตรวจสอบและสร้าง Model ที่จำเป็น...\n\n";

$modelsPath = __DIR__ . '/app/Models';

// ตรวจสอบว่าโฟลเดอร์ Models มีอยู่หรือไม่
if (!is_dir($modelsPath)) {
    echo "สร้างโฟลเดอร์ Models...\n";
    mkdir($modelsPath, 0755, true);
}

// ตรวจสอบและสร้าง Model ที่ต้องการ
$models = [
    'Room' => [
        'content' => <<<'EOD'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'branch_id',
        'price_per_night',
        'max_guests',
        'bed_type',
        'size_room',
        'status',
        'amenities',
        'total_rooms',
    ];

    protected $casts = [
        'amenities' => 'array',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function images()
    {
        return $this->hasMany(RoomImage::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
EOD
    ],
    'Branch' => [
        'content' => <<<'EOD'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'image',
        'location',
        'map_url',
        'tel',
        'nearby_shoppingmall',
        'nearby_attractions',
        'nearby_industrialestates',
        'nearby_governmentinstitutions',
    ];

    protected $casts = [
        'nearby_shoppingmall' => 'array',
        'nearby_attractions' => 'array',
        'nearby_industrialestates' => 'array',
        'nearby_governmentinstitutions' => 'array',
    ];

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }
}
EOD
    ],
    'RoomImage' => [
        'content' => <<<'EOD'
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomImage extends Model
{
    use HasFactory;

    protected $table = 'room_images';
    
    protected $fillable = [
        'room_id',
        'image_url',
    ];

    public $timestamps = false;

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
EOD
    ],
    'Booking' => [
        'content' => <<<'EOD'
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
EOD
    ],
];

foreach ($models as $name => $data) {
    $modelPath = $modelsPath . '/' . $name . '.php';
    
    if (file_exists($modelPath)) {
        echo "Model $name มีอยู่แล้ว, ข้ามการสร้าง\n";
    } else {
        file_put_contents($modelPath, $data['content']);
        echo "สร้าง Model $name สำเร็จ\n";
    }
}

echo "\nดำเนินการเสร็จสิ้น!\n";
echo "หากต้องการเรียกใช้ Class เหล่านี้ในไฟล์อื่นๆ ควรเพิ่ม 'use App\Models\Room;' เป็นต้น\n";
