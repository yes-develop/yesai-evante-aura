<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Label extends Model
{
    protected $fillable = ['name'];

    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'conversation_label', 'label_id', 'conversation_id');
    }
} 