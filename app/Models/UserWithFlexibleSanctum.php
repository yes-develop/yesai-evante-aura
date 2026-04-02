<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class UserWithFlexibleSanctum extends Authenticatable
{
    use HasFactory, Notifiable;
    
    // Conditionally use Sanctum trait if available
    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        
        if (class_exists('Laravel\Sanctum\HasApiTokens')) {
            $this->initializeTrait('Laravel\Sanctum\HasApiTokens');
        }
    }
    
    // Helper method to initialize a trait dynamically
    protected function initializeTrait($traitClass)
    {
        if (trait_exists($traitClass)) {
            class_alias('App\Models\UserTraitWrapper', 'UserTraitWrapperTemp');
            eval('class UserTraitWrapperTemp { use ' . $traitClass . '; }');
            $trait = new \UserTraitWrapperTemp();
            
            // This is just a placeholder - actual dynamic trait usage would be more complex
            // and may not be feasible in this way due to PHP's compilation model
        }
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
    
    /**
     * Get the bookings associated with the user.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
