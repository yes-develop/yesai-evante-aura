<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class GoogleSheetController extends Controller
{
    /**
     * Display the Google Sheets integration page.
     *
     * @return \Illuminate\View\View
     */
    public function index()
    {
        // Add debug information to check view path
        $viewPath = resource_path('views/googlesheets/index.blade.php');
        $layoutPath = resource_path('views/layouts/app.blade.php');
        
        $debug = [
            'view_exists' => file_exists($viewPath),
            'layout_exists' => file_exists($layoutPath),
            'view_path' => $viewPath,
            'layout_path' => $layoutPath
        ];
        
        return view('googlesheets.index', compact('debug'));
    }
}