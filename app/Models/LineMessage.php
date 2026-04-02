<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LineMessage extends Model
{
    protected $fillable = [
        'line_uuid',
        'message',
        'ai_response',
        'display_name',
        'message_channel',
        'chat_mode',
        'message_id',
        'message_timestamp'
    ];

    protected $casts = [
        'message_timestamp' => 'datetime'
    ];

    public function customerInfo()
    {
        return $this->belongsTo(CustomerInfo::class, 'line_uuid', 'line_uuid');
    }

    public function assignment()
    {
        return $this->belongsTo(ChatAssignment::class, 'line_uuid', 'line_uuid');
    }
}