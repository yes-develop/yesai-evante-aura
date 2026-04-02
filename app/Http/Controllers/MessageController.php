<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Display the messaging app view.
     *
     * @return \Illuminate\View\View
     */
    public function index(Request $request)
    {
        // ถ้ามี section parameter ให้ redirect ไปที่หน้าที่เหมาะสม
        if ($request->has('section')) {
            $section = $request->get('section');
            if ($section === 'contacts') {
                return redirect()->route('contacts.index');
            }
        }
        
        return view('message.index');
    }
}