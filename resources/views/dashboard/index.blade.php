@extends('layouts.app')

@push('styles')
<link rel="stylesheet" href="{{ asset('css/dashboard.css') . '?v=' . time() }}">
@endpush

@section('content')
<meta name="evante-api-url" content="{{ $evanteApiUrl }}">

<div class="dashboard-container">

    <!-- Filter Bar -->
    <div class="dashboard-filters">
        <span class="filter-label">Time:</span>
        <select id="dashboard-time-filter">
            <option value="last_7_days" selected>Last Week</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_14_days">Last 2 Weeks</option>
            <option value="last_30_days">Last Month</option>
        </select>
        <span class="filter-label">Channels:</span>
        <select id="dashboard-channel-filter">
            <option value="all">All Channel</option>
            <option value="line">LINE</option>
        </select>
        <button class="export-btn" id="dashboard-export">
            <i class="fi fi-br-download"></i> Export
        </button>
    </div>

    <!-- KPI Cards -->
    <div class="dashboard-kpis">
        <div class="dash-card kpi-card">
            <div class="kpi-title">Total Chats</div>
            <div class="kpi-value" id="kpi-total-chats"><div class="kpi-value loading"></div></div>
            <div class="kpi-trend up" id="kpi-total-trend"></div>
        </div>
        <div class="dash-card kpi-card">
            <div class="kpi-title">AI Resolution Rate</div>
            <div class="kpi-value" id="kpi-ai-rate"><div class="kpi-value loading"></div></div>
            <div class="kpi-trend stable" id="kpi-ai-trend"></div>
        </div>
        <div class="dash-card kpi-card">
            <div class="kpi-title">Avg. Response Time</div>
            <div class="kpi-value" id="kpi-response-time"><div class="kpi-value loading"></div></div>
            <div class="kpi-trend stable" id="kpi-response-trend"></div>
        </div>
        <div class="dash-card kpi-card">
            <div class="kpi-title">Missed Chats</div>
            <div class="kpi-value" id="kpi-missed"><div class="kpi-value loading"></div></div>
            <div class="kpi-trend" id="kpi-missed-trend"></div>
        </div>
    </div>

    <!-- Mid Section: Broadcasts + Urgent Conversations -->
    <div class="dashboard-mid">
        <!-- Upcoming Broadcasts -->
        <div class="dash-card">
            <div class="card-header-row">
                <h3 class="card-title">Upcoming Broadcasts</h3>
            </div>
            @foreach($broadcasts as $broadcast)
            <div class="broadcast-item">
                <div class="broadcast-info">
                    <div class="broadcast-title">{{ $broadcast['title'] }}</div>
                    <div class="broadcast-date">{{ \Carbon\Carbon::parse($broadcast['scheduled_at'])->format('D, d M. Y') }}</div>
                </div>
                <span class="broadcast-status">{{ ucfirst($broadcast['status']) }}</span>
            </div>
            @endforeach
        </div>

        <!-- Urgent Conversations -->
        <div class="dash-card">
            <div class="card-header-row">
                <h3 class="card-title">Urgent Conversations (Inbox)</h3>
                <a href="{{ route('ai.index') }}" class="card-action">Train Now</a>
            </div>
            <div id="urgent-conversations">
                <div class="loading-placeholder">Loading conversations...</div>
            </div>
        </div>
    </div>

    <!-- Chat Volume Chart -->
    <div class="dashboard-chart">
        <div class="dash-card chart-card">
            <h3 class="card-title">Chat Volume</h3>
            <div class="chart-canvas-wrap">
                <canvas id="chatVolumeChart"></canvas>
            </div>
            <div class="chart-legend">
                <span><span class="legend-dot ai"></span> AI Chat</span>
                <span><span class="legend-dot manual"></span> Manual</span>
            </div>
        </div>
    </div>

    <!-- Bottom 3 Cards -->
    <div class="dashboard-bottom">
        <!-- Top AI Knowledge Needs -->
        <div class="dash-card">
            <div class="card-header-row">
                <h3 class="card-title">Top AI Knowledge Needs</h3>
                <a href="{{ route('ai.index') }}" class="card-action">Train Now</a>
            </div>
            <ol class="knowledge-list" id="knowledge-needs">
                <li><div class="loading-placeholder" style="width:100%">Loading...</div></li>
            </ol>
        </div>

        <!-- Agent Leaderboard -->
        <div class="dash-card">
            <div class="card-header-row">
                <h3 class="card-title">Agent Leaderboard</h3>
            </div>
            <div id="agent-leaderboard">
                <div class="loading-placeholder">Loading...</div>
            </div>
        </div>

        <!-- Recent Contact Sign-up -->
        <div class="dash-card">
            <div class="card-header-row">
                <h3 class="card-title">Recent Contact Sign-up</h3>
            </div>
            @forelse($recentContacts as $contact)
            <div class="contact-item">
                <div class="contact-avatar">
                    <i class="fi fi-sr-user" style="color:#aaa;font-size:18px;"></i>
                </div>
                <div class="contact-info">
                    <div class="contact-name">{{ $contact->name ?? 'Unknown' }}</div>
                    <div class="contact-sub">{{ $contact->email ?? $contact->phone ?? '' }}</div>
                </div>
                <div class="contact-time">{{ $contact->created_at ? $contact->created_at->diffForHumans(null, true, true) : '' }}</div>
            </div>
            @empty
            <div class="loading-placeholder">No contacts yet</div>
            @endforelse
        </div>
    </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="{{ asset('js/dashboard-firebase.js') . '?v=' . time() }}"></script>
@endsection
