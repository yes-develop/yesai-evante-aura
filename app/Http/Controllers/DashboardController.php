<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CustomerInfo;
use App\Models\User;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Upcoming broadcasts (dummy data — same as BroadcastController)
        $broadcasts = collect([
            [
                'id' => 1,
                'title' => 'Holiday Sale (Mar 25) System Maintenance',
                'status' => 'draft',
                'scheduled_at' => '2026-03-25 10:00:00',
            ],
            [
                'id' => 2,
                'title' => 'Holiday Sale (Mar 25) System Maintenance',
                'status' => 'draft',
                'scheduled_at' => '2026-03-25 10:00:00',
            ],
            [
                'id' => 3,
                'title' => 'Holiday Sale (Mar 25) System Maintenance',
                'status' => 'draft',
                'scheduled_at' => '2026-03-25 10:00:00',
            ],
        ]);

        // Recent contact sign-ups
        $recentContacts = CustomerInfo::latest()->take(5)->get();

        // All users (for agent leaderboard)
        $users = User::all();

        // Evante API URL for client-side fetching
        $evanteApiUrl = config('services.evante.url');

        // Reverb config for client-side WebSocket
        $reverbConfig = config('services.reverb');

        return view('dashboard.index', compact(
            'broadcasts',
            'recentContacts',
            'users',
            'evanteApiUrl',
            'reverbConfig'
        ));
    }
}
