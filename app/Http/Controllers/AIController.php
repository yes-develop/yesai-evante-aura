<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AIController extends Controller
{
    public function index()
    {
        return view('ai.index');
    }

    public function knowledge()
    {
        return view('ai.knowledge');
    }

    public function scenario()
    {
        return view('ai.scenario');
    }
} 