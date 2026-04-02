<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = ['id', 'title', 'content'];

    public function labels()
    {
        return $this->belongsToMany(Label::class, 'conversation_label', 'conversation_id', 'label_id');
    }
} 