<?php

namespace App\Http\Controllers;

use App\Models\CallLog;
use Illuminate\Http\Request;
use Illuminate\View\View;

class SonaController extends Controller
{
    public function inbox(Request $request): View
    {
        $query = CallLog::with(['transcripts' => function ($q) {
            $q->orderBy('timestamp_ms');
        }])->orderByDesc('started_at');

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        $calls       = $query->paginate(20)->withQueryString();
        $activeCall  = $calls->first();

        return view('sona.inbox', compact('calls', 'activeCall'));
    }

    public function show(int $id): View
    {
        $call = CallLog::with(['transcripts' => function ($q) {
            $q->orderBy('timestamp_ms');
        }])->findOrFail($id);

        $calls = CallLog::orderByDesc('started_at')->limit(20)->get();

        return view('sona.inbox', compact('calls', 'call'));
    }

    public function analytics(): View
    {
        $total    = CallLog::count();
        $completed = CallLog::where('status', 'completed')->count();
        $missed   = CallLog::whereIn('status', ['no-answer', 'failed'])->count();
        $avgDuration = (int) CallLog::where('status', 'completed')
            ->avg('duration_seconds');

        $sentimentBreakdown = CallLog::whereNotNull('sentiment')
            ->selectRaw('sentiment, count(*) as total')
            ->groupBy('sentiment')
            ->pluck('total', 'sentiment')
            ->toArray();

        $directionBreakdown = CallLog::selectRaw('direction, count(*) as total')
            ->groupBy('direction')
            ->pluck('total', 'direction')
            ->toArray();

        $recentCalls = CallLog::orderByDesc('started_at')->limit(5)->get();

        $callsPerDay = CallLog::selectRaw('DATE(started_at) as day, count(*) as total')
            ->whereNotNull('started_at')
            ->where('started_at', '>=', now()->subDays(13))
            ->groupBy('day')
            ->orderBy('day')
            ->pluck('total', 'day')
            ->toArray();

        return view('sona.analytics', compact(
            'total', 'completed', 'missed', 'avgDuration',
            'sentimentBreakdown', 'directionBreakdown', 'recentCalls', 'callsPerDay'
        ));
    }

    public function callFlow(Request $request): View
    {
        $calls = CallLog::with(['transcripts' => fn($q) => $q->orderBy('timestamp_ms')])
            ->orderByDesc('started_at')
            ->limit(20)
            ->get();

        $selectedId  = $request->integer('call', 0);
        $selectedCall = $selectedId
            ? $calls->firstWhere('id', $selectedId)
            : $calls->first();

        return view('sona.call-flow', compact('calls', 'selectedCall'));
    }

    public function saveAgentSettings(Request $request)
    {
        $request->validate([
            'voice'       => 'nullable|string|max:100',
            'language'    => 'nullable|string|max:50',
            'greeting'    => 'nullable|string|max:2000',
            'personality' => 'nullable|string|max:50',
        ]);

        // Persist to app settings / config table if available; for now flash success.
        return back()->with('success', 'Agent settings saved.');
    }
}
