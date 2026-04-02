<?php
// filepath: /c:/yesweb/app/Models/Room.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use App\Helpers\ImageHelper;

class Room extends Model
{
    use HasFactory;

    // Only has created_at in DB, no updated_at
    const UPDATED_AT = null;

    protected $fillable = [
        'name',
        'description',
        'branch_id',
        'price_per_night',
        'discount',
        'max_guests',
        'bed_type',
        'size_room',
        'status',
        'amenities',
        'total_rooms'
    ];

    protected $casts = [
        'amenities' => 'array',
        'price_per_night' => 'decimal:2',
        'discount' => 'decimal:2'
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function images()
    {
        return $this->hasMany(RoomImage::class);
    }

    public function primaryImage()
    {
        return $this->hasOne(RoomImage::class)->where('is_primary', 1);
    }

    // เพิ่มเมธอดช่วยในการดึงรูปภาพ
    public function getMainImageUrl()
    {
        // ถ้ามีรูปหลัก
        if ($primary = $this->images()->where('is_primary', 1)->first()) {
            return $primary->image_url;
        }

        // ถ้าไม่มีรูปหลัก แต่มีรูปอื่น
        if ($first = $this->images()->first()) {
            return $first->image_url;
        }

        // ถ้าไม่มีรูปเลย
        return asset('images/no-room-image.jpg');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function getPrimaryImageAttribute()
    {
        return $this->images->where('is_primary', true)->first()
            ?? $this->images->first();
    }
}
