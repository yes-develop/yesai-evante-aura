@extends('layouts.app')

@section('title', 'Sales Performance Analytics')

@section('page-title', 'Analytics')
@section('page-subtitle', 'Sales Performance')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/analytics.css?time=') }}<?php echo time();?>">
@endsection

@section('content')
<div class="analytics-container">
    <header class="analytics-header">
        <nav class="analytics-tabs">
            <a href="{{ route('analytics.index') }}" class="tab">Chat Performance</a>
            <a href="{{ route('analytics.agent_performance') }}" class="tab">Agent Performance</a>
            <a href="{{ route('analytics.sales') }}" class="tab active">Sales Performance</a>
            <a href="{{ route('analytics.label') }}" class="tab">Label Usage</a>
        </nav>
    </header>

    <div class="top-bar">
        <div class="filters">
            <div class="filter">
                <label>Time:</label>
                <select>
                    <option>Last Week</option>
                    <option>Last Month</option>
                </select>
            </div>

            <div class="filter">
                <label>Channels:</label>
                <select>
                    <option>All Channel</option>
                    <option>LINE</option>
                    <option>Facebook</option>
                </select>
            </div>
        </div>

        <button class="export-btn">⬇ Export</button>
    </div>
    <!-- ===== CARDS ===== -->
    <div class="cards">
        <!-- Card 1 -->
        <div class="card">
            <p class="card-title">Total Revenue</p>
            <h2>$5,250.00</h2>
            <div>
                <div class="badge green">
                ↑ 10%
                </div>
                <span>from last week</span>
            </div>
        </div>

        <!-- Card 2 -->
        <div class="card">
            <p class="card-title">Total Orders</p>
            <h2>3</h2>
            <div>
                <div class="badge green">
                ↑ 10%
                </div>
                <span>from last week</span>
            </div>
        </div>

        <!-- Card 3 -->
        <div class="card">
            <p class="card-title">Average Order Value</p>
            <h2>$1,750.00</h2>
            <div>
                <div class="badge green">
                ↑ 10%
                </div>
                <span>from last week</span>
            </div>
        </div>

        <!-- Card 4 -->
        <div class="card">
            <p class="card-title">Conversion Rate</p>
            <h2>15%</h2>
            <div>
                <div class="badge green">
                    -5s
                </div>
                <span>from last week</span>
            </div>
        </div>

    </div>

    <div class="card">
        <h6 class="mb-2 font-bold">Daily Revenue</h6>

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

    <section class="top-product">
        <div class="top-product-card">
            <div class="top-product-header">
                <h2>Top Product</h2>
                <div class="top-product-search">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="Search product..." aria-label="Search product">
                </div>
            </div>

            <div class="top-product-table">
                <table>
                    <thead>
                        <tr>
                            <th class="sortable">Product <span class="sort-icon">↕</span></th>
                            <th class="sortable">Sales <span class="sort-icon">↕</span></th>
                            <th class="sortable">Revenue <span class="sort-icon">↕</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div class="product-cell">
                                    <img src="{{ asset('images/room-deluxe.png') }}" alt="Deluxe Room" class="product-thumb">
                                    <div>
                                        <div class="product-name">Deluxe Room Package</div>
                                        <div class="product-category">Accommodation</div>
                                    </div>
                                </div>
                            </td>
                            <td>2</td>
                            <td>$3,500</td>
                        </tr>
                        <tr>
                            <td>
                                <div class="product-cell">
                                    <img src="{{ asset('images/room-standard.png') }}" alt="Standard Room" class="product-thumb">
                                    <div>
                                        <div class="product-name">Standard Room</div>
                                        <div class="product-category">Accommodation</div>
                                    </div>
                                </div>
                            </td>
                            <td>1</td>
                            <td>$1,750</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="top-product-pagination">
                <button class="pagination-btn" disabled>← Previous</button>
                <div class="pagination-pages">
                    <button class="page active">1</button>
                    <button class="page">2</button>
                    <button class="page">3</button>
                    <span class="page-ellipsis">…</span>
                    <button class="page">8</button>
                    <button class="page">9</button>
                    <button class="page">10</button>
                </div>
                <button class="pagination-btn">Next →</button>
            </div>
        </div>
    </section>
</div>

<!-- Calendar Popup (Initially Hidden) -->
<div class="calendar-popup" style="display: none;">
    <!-- Calendar content same as index.blade.php -->
</div>

<!-- Date Range Dropdown (Initially Hidden) -->
<div class="date-range-dropdown" style="display: none;">
    <!-- Date range options same as index.blade.php -->
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="{{ asset('js/analytics.js?time=') }}<?php echo time();?>"></script>
<script src="https://unpkg.com/lucide@latest"></script>
@endsection

