<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;

class ImageHelper
{
    /**
     * Get the appropriate image URL whether it's a full URL or a storage path
     */
    public static function getImageUrl($path, $default = 'images/no-image.png')
    {
        if (empty($path)) {
            return asset($default);
        }
        
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }
        
        return asset('storage/' . $path);
    }
}