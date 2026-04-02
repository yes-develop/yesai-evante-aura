<?php
// filepath: /c:/yesweb/app/Models/RoomImage.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomImage extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'room_id',
        'image_url',
        'is_primary'
    ];
    
    // ไม่จำเป็นต้องใช้ timestamps ถ้าในตาราง room_images ไม่มีคอลัมน์เหล่านี้
    public $timestamps = false;
    
    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}