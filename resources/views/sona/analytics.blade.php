@extends('layouts.app')

@section('title', 'SONA Analytics')

@section('content')
@php
    $successRate = $total > 0 ? round($completed / $total * 100) : 0;

    $sentimentColors = [
        'positive' => '#83FF2F',
        'neutral'  => '#9ca3af',
        'negative' => '#f87171',
    ];

    // Build last-14-days labels & data
    $dayLabels = [];
    $dayData   = [];
    for ($i = 13; $i >= 0; $i--) {
        $d = now()->subDays($i)->format('Y-m-d');
        $dayLabels[] = now()->subDays($i)->format('M d');
        $dayData[]   = $callsPerDay[$d] ?? 0;
    }

    $avgMin = intdiv($avgDuration, 60);
    $avgSec = $avgDuration % 60;
    $avgLabel = $avgDuration ? "{$avgMin}:{$avgSec}" : '—';
@endphp

<div style="padding: 0 0.25rem;">

    {{-- Header --}}
    <div style="margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.35rem; font-weight: 700; color: #111827; margin: 0;">SONA Analytics</h2>
        <p style="color: #6b7280; font-size: 0.9rem; margin: 0.25rem 0 0;">Last 14 days · Voice call performance</p>
    </div>

    {{-- Stat Cards --}}
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
        @php
        $stats = [
            ['label' => 'Total Calls',    'value' => $total,       'icon' => 'fa-phone',            'color' => '#2563eb'],
            ['label' => 'Completed',       'value' => $completed,   'icon' => 'fa-circle-check',     'color' => '#16a34a'],
            ['label' => 'Avg Duration',    'value' => $avgLabel,    'icon' => 'fa-clock',            'color' => '#d97706'],
            ['label' => 'Success Rate',    'value' => $successRate.'%', 'icon' => 'fa-chart-line',   'color' => '#7c3aed'],
        ];
        @endphp
        @foreach ($stats as $s)
        <div style="background: #fff; border-radius: 14px; padding: 1.25rem 1.5rem; border: 1px solid #e5e7eb; display: flex; align-items: center; gap: 1rem;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: {{ $s['color'] }}18; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="fas {{ $s['icon'] }}" style="color: {{ $s['color'] }}; font-size: 1.1rem;"></i>
            </div>
            <div>
                <div style="font-size: 1.6rem; font-weight: 800; color: #111827; line-height: 1.1;">{{ $s['value'] }}</div>
                <div style="font-size: 0.8rem; color: #6b7280; margin-top: 0.15rem;">{{ $s['label'] }}</div>
            </div>
        </div>
        @endforeach
    </div>

    {{-- Charts Row --}}
    <div style="display: grid; grid-template-columns: 1fr 340px; gap: 1rem; margin-bottom: 1.5rem;">

        {{-- Calls Per Day Chart --}}
        <div style="background: #fff; border-radius: 14px; padding: 1.5rem; border: 1px solid #e5e7eb;">
            <h5 style="font-size: 0.95rem; font-weight: 700; color: #111827; margin: 0 0 1.25rem;">Calls per Day</h5>
            <canvas id="callsPerDayChart" height="130"></canvas>
        </div>

        {{-- Sentiment Donut --}}
        <div style="background: #fff; border-radius: 14px; padding: 1.5rem; border: 1px solid #e5e7eb;">
            <h5 style="font-size: 0.95rem; font-weight: 700; color: #111827; margin: 0 0 1.25rem;">Sentiment Breakdown</h5>
            @if(array_sum($sentimentBreakdown) > 0)
            <div style="position: relative; display: flex; justify-content: center;">
                <canvas id="sentimentChart" width="180" height="180"></canvas>
            </div>
            <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                @foreach(['positive','neutral','negative'] as $key)
                @php $count = $sentimentBreakdown[$key] ?? 0; @endphp
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background: {{ $sentimentColors[$key] }}; display: inline-block;"></span>
                        <span style="font-size: 0.82rem; color: #374151; text-transform: capitalize;">{{ $key }}</span>
                    </div>
                    <span style="font-size: 0.82rem; font-weight: 700; color: #111827;">{{ $count }}</span>
                </div>
                @endforeach
            </div>
            @else
            <div style="text-align: center; padding: 2rem 0; color: #9ca3af; font-size: 0.9rem;">No sentiment data yet</div>
            @endif
        </div>
    </div>

    {{-- Bottom Row --}}
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">

        {{-- Direction Breakdown --}}
        <div style="background: #fff; border-radius: 14px; padding: 1.5rem; border: 1px solid #e5e7eb;">
            <h5 style="font-size: 0.95rem; font-weight: 700; color: #111827; margin: 0 0 1.25rem;">Call Direction</h5>
            @php
            $dirColors = ['inbound' => '#2563eb', 'outbound' => '#83FF2F'];
            $dirTotal  = array_sum($directionBreakdown) ?: 1;
            @endphp
            @forelse($directionBreakdown as $dir => $cnt)
            @php $pct = round($cnt / $dirTotal * 100); @endphp
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                    <span style="font-size: 0.85rem; color: #374151; text-transform: capitalize;">{{ $dir }}</span>
                    <span style="font-size: 0.85rem; font-weight: 700; color: #111827;">{{ $cnt }} <span style="color: #9ca3af; font-weight: 400;">({{ $pct }}%)</span></span>
                </div>
                <div style="background: #f3f4f6; border-radius: 99px; height: 8px; overflow: hidden;">
                    <div style="height: 100%; border-radius: 99px; width: {{ $pct }}%; background: {{ $dirColors[$dir] ?? '#6b7280' }};"></div>
                </div>
            </div>
            @empty
            <div style="text-align: center; padding: 2rem 0; color: #9ca3af; font-size: 0.9rem;">No data yet</div>
            @endforelse
        </div>

        {{-- Recent Calls --}}
        <div style="background: #fff; border-radius: 14px; padding: 1.5rem; border: 1px solid #e5e7eb;">
            <h5 style="font-size: 0.95rem; font-weight: 700; color: #111827; margin: 0 0 1.25rem;">Recent Calls</h5>
            @forelse($recentCalls as $rc)
            @php
            $badgeColor = match($rc->status) {
                'completed'  => ['bg' => '#dcfce7', 'txt' => '#16a34a'],
                'no-answer'  => ['bg' => '#fef9c3', 'txt' => '#854d0e'],
                'failed'     => ['bg' => '#fee2e2', 'txt' => '#dc2626'],
                default      => ['bg' => '#f3f4f6', 'txt' => '#6b7280'],
            };
            @endphp
            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0; {{ !$loop->last ? 'border-bottom: 1px solid #f3f4f6;' : '' }}">
                <img src="https://ui-avatars.com/api/?name={{ urlencode($rc->customer_name ?? 'Unknown') }}&background=e0e0e0&color=999&size=36"
                     alt="" style="width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 0.87rem; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        {{ $rc->customer_name ?? $rc->phone_number ?? 'Unknown' }}
                    </div>
                    <div style="font-size: 0.77rem; color: #9ca3af;">{{ $rc->started_at?->format('M d, H:i') ?? '—' }}</div>
                </div>
                <span style="font-size: 0.72rem; font-weight: 600; padding: 2px 8px; border-radius: 99px; background: {{ $badgeColor['bg'] }}; color: {{ $badgeColor['txt'] }}; white-space: nowrap;">
                    {{ ucfirst($rc->status ?? '—') }}
                </span>
            </div>
            @empty
            <div style="text-align: center; padding: 2rem 0; color: #9ca3af; font-size: 0.9rem;">No calls yet</div>
            @endforelse
        </div>

    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {

    // Calls per Day
    const dayCtx = document.getElementById('callsPerDayChart');
    if (dayCtx) {
        new Chart(dayCtx, {
            type: 'bar',
            data: {
                labels: @json($dayLabels),
                datasets: [{
                    label: 'Calls',
                    data: @json($dayData),
                    backgroundColor: '#83FF2F',
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                    y: { beginAtZero: true, ticks: { precision: 0, font: { size: 11 } }, grid: { color: '#f3f4f6' } }
                }
            }
        });
    }

    // Sentiment Donut
    const sentCtx = document.getElementById('sentimentChart');
    if (sentCtx) {
        const sentData = @json(array_values(array_intersect_key($sentimentBreakdown, array_flip(['positive','neutral','negative']))));
        const sentLabels = ['Positive', 'Neutral', 'Negative'];
        const sentColors = ['#83FF2F', '#9ca3af', '#f87171'];
        new Chart(sentCtx, {
            type: 'doughnut',
            data: {
                labels: sentLabels,
                datasets: [{ data: sentData, backgroundColor: sentColors, borderWidth: 0, hoverOffset: 4 }]
            },
            options: {
                cutout: '70%',
                plugins: { legend: { display: false } }
            }
        });
    }
});
</script>
@endpush
