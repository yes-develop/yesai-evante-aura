<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CallTranscript extends Model
{
    protected $fillable = [
        'call_log_id',
        'speaker',
        'content',
        'timestamp_ms',
        'is_final',
        'confidence',
    ];

    protected $casts = [
        'is_final'     => 'boolean',
        'confidence'   => 'float',
        'timestamp_ms' => 'integer',
    ];

    public function callLog(): BelongsTo
    {
        return $this->belongsTo(CallLog::class);
    }
}
