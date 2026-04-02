@extends('layouts.app')

@section('title', 'Label Usage Analytics')

@section('page-title', 'Analytics')
@section('page-subtitle', 'Label Usage')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/analytics.css?time=') }}<?php echo time();?>">
@endsection

@section('content')
<div class="analytics-container">
    <header class="analytics-header">
        <nav class="analytics-tabs">
            <a href="{{ route('analytics.index') }}" class="tab">Chat Performance</a>
            <a href="{{ route('analytics.agent_performance') }}" class="tab">Agent Performance</a>
            <!-- <a href="{{ route('analytics.sales') }}" class="tab">Sales Performance</a> -->
            <a href="{{ route('analytics.label') }}" class="tab active">Label Usage</a>
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

    <div class="label-usage">
        <div class="label-card">
            <div class="label-header">
                <h2 class="label-title">Label Distribution</h2>
                <button class="add-label-button">
                    <span class="add-icon">+</span>
                    Add Label
                </button>
            </div>

            <div class="label-distribution">
                <div class="label-chart-container">
                    <canvas id="labelDistributionChart"></canvas>
                </div>

                <div class="label-legend-card">
                    <div id="labelLegendList"></div>
                </div>
            </div>
        </div>

        <section class="label-table">
            <div class="label-table-card">
                <div class="label-table-header">
                    <h2>Label</h2>
                    <div class="label-search">
                        <span class="search-icon">🔍</span>
                        <input type="text" id="labelSearchInput" placeholder="Search label..." aria-label="Search label">
                    </div>
                </div>

                <div class="label-table-inner">
                    <table>
                        <thead>
                            <tr>
                                <th class="sortable">Label <span class="sort-icon">↕</span></th>
                                <th class="sortable">Total Usage <span class="sort-icon">↕</span></th>
                                <th class="sortable">Usage Rate <span class="sort-icon">↕</span></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="labelTableBody"></tbody>
                    </table>
                </div>

                <div class="label-table-pagination" id="labelPagination"></div>
            </div>
        </section>

        <!-- Label Modal -->
        <div class="label-modal" style="display: none;">
            <div class="label-modal-content">
                <div class="label-modal-header">
                    <h3>Add New Label</h3>
                    <button class="close-modal">✕</button>
                </div>
                <div class="label-modal-body">
                    <form id="labelForm">
                        <div class="form-group">
                            <label for="label-name">Label Name</label>
                            <div class="input-with-icon">
                                <span class="input-icon">🔍</span>
                                <input type="text" id="label-name" name="label-name" class="form-control" placeholder="Search label..." required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Label Color</label>
                            <div class="color-picker">
                                <div class="color-option" style="background-color: #4e73df"></div>
                                <div class="color-option" style="background-color: #1cc88a"></div>
                                <div class="color-option" style="background-color: #36b9cc"></div>
                                <div class="color-option" style="background-color: #f6c23e"></div>
                                <div class="color-option" style="background-color: #e74a3b"></div>
                                <div class="color-option" style="background-color: #858796"></div>
                                <div class="color-option" style="background-color: #5a5c69"></div>
                                <div class="color-option" style="background-color: #f8f9fc"></div>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Label</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>
<script src="{{ asset('js/analytics.js?time=') }}<?php echo time();?>"></script>
<script src="https://unpkg.com/lucide@latest"></script>
@endsection
