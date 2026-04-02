<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\PermissionHelper;
class SettingController extends Controller
{
    public function __construct()
    {
        PermissionHelper::checkPermission('settings');
    }
    
    public function index()
    {
        $settings = DB::table('settings')->get()->pluck('value', 'key');
        return view('settings.index', compact('settings'));
    }

    public function update(Request $request)
    {
        $settings = $request->except('_token');
        
        foreach ($settings as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $value]
            );
        }
        
        return redirect()->route('settings.index')
            ->with('success', 'Settings updated successfully');
    }
}
