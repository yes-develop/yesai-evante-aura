<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerInfo extends Model
{
    protected $fillable = [
        'line_uuid',
        'name', 
        'phone',
        'email',
        'notes',
        'labels'
    ];

    protected $casts = [
        'notes' => 'array',
        'labels' => 'array'
    ];
}
