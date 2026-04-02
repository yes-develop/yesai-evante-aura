@extends('layouts.app')

@section('title', 'Chat Performance Analytics')

@section('page-title', 'Analytics')
@section('page-subtitle', 'Chat Performance')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/analytics.css?time=') }}<?php echo time();?>">
@endsection

@section('content')
<div class="analytics-container">
    <header class="analytics-header">
        <nav class="analytics-tabs">
            <a href="{{ route('analytics.index') }}" class="tab active">Chat Performance</a>
            <a href="{{ route('analytics.agent_performance') }}" class="tab">Agent Performance</a>
            <!-- <a href="{{ route('analytics.sales') }}" class="tab">Sales Performance</a> -->
            <a href="{{ route('analytics.label') }}" class="tab">Label Usage</a>
        </nav>
    </header>

    <div class="top-bar">
        <div class="filters">
            <div class="filter">
                <label>Time:</label>
                <select id="chatDateRange">
                    <option value="last_7_days">Last Week</option>
                    <option value="last_14_days">Last 14 Days</option>
                    <option value="last_30_days">Last Month</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                </select>
            </div>

            <div class="filter">
                <label>Channels:</label>
                <select id="chatChannelFilter">
                    <option value="all">All Channel</option>
                    <option value="line">LINE</option>
                    <option value="facebook">Facebook</option>
                </select>
            </div>
        </div>

        <button class="export-btn">⬇ Export</button>
    </div>
    <!-- ===== CARDS ===== -->
    <div class="cards">
        <!-- Card 1 -->
        <div class="card">
            <p class="card-title">Total Customer</p>
            <h2 id="totalCustomerValue">0</h2>
            <div class="kpi-trend" id="totalCustomerTrend"></div>
        </div>

        <!-- Card 2 -->
        <div class="card">
            <p class="card-title">New and Returning Chat</p>
            <div class="split">
                <div>
                    <h2 id="newChatsValue">0</h2>
                    <p>New</p>
                </div>
                <div class="divider"></div>
                <div>
                    <h2 id="returningChatsValue">0</h2>
                    <p>Returning</p>
                </div>
            </div>
        </div>

        <!-- Card 3 -->
        <div class="card">
            <p class="card-title">Missed Chat (12H)</p>
            <h2 id="missedChatsValue">0</h2>
            <div class="kpi-trend" id="missedChatsTrend"></div>
        </div>

        <!-- Card 4 -->
        <div class="card">
            <p class="card-title">Avg. Response Time</p>
            <h2 id="avgResponseTimeValue">0s</h2>
            <div class="kpi-trend" id="avgResponseTrend"></div>
        </div>

    </div>

    <div class="card">
        <div class="tabs">
            <button class="tab active" data-type="volume">Chat Volume</button>
            <button class="tab" data-type="missed">12h Missed Chats</button>
            <button class="tab" data-type="received">Message Received</button>
            <button class="tab" data-type="sent">Message Sent</button>
        </div>

        <canvas id="chatChart"></canvas>

        <!-- Legend -->
        <div class="chart-legend">
            <div class="legend-item">
                <div class="legend-color line-color"></div>
                <span>LINE</span>
            </div>
            <div class="legend-item">
                <div class="legend-color facebook-color"></div>
                <span>Facebook</span>
            </div>
        </div>
    </div>

    <div class="section">
        <!-- ================= LEFT CARD ================= -->
        <div class="card channels">
            <div class="channelsbar-header">
                <h3>Chat by Channels</h3>
                ⇅
            </div>

            <div class="bar-list" id="chatByChannelBarList">
                <div class="bar-row" style="--value:0; --max:1; --color:#86efac">
                    <div class="bar">
                        <div class="fill">
                            <span class="label"><i data-lucide="message-circle" class="icon"></i>LINE</span>
                        </div>
                    </div>
                    <span class="num">0</span>
                </div>
            </div>
        </div>

        <!-- ================= DONUT 1 ================= -->
        <div class="card donut-card">
            <span>Avg. 10m Response Rate</span>
            <div class="donut-chart-container">
                <canvas id="donutChart10m"></canvas>
                <div class="donut-center">
                    <p>Response Rate</p>
                    <h2 id="donut10mValue">0.0%</h2>
                </div>
            </div>
        </div>

        <!-- ================= DONUT 2 ================= -->
        <div class="card donut-card">
            <span>Avg. 12h Response Rate</span>
            <div class="donut-chart-container">
                <canvas id="donutChart12h"></canvas>
                <div class="donut-center">
                    <p>Response Rate</p>
                    <h2 id="donut12hValue">0.0%</h2>
                </div>
            </div>
        </div>
    </div>

    <!-- Performance by Integrations Section -->
    <section class="performance-section">
        <div class="performance-card">
            <div class="performance-header">
                <div>
                    <h2>Performance by Integrations</h2>
                    <p class="section-description">
                        Chat performance calculations may differ from the other platforms. Read <a href="#" class="link-text">How Do We Calculate</a> for more details.
                    </p>
                </div>
                <div class="performance-search">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="Search integrations..." aria-label="Search integrations">
                </div>
            </div>

            <div class="performance-table">
                <table>
                    <thead>
                        <tr>
                            <th class="sortable">Name <span class="sort-icon">⌃</span></th>
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
                    <tbody id="performanceIntegrationTableBody">
                        <tr>
                            <td colspan="6" class="text-center">Loading...</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="performance-pagination" id="performancePagination"></div>
        </div>
    </section>
</div>

@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="{{ asset('js/analytics.js?time=') }}<?php echo time();?>"></script>
<script src="https://unpkg.com/lucide@latest"></script>
@endsection
