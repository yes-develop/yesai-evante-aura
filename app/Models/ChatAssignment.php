<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatAssignment extends Model
{
    protected $fillable = [
        'line_uuid',
        'user_id',
        'assigned_member_id',
        'assigned_member',
        'unread_message_at',
        'assigned_at',
        'notification_scheduled_at',
        'is_replied',
        'replied_at',
        'notification_sent',
        'webhook_data'
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'unread_message_at' => 'datetime',
        'notification_scheduled_at' => 'datetime',
        'replied_at' => 'datetime',
        'is_replied' => 'boolean',
        'notification_sent' => 'boolean',
        'webhook_data' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for getting assignments with pending notifications (10 minutes rule)
     */
    public function scopePendingNotifications($query)
    {
        return $query->where('is_replied', false)
                    ->where('notification_sent', false)
                    ->whereNotNull('unread_message_at')
                    ->whereNotNull('notification_scheduled_at')
                    ->where('notification_scheduled_at', '<=', now());
    }

    /**
     * Scope for getting overdue unread messages
     */
    public function scopeOverdueUnread($query)
    {
        return $query->where('is_replied', false)
                    ->whereNotNull('unread_message_at')
                    ->where('unread_message_at', '<=', now()->subMinutes(10));
    }

    /**
     * Check if assignment has overdue unread messages
     */
    public function hasOverdueUnread()
    {
        return !$this->is_replied 
               && $this->unread_message_at 
               && $this->unread_message_at <= now()->subMinutes(10);
    }

    /**
     * Mark as replied
     */
    public function markAsReplied()
    {
        return $this->update([
            'is_replied' => true,
            'replied_at' => now()
        ]);
    }
}