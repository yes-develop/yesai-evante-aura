<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Branch extends Model
{
    protected $guarded = [];

    public $timestamps = false; // Disable timestamps completely
    
    use HasFactory;

    protected $table = 'branches';
    
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
        'nearby_governmentinstitutions'
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'nearby_shoppingmall' => 'array',
        'nearby_attractions' => 'array',
        'nearby_industrialestates' => 'array',
        'nearby_governmentinstitutions' => 'array',
    ];

    /**
     * นี่จะช่วยให้ค่าที่รับมาจากฐานข้อมูลเป็น array เสมอ แม้จะเป็น null หรือ string
     */
    public function getNearbyShoppingmallAttribute($value)
    {
        if (is_null($value)) return [];
        if (is_array($value)) return $value;
        
        // พยายาม decode JSON string
        $decoded = json_decode($value, true);
        return is_array($decoded) ? $decoded : [];
    }
    
    public function getNearbyAttractionsAttribute($value)
    {
        if (is_null($value)) return [];
        if (is_array($value)) return $value;
        
        $decoded = json_decode($value, true);
        return is_array($decoded) ? $decoded : [];
    }
    
    public function getNearbyIndustrialestatesAttribute($value)
    {
        if (is_null($value)) return [];
        if (is_array($value)) return $value;
        
        $decoded = json_decode($value, true);
        return is_array($decoded) ? $decoded : [];
    }
    
    public function getNearbyGovernmentinstitutionsAttribute($value)
    {
        if (is_null($value)) return [];
        if (is_array($value)) return $value;
        
        $decoded = json_decode($value, true);
        return is_array($decoded) ? $decoded : [];
    }

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }
}