@extends('layouts.app')

@section('title', 'Agent Performance Analytics')

@section('page-title', 'Analytics')
@section('page-subtitle', 'Agent Performance')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/analytics.css?time=') }}<?php echo time();?>">
@endsection

@section('content')
<div class="analytics-container">
    <header class="analytics-header">        
        <nav class="analytics-tabs">
            <a href="{{ route('analytics.index') }}" class="tab">Chat Performance</a>
            <a href="{{ route('analytics.agent_performance') }}" class="tab active">Agent Performance</a>
            <!-- <a href="{{ route('analytics.sales') }}" class="tab">Sales Performance</a> -->
            <a href="{{ route('analytics.label') }}" class="tab">Label Usage</a>
        </nav>
    </header>

    <div class="top-bar">
        <div class="filters">
            <div class="filter">
                <label>Time:</label>
                <select id="agentDateRange">
                    <option value="last_7_days">Last Week</option>
                    <option value="last_14_days">Last 2 Weeks</option>
                    <option value="last_30_days">Last Month</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                </select>
            </div>

            <div class="filter">
                <label>Channels:</label>
                <select id="agentChannelFilter">
                    <option value="all">All Channel</option>
                    <option value="line">LINE</option>
                    <option value="facebook">Facebook</option>
                </select>
            </div>
        </div>

        <button class="export-btn">⬇ Export</button>
    </div>

    <!-- Chart card -->
    <div class="card">
        <div class="tabs">
            <button class="tab active" data-agent-chart="volume">Chat Volume</button>
            <button class="tab" data-agent-chart="missed">Missed Chats</button>
        </div>

        <canvas id="agentChart"></canvas>

        <!-- Dynamic legend -->
        <div id="agentChartLegend" class="chart-legend"></div>
    </div>

    <!-- Rankings -->
    <div class="rankings">
        <h2 class="ranking-title">Ranking</h2>
        <div class="ranking-cards">
            <div class="ranking-card">
                <h3>Highest Number of Customer Chats</h3>
                <div id="rankHighestChats" class="ranking-list"></div>
            </div>

            <div class="ranking-card">
                <h3>Lowest Number of 12-Hr Missed Chats</h3>
                <div id="rankLowestMissed" class="ranking-list"></div>
            </div>

            <div class="ranking-card">
                <h3>Highest 10-Min Response Rate</h3>
                <div id="rankHighestRate" class="ranking-list"></div>
            </div>

            <div class="ranking-card">
                <h3>Fastest to Respond</h3>
                <div id="rankFastest" class="ranking-list"></div>
            </div>
        </div>
    </div>

    <!-- Performance by Agent table -->
    <section class="performance-section">
        <div class="performance-card">
            <div class="performance-header">
                <div>
                    <h2>Performance by Agent</h2>
                    <p class="section-description">
                        Per-agent metrics based on assigned conversations.
                    </p>
                </div>
                <div class="performance-search">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="agentSearchInput" placeholder="Search agents..." aria-label="Search agents">
                </div>
            </div>

            <div class="performance-table">
                <table>
                    <thead>
                        <tr>
                            <th class="sortable">Agent <span class="sort-icon">⌃</span></th>
                            <th class="sortable">
                                Customer Chats
                                <span class="info-icon">ⓘ</span>
                                <span class="sort-icon">⌃</span>
                            </th>
                            <th class="sortable">
                                12h Missed Chats
                                <span class="info-icon">ⓘ</span>
                                <span class="sort-icon">⌃</span>
                            </th>
                            <th class="sortable">
                                Avg. 12h Response Rate
                                <span class="info-icon">ⓘ</span>
                                <span class="sort-icon">⌃</span>
                            </th>
                            <th class="sortable">
                                Avg. 10m Response Rate
                                <span class="info-icon">ⓘ</span>
                                <span class="sort-icon">⌃</span>
                            </th>
                            <th class="sortable">
                                Avg. Response Time
                                <span class="info-icon">ⓘ</span>
                                <span class="sort-icon">⌃</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody id="agentTableBody"></tbody>
                </table>
            </div>

            <div class="performance-pagination" id="agentPagination"></div>
        </div>
    </section>
</div>

@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="{{ asset('js/analytics.js?time=') }}<?php echo time();?>"></script>
<script src="https://unpkg.com/lucide@latest"></script>
@endsection
