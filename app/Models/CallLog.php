<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CallLog extends Model
{
    protected $fillable = [
        'vapi_call_id',
        'phone_number',
        'direction',
        'status',
        'duration_seconds',
        'started_at',
        'ended_at',
        'assistant_id',
        'customer_name',
        'summary',
        'sentiment',
        'recording_url',
        'cost',
        'metadata',
    ];

    protected $casts = [
        'started_at'  => 'datetime',
        'ended_at'    => 'datetime',
        'metadata'    => 'array',
        'cost'        => 'float',
        'duration_seconds' => 'integer',
    ];

    public function transcripts(): HasMany
    {
        return $this->hasMany(CallTranscript::class)->orderBy('timestamp_ms');
    }

    public function getFormattedDurationAttribute(): string
    {
        if (!$this->duration_seconds) return '—';
        $m = intdiv($this->duration_seconds, 60);
        $s = $this->duration_seconds % 60;
        return sprintf('%d:%02d min', $m, $s);
    }

    public function getFirstTranscriptPreviewAttribute(): string
    {
        $first = $this->transcripts()->where('speaker', 'human')->first();
        if (!$first) {
            $first = $this->transcripts()->first();
        }
        return $first ? \Illuminate\Support\Str::limit($first->content, 60) : 'No transcript';
    }
}
