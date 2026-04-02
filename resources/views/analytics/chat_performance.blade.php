<section class="chat-summary">
    <h2>Chat Summary</h2>
    
    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-header">
                <h3>New vs Returning Chats</h3>
                <div class="info-icon">ⓘ</div>
                <div class="menu-icon">⋮</div>
            </div>
            <div class="chart-container">
                <div class="donut-chart">
                    <div class="donut-inner">
                        <span class="donut-percent">100.0%</span>
                    </div>
                </div>
                <div class="chart-legend">
                    <div class="legend-item">
                        <span class="legend-color new"></span>
                        <span class="legend-label">New Chats</span>
                        <span class="legend-value">{{ $chatSummary['new_chats'] }}</span>
                    </div>
                    @if($chatSummary['returning_chats'] > 0)
                // filepath: c:\yesweb\resources\views\Analytics\chat_performance.blade.php
<section class="chat-summary">
    <h2>Chat Summary</h2>
    
    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-header">
                <h3>New vs Returning Chats</h3>
                <div class="info-icon">ⓘ</div>
                <div class="menu-icon">⋮</div>
            </div>
            <div class="chart-container">
                <div class="donut-chart">
                    <div class="donut-inner">
                        <span class="donut-percent">100.0%</span>
                    </div>
                </div>
                <div class="chart-legend">
                    <div class="legend-item">
                        <span class="legend-color new"></span>
                        <span class="legend-label">New Chats</span>
                        <span class="legend-value">{{ $chatSummary['new_chats'] }}</span>
                    </div>
                    @if($chatSummary['returning_chats'] > 0)
                    <div class="legend-item">
                        <span class="legend-color returning"></span>
                        <span class="legend-label">Returning Chats</span>
                        <span class="legend-value">{{ $chatSummary['returning_chats'] }}</span>