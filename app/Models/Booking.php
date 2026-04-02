<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use App\Helpers\ImageHelper;

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

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
