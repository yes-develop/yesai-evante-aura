// ============================================================================
// ANALYTICS (Chat Performance focused)
// ============================================================================

(function () {
    if (typeof window.Chart === 'undefined') {
        return;
    }

    Chart.defaults.font.family = "'Nunito', 'Segoe UI', arial";
    Chart.defaults.font.size = 12;

    const COLORS = {
        line: {
            volume: 'rgba(76,175,80,1)',
            missed: 'rgba(244,67,54,1)',
            received: 'rgba(33,150,243,1)',
            sent: 'rgba(0,150,136,1)'
        },
        facebook: {
            volume: 'rgba(33,150,243,1)',
            missed: 'rgba(255,152,0,1)',
            received: 'rgba(156,39,176,1)',
            sent: 'rgba(63,81,181,1)'
        },
        donut: '#ECF300'
    };

    const STATE = {
        chatData: null,
        selectedDateRange: 'last_7_days',
        selectedChannel: 'all',
        selectedChartType: 'volume',
        agentData: null,
        selectedAgentDateRange: 'last_7_days',
        selectedAgentChannel: 'all',
        selectedAgentChartType: 'volume',
        selectedAgentSearch: '',
        selectedLabelSearch: '',
        agentRawContext: null,
        chatLineChart: null,
        agentLineChart: null,
        donut10mChart: null,
        donut12hChart: null,
        labelChart: null,
        labelData: null,
        perfPage: 1,
        agentPage: 1,
        labelPage: 1
    };

    const CHAT_TYPE_MAP = {
        volume: { lineKey: 'line_chats', facebookKey: 'facebook_chats' },
        missed: { lineKey: 'line_missed', facebookKey: 'facebook_missed' },
        received: { lineKey: 'line_received', facebookKey: 'facebook_received' },
        sent: { lineKey: 'line_sent', facebookKey: 'facebook_sent' }
    };

    const AGENT_PALETTE = [
        'rgba(34,197,94,1)',
        'rgba(59,130,246,1)',
        'rgba(249,115,22,1)',
        'rgba(168,85,247,1)',
        'rgba(236,72,153,1)',
        'rgba(20,184,166,1)',
        'rgba(234,179,8,1)',
        'rgba(239,68,68,1)'
    ];

    function isChatPage() {
        return Boolean(document.getElementById('chatChart') && document.getElementById('totalCustomerValue'));
    }

    function isAgentPage() {
        return Boolean(document.getElementById('agentChart') && document.getElementById('agentTableBody'));
    }

    function isLabelPage() {
        return Boolean(document.getElementById('labelDistributionChart'));
    }

    async function fetchAnalyticsData(tab, dateRange = 'last_7_days') {
        try {
            const response = await fetch(`/api/analytics?tab=${encodeURIComponent(tab)}&date_range=${encodeURIComponent(dateRange)}`);
            const result = await response.json();
            return result.success ? result : null;
        } catch (error) {
            console.error('Failed to fetch analytics data:', error);
            return null;
        }
    }

    function toNumber(value, fallback = 0) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    function toNumberArray(values) {
        if (!Array.isArray(values)) return [];
        return values.map((value) => toNumber(value));
    }

    function clampPercent(value) {
        const n = toNumber(value, 0);
        return Math.max(0, Math.min(100, n));
    }

    function formatPercent(value) {
        return `${clampPercent(value).toFixed(1)}%`;
    }

    function safeText(value, fallback = '') {
        const text = String(value ?? '').trim();
        return text || fallback;
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function sumSeries(series) {
        return (Array.isArray(series) ? series : []).reduce((sum, n) => sum + toNumber(n), 0);
    }

    function normalizeRecentActivity(rawRecentActivity) {
        return Array.isArray(rawRecentActivity)
            ? rawRecentActivity.map((item) => ({
                date: item?.date || '',
                isoDate: item?.isoDate || item?.iso_date || '',
                messages: toNumber(item?.messages),
                conversations: toNumber(item?.conversations)
            }))
            : [];
    }

    // Reuse panels-tabs analytics shaping so card metrics come from the same logic.
    function buildPanelsStyleStats(chatSummary) {
        const recentActivity = normalizeRecentActivity(chatSummary?.recent_activity);
        const todayIso = new Date().toISOString().split('T')[0];
        const activeTodayEntry = recentActivity.find((item) => item.isoDate === todayIso);
        const activeToday = activeTodayEntry ? activeTodayEntry.messages : 0;

        const totalConversations = toNumber(chatSummary?.total_chats);
        const totalMessages = toNumber(chatSummary?.messages_received);
        const avgMessagesPerConversation = totalConversations > 0
            ? Math.round((totalMessages / totalConversations) * 10) / 10
            : 0;

        return {
            totalConversations,
            totalMessages,
            activeToday,
            avgMessagesPerConversation,
            recentActivity
        };
    }

    function normalizeChatPayload(data) {
        const chatSummary = data?.chatSummary || {};
        const chartData = data?.chartData || {};
        const panelsStats = buildPanelsStyleStats(chatSummary);

        const lineChats = toNumberArray(chartData?.line_chats);
        const facebookChats = toNumberArray(chartData?.facebook_chats);
        const totalChatsSeries = toNumberArray(chartData?.total_chats);
        const lineMissed = toNumberArray(chartData?.line_missed);
        const facebookMissed = toNumberArray(chartData?.facebook_missed);
        const lineReceived = toNumberArray(chartData?.line_received);
        const facebookReceived = toNumberArray(chartData?.facebook_received);
        const lineSent = toNumberArray(chartData?.line_sent);
        const facebookSent = toNumberArray(chartData?.facebook_sent);

        const normalizedSummary = {
            totalChats: panelsStats.totalConversations,
            newChats: toNumber(chatSummary?.new_chats),
            returningChats: toNumber(chatSummary?.returning_chats),
            missedChats: toNumber(chatSummary?.missed_chats, sumSeries(lineMissed) + sumSeries(facebookMissed)),
            avgResponseTime: chatSummary?.avg_response_time || '0s',
            responseRate12h: clampPercent(chatSummary?.response_rate_12hr),
            responseRate10m: clampPercent(chatSummary?.response_rate_10min),
            unique_line: toNumber(chatSummary?.unique_line),
            unique_facebook: toNumber(chatSummary?.unique_facebook)
        };

        const normalizedChartData = {
            dates: Array.isArray(chartData?.dates) ? chartData.dates : [],
            total_chats: totalChatsSeries,
            line_chats: lineChats,
            facebook_chats: facebookChats,
            line_missed: lineMissed,
            facebook_missed: facebookMissed,
            line_received: lineReceived,
            facebook_received: facebookReceived,
            line_sent: lineSent,
            facebook_sent: facebookSent
        };

        return {
            summary: normalizedSummary,
            chartData: normalizedChartData,
            panelsStats
        };
    }

    function makeGradient(ctx, rgba) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 320);
        gradient.addColorStop(0, rgba.replace('1)', '0.35)'));
        gradient.addColorStop(1, rgba.replace('1)', '0.02)'));
        return gradient;
    }

    function getSeries(chartData, key) {
        if (!chartData || !Array.isArray(chartData[key])) {
            return [];
        }
        return chartData[key].map((v) => toNumber(v));
    }

    function renderChatSummary(summary, prevSummary) {
        const totalCustomerEl = document.getElementById('totalCustomerValue');
        const newChatsEl = document.getElementById('newChatsValue');
        const returningChatsEl = document.getElementById('returningChatsValue');
        const missedChatsEl = document.getElementById('missedChatsValue');
        const avgResponseTimeEl = document.getElementById('avgResponseTimeValue');

        if (totalCustomerEl) totalCustomerEl.textContent = toNumber(summary?.totalChats).toLocaleString();
        if (newChatsEl) newChatsEl.textContent = toNumber(summary?.newChats).toLocaleString();
        if (returningChatsEl) returningChatsEl.textContent = toNumber(summary?.returningChats).toLocaleString();
        if (missedChatsEl) missedChatsEl.textContent = toNumber(summary?.missedChats).toLocaleString();
        if (avgResponseTimeEl) avgResponseTimeEl.textContent = summary?.avgResponseTime || '0s';

        var prev = prevSummary || null;
        renderKpiTrend('totalCustomerTrend', toNumber(summary?.totalChats), prev ? toNumber(prev.totalChats) : null, false);
        renderKpiTrend('missedChatsTrend', toNumber(summary?.missedChats), prev ? toNumber(prev.missedChats) : null, true);
        renderTimeTrend('avgResponseTrend', summary?.avgResponseTime, prev ? prev.avgResponseTime : null);
    }

    function createOrUpdateDonut(canvasId, existingChart, percent, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return existingChart;

        const pct = clampPercent(percent);
        const dataset = [pct, Math.max(0, 100 - pct)];

        if (existingChart) {
            existingChart.data.datasets[0].data = dataset;
            existingChart.update();
            return existingChart;
        }

        return new Chart(canvas, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: dataset,
                    backgroundColor: [color, '#f3f4f6'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
    }

    function renderDonutRates(summary) {
        const rate10m = clampPercent(summary?.responseRate10m);
        const rate12h = clampPercent(summary?.responseRate12h);

        const donut10mValue = document.getElementById('donut10mValue');
        const donut12hValue = document.getElementById('donut12hValue');

        if (donut10mValue) donut10mValue.textContent = formatPercent(rate10m);
        if (donut12hValue) donut12hValue.textContent = formatPercent(rate12h);

        STATE.donut10mChart = createOrUpdateDonut('donutChart10m', STATE.donut10mChart, rate10m, COLORS.donut);
        STATE.donut12hChart = createOrUpdateDonut('donutChart12h', STATE.donut12hChart, rate12h, COLORS.donut);
    }

    function buildChannelRows(summary) {
        const lineChats = toNumber(summary?.unique_line);
        const fbChats = toNumber(summary?.unique_facebook);
        const totalChats = toNumber(summary?.totalChats);
        const otherChats = Math.max(0, totalChats - lineChats - fbChats);

        return [
            { key: 'line', label: 'LINE', icon: 'message-circle', count: lineChats, color: '#86efac' },
            { key: 'facebook', label: 'Facebook', icon: 'facebook', count: fbChats, color: '#93c5fd' },
            { key: 'other', label: 'Other', icon: 'more-horizontal', count: otherChats, color: '#d1d5db' }
        ].filter((row) => row.count > 0 || row.key !== 'other');
    }

    function renderChatByChannelBars(summary) {
        const container = document.getElementById('chatByChannelBarList');
        if (!container) return;

        const rows = buildChannelRows(summary);
        const filteredRows = rows.filter((row) => {
            if (STATE.selectedChannel === 'all') return true;
            return row.key === STATE.selectedChannel;
        });

        const rowsToRender = filteredRows.length ? filteredRows : rows;
        const maxValue = Math.max(1, ...rowsToRender.map((row) => row.count));

        container.innerHTML = rowsToRender.map((row) => `
            <div class="bar-row" style="--value:${row.count}; --max:${maxValue}; --color:${row.color}">
                <div class="bar">
                    <div class="fill">
                        <span class="label"><i data-lucide="${row.icon}" class="icon"></i>${row.label}</span>
                    </div>
                </div>
                <span class="num">${row.count.toLocaleString()}</span>
            </div>
        `).join('');

        if (typeof window.lucide !== 'undefined') {
            window.lucide.createIcons();
        }
    }

    function computeChannelStats(chartData, summary) {
        const channels = [
            {
                key: 'line',
                name: 'LINE',
                chats: toNumber(summary?.unique_line),
                missed: sumSeries(getSeries(chartData, 'line_missed'))
            },
            {
                key: 'facebook',
                name: 'Facebook',
                chats: toNumber(summary?.unique_facebook),
                missed: sumSeries(getSeries(chartData, 'facebook_missed'))
            }
        ];

        const overall12h = clampPercent(summary?.responseRate12h);
        const overall10m = clampPercent(summary?.responseRate10m);
        const ratio10m = overall12h > 0 ? (overall10m / overall12h) : 0;

        return channels.map((channel) => {
            const responded = Math.max(0, channel.chats - channel.missed);
            const rate12h = channel.chats > 0 ? (responded / channel.chats) * 100 : 0;
            const rate10m = overall12h > 0 ? Math.min(100, rate12h * ratio10m) : 0;

            return {
                ...channel,
                rate12h,
                rate10m,
                avgResponseTime: summary?.avgResponseTime || '0s'
            };
        });
    }

    const ROWS_PER_PAGE = 5;

    function buildPageNumbers(current, total) {
        const pages = [];
        if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
            return pages;
        }
        pages.push(1);
        if (current > 3) pages.push('...');
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
            pages.push(i);
        }
        if (current < total - 2) pages.push('...');
        pages.push(total);
        return pages;
    }

    function renderPagination(containerId, currentPage, totalPages, onPageChange) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        const pageNums = buildPageNumbers(currentPage, totalPages);
        const pagesHtml = pageNums.map((p) => {
            if (p === '...') return '<span class="page-ellipsis">\u2026</span>';
            return `<button class="page${p === currentPage ? ' active' : ''}" data-page="${p}">${p}</button>`;
        }).join('');

        container.innerHTML = `
            <button class="pagination-btn" data-page="prev"${currentPage === 1 ? ' disabled' : ''}>\u2190 Previous</button>
            <div class="pagination-pages">${pagesHtml}</div>
            <button class="pagination-btn" data-page="next"${currentPage === totalPages ? ' disabled' : ''}>Next \u2192</button>
        `;

        container.querySelectorAll('[data-page]').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                const val = btn.dataset.page;
                let newPage = currentPage;
                if (val === 'prev') newPage = currentPage - 1;
                else if (val === 'next') newPage = currentPage + 1;
                else newPage = parseInt(val, 10);
                if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
                    onPageChange(newPage);
                }
            });
        });
    }

    function renderPerformanceTable(summary, chartData) {
        const tbody = document.getElementById('performanceIntegrationTableBody');
        if (!tbody) return;

        const rows = computeChannelStats(chartData, summary).filter((row) => row.chats > 0);
        const visibleRows = rows.filter((row) => STATE.selectedChannel === 'all' || row.key === STATE.selectedChannel);

        if (visibleRows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No data available</td></tr>';
            renderPagination('performancePagination', 1, 1, () => {});
            return;
        }

        const totalPages = Math.ceil(visibleRows.length / ROWS_PER_PAGE);
        STATE.perfPage = Math.max(1, Math.min(STATE.perfPage, totalPages));
        const pageRows = visibleRows.slice((STATE.perfPage - 1) * ROWS_PER_PAGE, STATE.perfPage * ROWS_PER_PAGE);

        tbody.innerHTML = pageRows.map((row) => `
            <tr>
                <td><div class="integration-name">${row.name}</div></td>
                <td class="highlight-cell">${row.chats.toLocaleString()}</td>
                <td>${row.missed.toLocaleString()}</td>
                <td class="highlight-cell">${formatPercent(row.rate12h)}</td>
                <td class="highlight-cell">${formatPercent(row.rate10m)}</td>
                <td>${row.avgResponseTime}</td>
            </tr>
        `).join('');

        renderPagination('performancePagination', STATE.perfPage, totalPages, (p) => {
            STATE.perfPage = p;
            renderPerformanceTable(summary, chartData);
        });
    }

    function getLegendElement() {
        return document.getElementById('chatChart')?.closest('.card')?.querySelector('.chart-legend') || null;
    }

    function updateLegend(type) {
        const legend = getLegendElement();
        if (!legend) return;

        const dots = legend.querySelectorAll('.legend-color');
        if (dots.length < 2) return;

        dots[0].style.backgroundColor = COLORS.line[type];
        dots[1].style.backgroundColor = COLORS.facebook[type];

        const lineItem = dots[0].closest('.legend-item');
        const fbItem = dots[1].closest('.legend-item');

        if (lineItem) lineItem.style.opacity = (STATE.selectedChannel === 'all' || STATE.selectedChannel === 'line') ? '1' : '0.35';
        if (fbItem) fbItem.style.opacity = (STATE.selectedChannel === 'all' || STATE.selectedChannel === 'facebook') ? '1' : '0.35';
    }

    function buildChatDatasets(chartData, type, ctx) {
        const mapping = CHAT_TYPE_MAP[type] || CHAT_TYPE_MAP.volume;
        const lineSeries = getSeries(chartData, mapping.lineKey);
        const fbSeries = getSeries(chartData, mapping.facebookKey);

        const datasets = [];
        if (STATE.selectedChannel === 'all' || STATE.selectedChannel === 'line') {
            datasets.push({
                label: 'LINE',
                data: lineSeries,
                borderColor: COLORS.line[type],
                backgroundColor: makeGradient(ctx, COLORS.line[type]),
                fill: true,
                tension: 0.4,
                pointRadius: 0
            });
        }

        if (STATE.selectedChannel === 'all' || STATE.selectedChannel === 'facebook') {
            datasets.push({
                label: 'Facebook',
                data: fbSeries,
                borderColor: COLORS.facebook[type],
                backgroundColor: makeGradient(ctx, COLORS.facebook[type]),
                fill: true,
                tension: 0.4,
                pointRadius: 0
            });
        }

        return datasets;
    }

    function renderChatLineChart(chartData) {
        const canvas = document.getElementById('chatChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const labels = Array.isArray(chartData?.dates) ? chartData.dates : [];
        const datasets = buildChatDatasets(chartData, STATE.selectedChartType, ctx);

        if (!STATE.chatLineChart) {
            STATE.chatLineChart = new Chart(ctx, {
                type: 'line',
                data: { labels, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 3.5,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    scales: {
                        x: { grid: { display: false } },
                        y: {
                            beginAtZero: true,
                            max: 60,
                            ticks: { stepSize: 15 },
                            grid: { color: '#eee' }
                        }
                    }
                }
            });
        } else {
            STATE.chatLineChart.data.labels = labels;
            STATE.chatLineChart.data.datasets = datasets;
            STATE.chatLineChart.update();
        }

        updateLegend(STATE.selectedChartType);
    }

    function renderChatPage(data, prevData) {
        const summary = data?.summary || {};
        const prevSummary = prevData?.summary || null;
        const chartData = data?.chartData || {};

        renderChatSummary(summary, prevSummary);
        renderDonutRates(summary);
        renderChatLineChart(chartData);
        renderChatByChannelBars(summary);
        renderPerformanceTable(summary, chartData);
    }

    // =====================================================================
    // evante API Data Source
    // =====================================================================

    function getDateRangeBounds(dateRange) {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        let startDate;

        switch (dateRange) {
            case 'today':
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'yesterday':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setTime(startDate.getTime());
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'last_14_days':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 13);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'last_30_days':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 29);
                startDate.setHours(0, 0, 0, 0);
                break;
            default: // last_7_days
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 6);
                startDate.setHours(0, 0, 0, 0);
                break;
        }
        return { startDate, endDate };
    }

    function getPreviousPeriodBounds(startDate, endDate) {
        const durationMs = endDate.getTime() - startDate.getTime();
        const prevEnd = new Date(startDate.getTime() - 1);
        prevEnd.setHours(23, 59, 59, 999);
        const prevStart = new Date(prevEnd.getTime() - durationMs);
        prevStart.setHours(0, 0, 0, 0);
        return { startDate: prevStart, endDate: prevEnd };
    }

    function getPeriodLabel(dateRange) {
        switch (dateRange) {
            case 'today': return 'from yesterday';
            case 'yesterday': return 'from day before';
            case 'last_7_days': return 'from last week';
            case 'last_14_days': return 'from prev 14 days';
            case 'last_30_days': return 'from prev 30 days';
            default: return 'from prev period';
        }
    }

    function parseDurationToSec(str) {
        if (typeof str === 'number') return str;
        if (!str) return 0;
        var sec = 0;
        var h = str.match(/(\d+)h/); if (h) sec += parseInt(h[1]) * 3600;
        var m = str.match(/(\d+)m/); if (m) sec += parseInt(m[1]) * 60;
        var s = str.match(/(\d+)s/); if (s) sec += parseInt(s[1]);
        return sec;
    }

    function renderKpiTrend(elementId, currentVal, prevVal, lowerIsBetter) {
        var el = document.getElementById(elementId);
        if (!el) return;

        if (prevVal === null || prevVal === undefined) {
            el.innerHTML = '';
            return;
        }

        var diff = currentVal - prevVal;
        if (diff === 0) {
            el.innerHTML = '<span class="trend-badge flat">0%</span> <span class="trend-sub">' + getPeriodLabel(STATE.selectedDateRange) + '</span>';
            return;
        }

        var pct = prevVal !== 0 ? Math.round(Math.abs(diff) / prevVal * 100) : 100;
        var increased = diff > 0;
        var isGood = lowerIsBetter ? !increased : increased;
        var cls = isGood ? 'up' : 'down';
        var arrow = increased ? '\u2191' : '\u2193';
        var label = getPeriodLabel(STATE.selectedDateRange);

        el.innerHTML = '<span class="trend-badge ' + cls + '">' + arrow + ' ' + pct + '%</span> <span class="trend-sub">' + label + '</span>';
    }

    function renderTimeTrend(elementId, currentTime, prevTime) {
        var el = document.getElementById(elementId);
        if (!el) return;
        if (!prevTime) { el.innerHTML = ''; return; }

        var curSec = parseDurationToSec(currentTime);
        var prevSec = parseDurationToSec(prevTime);
        var diff = curSec - prevSec;

        if (diff === 0) {
            el.innerHTML = '<span class="trend-badge flat">0s</span> <span class="trend-sub">' + getPeriodLabel(STATE.selectedDateRange) + '</span>';
            return;
        }

        var isGood = diff < 0;
        var cls = isGood ? 'up' : 'down';
        var sign = diff > 0 ? '+' : '-';
        var label = getPeriodLabel(STATE.selectedDateRange);
        el.innerHTML = '<span class="trend-badge ' + cls + '">' + sign + formatAnalyticsDuration(Math.abs(diff)) + '</span> <span class="trend-sub">' + label + '</span>';
    }

    function detectMessageChannel(item) {
        const source = (item.source || item.platform || item.channel || '').toLowerCase();
        if (source.includes('facebook') || source.includes('fb') || source.includes('messenger')) return 'facebook';
        if (source.includes('line')) return 'line';

        const userId = item.lineUserId || item.userId || '';
        if (userId.startsWith('U') && userId.length > 20) return 'line';

        return 'line';
    }

    function formatAnalyticsDuration(seconds) {
        const sec = Math.max(0, toNumber(seconds));
        if (sec < 60) return `${Math.round(sec)}s`;
        if (sec < 3600) return `${Math.round(sec / 60)}m`;
        return `${Math.round(sec / 3600)}h`;
    }

    function toLocalDateStr(d) {
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function buildDateBuckets(startDate, endDate) {
        const dates = [];
        const labels = [];
        const diffMs = endDate.getTime() - startDate.getTime();
        const isSingleDay = diffMs <= 86400000; // 24 hours

        if (isSingleDay) {
            // Hourly buckets using local date
            const datePrefix = toLocalDateStr(new Date(startDate));
            for (let h = 0; h < 24; h++) {
                const key = datePrefix + 'T' + String(h).padStart(2, '0');
                dates.push(key);
                labels.push(h === 0 ? '12AM' : h < 12 ? h + 'AM' : h === 12 ? '12PM' : (h - 12) + 'PM');
            }
        } else {
            const cursor = new Date(startDate);
            while (cursor <= endDate) {
                const key = toLocalDateStr(cursor);
                dates.push(key);
                labels.push(cursor.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
                cursor.setDate(cursor.getDate() + 1);
            }
        }

        return { dates, labels, isHourly: isSingleDay };
    }

    function getBucketKey(timestamp, isHourly) {
        if (isHourly) {
            return toLocalDateStr(timestamp) + 'T' + String(timestamp.getHours()).padStart(2, '0');
        }
        return toLocalDateStr(timestamp);
    }

    function parseMessageTimestamp(rawValue) {
        if (!rawValue) return null;
        let ts = null;

        try {
            ts = new Date(rawValue);
        } catch (_) {
            ts = null;
        }

        if (!ts || Number.isNaN(ts.getTime())) return null;
        return ts;
    }

    function extractFirebaseMessages(data, startDate, endDate) {
        const allMessages = [];

        function traverse(obj) {
            if (!obj || typeof obj !== 'object') return;

            Object.values(obj).forEach((value) => {
                if (!value || typeof value !== 'object') return;

                const lineUuid = safeText(value.lineUuid || value.line_uuid || '');
                const message = safeText(value.userInput || value.message || '');
                const aiResponse = safeText(value.aiResponse || value.ai_response || '');

                if (lineUuid && (message || aiResponse)) {
                    const ts = parseMessageTimestamp(value.date || value.timestamp || value.created_at || value.time || '');
                    if (ts && ts >= startDate && ts <= endDate) {
                        allMessages.push({
                            lineUuid,
                            message,
                            aiResponse,
                            timestamp: ts,
                            chatMode: safeText(value.chatMode),
                            chatSequence: value.chatSequence != null ? Number(value.chatSequence) : null,
                            source: safeText(value.source || value.platform || value.channel || ''),
                            lineUserId: safeText(value.lineUserId || value.userId || '')
                        });
                    }
                }

                traverse(value);
            });
        }

        traverse(data);
        return allMessages;
    }

    function processFirebaseData(data, startDate, endDate) {
        const allMessages = extractFirebaseMessages(data, startDate, endDate);

        // ---------- aggregate by conversation ----------
        const convos = {};
        const eventsByUuid = {};
        let messagesReceived = 0;
        let messagesSent = 0;

        allMessages.forEach((item) => {
            const uuid = item.lineUuid;
            if (item.message) messagesReceived++;
            if (item.aiResponse) messagesSent++;

            if (!convos[uuid]) {
                convos[uuid] = {
                    hasUser: false,
                    hasAi: false,
                    chatMode: item.chatMode,
                    minSeq: item.chatSequence,
                    channel: detectMessageChannel(item)
                };
            }

            if (item.message) convos[uuid].hasUser = true;
            if (item.aiResponse) convos[uuid].hasAi = true;

            if (item.chatSequence !== null) {
                const cur = convos[uuid].minSeq;
                if (cur === null || item.chatSequence < cur) convos[uuid].minSeq = item.chatSequence;
            }

            if (!convos[uuid].chatMode && item.chatMode) convos[uuid].chatMode = item.chatMode;

            if (!eventsByUuid[uuid]) eventsByUuid[uuid] = [];
            eventsByUuid[uuid].push({ timestamp: item.timestamp, hasUser: !!item.message, hasAi: !!item.aiResponse });
        });

        // ---------- summary metrics ----------
        let newChats = 0, returningChats = 0, missedChats = 0, uniqueChats = 0;
        let uniqueLine = 0, uniqueFacebook = 0;

        Object.values(convos).forEach((c) => {
            if (!c.hasUser && !c.hasAi) return;
            uniqueChats++;
            if (c.channel === 'line') uniqueLine++;
            else if (c.channel === 'facebook') uniqueFacebook++;
            if (c.hasUser && !c.hasAi) missedChats++;

            const isNew = c.minSeq !== null
                ? c.minSeq <= 1
                : ['waiting response', 'manual', 'manual chat', ''].includes((c.chatMode || '').toLowerCase());
            if (isNew) newChats++;
            else returningChats++;
        });

        if ((newChats + returningChats) !== uniqueChats) {
            returningChats = Math.max(0, uniqueChats - newChats);
        }

        // ---------- response metrics ----------
        const responseTimes = [];
        let within12h = 0, within10m = 0, totalPairs = 0;

        Object.values(eventsByUuid).forEach((events) => {
            events.sort((a, b) => a.timestamp - b.timestamp);
            for (let i = 1; i < events.length; i++) {
                if (events[i].hasAi && events[i - 1].hasUser) {
                    const diffSec = (events[i].timestamp - events[i - 1].timestamp) / 1000;
                    responseTimes.push(diffSec);
                    if (diffSec <= 43200) within12h++;
                    if (diffSec <= 600) within10m++;
                    totalPairs++;
                }
            }
        });

        const avgSec = responseTimes.length > 0
            ? responseTimes.reduce((s, t) => s + t, 0) / responseTimes.length
            : 0;
        const rate12h = totalPairs > 0 ? (within12h / totalPairs * 100) : 0;
        const rate10m = totalPairs > 0 ? (within10m / totalPairs * 100) : 0;

        // ---------- peak hours ----------
        const hourCounts = {};
        allMessages.forEach((m) => {
            const h = m.timestamp.getHours();
            hourCounts[h] = (hourCounts[h] || 0) + 1;
        });
        const topHours = Object.entries(hourCounts)
            .map(([h, c]) => ({ hour: `${String(h).padStart(2, '0')}:00`, count: c }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        const busiestHour = topHours.length > 0 ? topHours[0].hour : 'N/A';
        const busiestCount = topHours.length > 0 ? topHours[0].count : 0;

        // ---------- daily breakdown for charts ----------
        const dailyData = {};
        const dayBuckets = buildDateBuckets(startDate, endDate);
        dayBuckets.dates.forEach((key, idx) => {
            dailyData[key] = {
                label: dayBuckets.labels[idx],
                lineRcv: 0, fbRcv: 0, lineSent: 0, fbSent: 0,
                convos: new Set(), lineConvos: new Set(), fbConvos: new Set(),
                responded: new Set(), respondedLine: new Set(), respondedFb: new Set()
            };
        });

        allMessages.forEach((item) => {
            const key = getBucketKey(item.timestamp, dayBuckets.isHourly);
            const d = dailyData[key];
            if (!d) return;

            const ch = detectMessageChannel(item);

            if (item.message) {
                if (ch === 'line') d.lineRcv++;
                else d.fbRcv++;
            }
            if (item.aiResponse) {
                if (ch === 'line') d.lineSent++;
                else d.fbSent++;
            }
            if (item.lineUuid) {
                d.convos.add(item.lineUuid);
                if (ch === 'line') d.lineConvos.add(item.lineUuid);
                else d.fbConvos.add(item.lineUuid);

                if (item.aiResponse) {
                    d.responded.add(item.lineUuid);
                    if (ch === 'line') d.respondedLine.add(item.lineUuid);
                    else d.respondedFb.add(item.lineUuid);
                }
            }
        });

        const sortedDays = Object.keys(dailyData).sort();
        const dates = [], totalChatsSeries = [], lineChats = [], facebookChats = [];
        const lineMissed = [], facebookMissed = [];
        const lineReceived = [], facebookReceived = [], lineSentArr = [], facebookSent = [];
        const recentActivity = [];

        sortedDays.forEach((key) => {
            const d = dailyData[key];
            const tc = d.convos.size;
            const lc = d.lineConvos.size;
            const fc = d.fbConvos.size;

            dates.push(d.label);
            totalChatsSeries.push(tc);
            lineChats.push(lc);
            facebookChats.push(fc);
            lineMissed.push(Math.max(0, lc - d.respondedLine.size));
            facebookMissed.push(Math.max(0, fc - d.respondedFb.size));
            lineReceived.push(d.lineRcv);
            facebookReceived.push(d.fbRcv);
            lineSentArr.push(d.lineSent);
            facebookSent.push(d.fbSent);
            recentActivity.push({
                date: d.label,
                isoDate: key,
                messages: d.lineRcv + d.fbRcv + d.lineSent + d.fbSent,
                conversations: tc
            });
        });

        return {
            success: true,
            chatSummary: {
                total_chats: uniqueChats,
                unique_line: uniqueLine,
                unique_facebook: uniqueFacebook,
                new_chats: newChats,
                returning_chats: returningChats,
                missed_chats: missedChats,
                response_rate_12hr: Math.round(rate12h * 10) / 10,
                response_rate_10min: Math.round(rate10m * 10) / 10,
                avg_response_time: formatAnalyticsDuration(avgSec),
                messages_received: messagesReceived,
                messages_sent: messagesSent,
                recent_activity: recentActivity,
                peak_hours: {
                    busiest_hour: busiestHour,
                    interactions: busiestCount,
                    hourly_breakdown: topHours
                }
            },
            chartData: {
                dates,
                total_chats: totalChatsSeries,
                line_chats: lineChats,
                facebook_chats: facebookChats,
                line_missed: lineMissed,
                facebook_missed: facebookMissed,
                line_received: lineReceived,
                facebook_received: facebookReceived,
                line_sent: lineSentArr,
                facebook_sent: facebookSent
            }
        };
    }

    async function fetchFirebaseRootData() {
        const response = await fetch('/api/line-conversations', {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Analytics API HTTP ' + response.status);
        const raw = await response.json();
        const arr = Array.isArray(raw) ? raw : (Array.isArray(raw && raw.data) ? raw.data : []);
        if (!arr.length) return null;
        // Wrap flat array as indexed object so traverse() works unchanged
        const obj = {};
        arr.forEach(function(item, i) { obj[i] = item; });
        return obj;
    }

    async function fetchFirebaseChatData(dateRange) {
        const { startDate, endDate } = getDateRangeBounds(dateRange);
        const rootData = await fetchFirebaseRootData();
        if (!rootData) return null;
        return processFirebaseData(rootData, startDate, endDate);
    }

    async function fetchFirebaseMessages(dateRange) {
        const { startDate, endDate } = getDateRangeBounds(dateRange);
        const rootData = await fetchFirebaseRootData();
        if (!rootData) {
            return {
                messages: [],
                startDate,
                endDate
            };
        }

        return {
            messages: extractFirebaseMessages(rootData, startDate, endDate),
            startDate,
            endDate
        };
    }

    // =====================================================================
    // Data Loading (evante API primary, analytics API fallback)
    // =====================================================================

    async function loadChatData() {
        let data = null;
        let prevData = null;

        // Try evante API first
        try {
            const { startDate, endDate } = getDateRangeBounds(STATE.selectedDateRange);
            const rootData = await fetchFirebaseRootData();
            if (rootData) {
                data = processFirebaseData(rootData, startDate, endDate);
                console.log('Analytics: loaded from evante API —', data?.chatSummary?.total_chats ?? 0, 'chats');

                var prev = getPreviousPeriodBounds(startDate, endDate);
                prevData = processFirebaseData(rootData, prev.startDate, prev.endDate);
            }
        } catch (err) {
            console.warn('Analytics: evante API failed, falling back to analytics API:', err);
        }

        // Fallback to backend analytics API
        if (!data || !data.success) {
            data = await fetchAnalyticsData('chat', STATE.selectedDateRange);
        }

        if (!data) {
            return;
        }

        STATE.chatData = normalizeChatPayload(data);
        STATE.chatPrevData = prevData ? normalizeChatPayload(prevData) : null;
        renderChatPage(STATE.chatData, STATE.chatPrevData);
    }

    function bindChatEvents() {
        const dateRangeSelect = document.getElementById('chatDateRange');
        const channelFilterSelect = document.getElementById('chatChannelFilter');

        if (dateRangeSelect) {
            dateRangeSelect.value = STATE.selectedDateRange;
            dateRangeSelect.addEventListener('change', async (event) => {
                STATE.selectedDateRange = event.target.value || 'last_7_days';
                await loadChatData();
            });
        }

        if (channelFilterSelect) {
            channelFilterSelect.value = STATE.selectedChannel;
            channelFilterSelect.addEventListener('change', (event) => {
                STATE.selectedChannel = event.target.value || 'all';
                STATE.perfPage = 1;
                if (STATE.chatData) {
                    renderChatPage(STATE.chatData, STATE.chatPrevData);
                }
            });
        }

        document.querySelectorAll('.tabs .tab[data-type]').forEach((button) => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tabs .tab[data-type]').forEach((tab) => tab.classList.remove('active'));
                button.classList.add('active');
                STATE.selectedChartType = button.dataset.type || 'volume';

                if (STATE.chatData) {
                    renderChatLineChart(STATE.chatData.chartData || {});
                }
            });
        });
    }

    async function fetchJsonFromEndpoints(endpoints) {
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    headers: { Accept: 'application/json' }
                });
                if (!response.ok) continue;

                const result = await response.json();
                if (Array.isArray(result)) return result;
                if (Array.isArray(result?.data)) return result.data;
                if (Array.isArray(result?.assignments)) return result.assignments;
            } catch (_) {
                // Try next endpoint.
            }
        }

        return [];
    }

    async function fetchChatAssignments() {
        return fetchJsonFromEndpoints(['/chat-assignments', '/api/all-assignments']);
    }

    async function fetchTeamMembers() {
        return fetchJsonFromEndpoints(['/team-members', '/api/team-members']);
    }

    function getAssignmentTimestamp(assignment) {
        const ts = parseMessageTimestamp(
            assignment?.assigned_at ||
            assignment?.updated_at ||
            assignment?.created_at ||
            ''
        );
        return ts ? ts.getTime() : 0;
    }

    function buildTeamMemberMap(teamMembers) {
        const membersById = new Map();
        (Array.isArray(teamMembers) ? teamMembers : []).forEach((member) => {
            const id = safeText(member?.id);
            if (!id) return;
            membersById.set(id, {
                id,
                name: safeText(member?.name, `Agent ${id}`),
                role: safeText(member?.role, 'Agent')
            });
        });
        return membersById;
    }

    function normalizeAssignments(assignments, membersById) {
        const items = Array.isArray(assignments) ? [...assignments] : [];
        items.sort((a, b) => getAssignmentTimestamp(b) - getAssignmentTimestamp(a));

        const assignmentByLineUuid = new Map();
        const agentsByKey = new Map();

        items.forEach((assignment) => {
            const lineUuid = safeText(assignment?.line_uuid || assignment?.lineUuid);
            if (!lineUuid || assignmentByLineUuid.has(lineUuid)) return;

            const userId = safeText(
                assignment?.user_id ||
                assignment?.userId ||
                assignment?.assigned_member_id
            );

            const member = userId ? membersById.get(userId) : null;
            const name = safeText(
                assignment?.assigned_user_name ||
                assignment?.assigned_member ||
                assignment?.user?.name ||
                member?.name,
                userId ? `Agent ${userId}` : 'Unknown Agent'
            );

            const role = safeText(
                assignment?.user_role ||
                assignment?.role ||
                assignment?.user?.role ||
                member?.role,
                'Agent'
            );

            const agentKey = userId ? `id:${userId}` : `name:${name.toLowerCase()}`;
            assignmentByLineUuid.set(lineUuid, { agentKey, userId, name, role });

            if (!agentsByKey.has(agentKey)) {
                agentsByKey.set(agentKey, { agentKey, userId, name, role });
            }
        });

        return {
            assignmentByLineUuid,
            agentsByKey
        };
    }

    function hashString(value) {
        return String(value || '').split('').reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
    }

    function getAgentColor(index, label) {
        if (index < AGENT_PALETTE.length) return AGENT_PALETTE[index];
        const hue = Math.abs(hashString(label)) % 360;
        return `hsla(${hue}, 72%, 48%, 1)`;
    }

    function createAgentMetricRecord(agent) {
        return {
            agentKey: agent.agentKey,
            userId: agent.userId || '',
            name: safeText(agent.name, 'Unknown Agent'),
            role: safeText(agent.role, 'Agent'),
            customerChats: 0,
            missedChats: 0,
            totalPairs: 0,
            within12h: 0,
            within10m: 0,
            totalResponseSec: 0,
            responseCount: 0,
            dailyVolumeByDate: {},
            dailyMissedByDate: {}
        };
    }

    function computeResponsePairs(events) {
        const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
        const pendingUsers = [];
        let totalPairs = 0;
        let within12h = 0;
        let within10m = 0;
        let totalResponseSec = 0;
        let responseCount = 0;

        sorted.forEach((event) => {
            if (event.hasUser) {
                pendingUsers.push(event.timestamp);
            }

            if (event.hasAi && pendingUsers.length > 0) {
                const userTs = pendingUsers.shift();
                const diffSec = (event.timestamp - userTs) / 1000;
                if (diffSec >= 0) {
                    totalPairs++;
                    totalResponseSec += diffSec;
                    responseCount++;
                    if (diffSec <= 43200) within12h++;
                    if (diffSec <= 600) within10m++;
                }
            }
        });

        return { totalPairs, within12h, within10m, totalResponseSec, responseCount };
    }

    function computeAgentMetrics(messages, assignmentContext, selectedChannel, startDate, endDate) {
        const { assignmentByLineUuid, agentsByKey } = assignmentContext;
        const dayBuckets = buildDateBuckets(startDate, endDate);
        const convosByLine = new Map();
        const metricsByAgent = new Map();

        agentsByKey.forEach((agent) => {
            metricsByAgent.set(agent.agentKey, createAgentMetricRecord(agent));
        });

        (Array.isArray(messages) ? messages : []).forEach((message) => {
            const assignment = assignmentByLineUuid.get(message.lineUuid);
            if (!assignment) return;

            const channel = detectMessageChannel(message);
            if (selectedChannel !== 'all' && channel !== selectedChannel) return;

            if (!metricsByAgent.has(assignment.agentKey)) {
                metricsByAgent.set(assignment.agentKey, createAgentMetricRecord(assignment));
            }

            if (!convosByLine.has(message.lineUuid)) {
                convosByLine.set(message.lineUuid, {
                    agentKey: assignment.agentKey,
                    hasUser: false,
                    hasAi: false,
                    events: [],
                    dailyFlags: new Map()
                });
            }

            const convo = convosByLine.get(message.lineUuid);
            if (message.message) convo.hasUser = true;
            if (message.aiResponse) convo.hasAi = true;
            convo.events.push({
                timestamp: message.timestamp,
                hasUser: Boolean(message.message),
                hasAi: Boolean(message.aiResponse)
            });

            const dateKey = getBucketKey(message.timestamp, dayBuckets.isHourly);
            if (!convo.dailyFlags.has(dateKey)) {
                convo.dailyFlags.set(dateKey, {
                    hasAny: false,
                    hasUser: false,
                    hasAi: false
                });
            }

            const day = convo.dailyFlags.get(dateKey);
            day.hasAny = true;
            if (message.message) day.hasUser = true;
            if (message.aiResponse) day.hasAi = true;
        });

        convosByLine.forEach((convo) => {
            const metric = metricsByAgent.get(convo.agentKey);
            if (!metric) return;

            metric.customerChats++;
            if (convo.hasUser && !convo.hasAi) metric.missedChats++;

            const responseStats = computeResponsePairs(convo.events);
            metric.totalPairs += responseStats.totalPairs;
            metric.within12h += responseStats.within12h;
            metric.within10m += responseStats.within10m;
            metric.totalResponseSec += responseStats.totalResponseSec;
            metric.responseCount += responseStats.responseCount;

            convo.dailyFlags.forEach((day, dateKey) => {
                if (day.hasAny) {
                    metric.dailyVolumeByDate[dateKey] = (metric.dailyVolumeByDate[dateKey] || 0) + 1;
                }
                if (day.hasUser && !day.hasAi) {
                    metric.dailyMissedByDate[dateKey] = (metric.dailyMissedByDate[dateKey] || 0) + 1;
                }
            });
        });

        const rows = Array.from(metricsByAgent.values())
            .map((metric) => {
                const rate12h = metric.totalPairs > 0 ? (metric.within12h / metric.totalPairs) * 100 : 0;
                const rate10m = metric.totalPairs > 0 ? (metric.within10m / metric.totalPairs) * 100 : 0;
                const avgResponseSec = metric.responseCount > 0 ? (metric.totalResponseSec / metric.responseCount) : null;

                return {
                    ...metric,
                    responseRate12h: rate12h,
                    responseRate10m: rate10m,
                    avgResponseSec,
                    avgResponseTime: avgResponseSec === null ? '—' : formatAnalyticsDuration(avgResponseSec),
                    chartVolume: dayBuckets.dates.map((date) => toNumber(metric.dailyVolumeByDate[date] || 0)),
                    chartMissed: dayBuckets.dates.map((date) => toNumber(metric.dailyMissedByDate[date] || 0))
                };
            })
            .filter((row) => row.customerChats > 0)
            .sort((a, b) => b.customerChats - a.customerChats || a.name.localeCompare(b.name));

        return {
            dates: dayBuckets.dates,
            labels: dayBuckets.labels,
            agents: rows
        };
    }

    function buildAgentSortValue(row, key) {
        switch (key) {
            case 'customerChats':
                return row.customerChats;
            case 'missedChats':
                return row.missedChats;
            case 'responseRate10m':
                return row.responseRate10m;
            case 'avgResponseSec':
                return row.avgResponseSec === null ? Number.POSITIVE_INFINITY : row.avgResponseSec;
            default:
                return 0;
        }
    }

    function getSortedAgentRows(rows, key, order = 'desc') {
        return [...rows].sort((a, b) => {
            const aValue = buildAgentSortValue(a, key);
            const bValue = buildAgentSortValue(b, key);
            const cmp = aValue - bValue;
            if (cmp === 0) return a.name.localeCompare(b.name);
            return order === 'asc' ? cmp : -cmp;
        });
    }

    function renderAgentRanking(containerId, rows, prevRows, valueKey, order, formatter, lowerIsBetter) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const sortedRows = getSortedAgentRows(rows, valueKey, order).slice(0, 5);
        if (!sortedRows.length) {
            container.innerHTML = '<div class="ranking-placeholder">No assigned chat data</div>';
            return;
        }

        // Build lookup of previous period values by agent name
        const prevMap = new Map();
        prevRows.forEach(row => prevMap.set(row.name, buildAgentSortValue(row, valueKey)));

        container.innerHTML = sortedRows.map((row, idx) => {
            const currentVal = buildAgentSortValue(row, valueKey);
            const prevVal = prevMap.get(row.name);
            let trendClass = 'flat';
            let trendSymbol = '\u2013';

            if (prevVal !== undefined && prevVal !== currentVal) {
                const increased = currentVal > prevVal;
                const isGood = lowerIsBetter ? !increased : increased;
                trendClass = isGood ? 'up' : 'down';
                trendSymbol = increased ? '\u2191' : '\u2193';
            }

            return `
            <div class="ranking-row">
                <div class="rank-left">
                    <span class="rank-num">${idx + 1}</span>
                    <span class="trend ${trendClass}">${trendSymbol}</span>
                    <span class="rank-name">${escapeHtml(row.name)}</span>
                </div>
                <span class="rank-value">${escapeHtml(formatter(row))}</span>
            </div>
        `;
        }).join('');
    }

    function renderAgentRankings(rows, prevRows) {
        renderAgentRanking('rankHighestChats', rows, prevRows, 'customerChats', 'desc', (row) => row.customerChats.toLocaleString(), false);
        renderAgentRanking('rankLowestMissed', rows, prevRows, 'missedChats', 'asc', (row) => row.missedChats.toLocaleString(), true);
        renderAgentRanking('rankHighestRate', rows, prevRows, 'responseRate10m', 'desc', (row) => formatPercent(row.responseRate10m), false);
        renderAgentRanking('rankFastest', rows, prevRows, 'avgResponseSec', 'asc', (row) => row.avgResponseTime, true);
    }

    function renderAgentTable(rows) {
        const tbody = document.getElementById('agentTableBody');
        if (!tbody) return;

        const searchTerm = STATE.selectedAgentSearch.toLowerCase();
        const visibleRows = rows.filter((row) => {
            if (!searchTerm) return true;
            return row.name.toLowerCase().includes(searchTerm);
        });

        if (!visibleRows.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No assigned chat data for this filter</td></tr>';
            renderPagination('agentPagination', 1, 1, () => {});
            return;
        }

        const totalPages = Math.ceil(visibleRows.length / ROWS_PER_PAGE);
        STATE.agentPage = Math.max(1, Math.min(STATE.agentPage, totalPages));
        const pageRows = visibleRows.slice((STATE.agentPage - 1) * ROWS_PER_PAGE, STATE.agentPage * ROWS_PER_PAGE);

        tbody.innerHTML = pageRows.map((row) => `
            <tr>
                <td><div class="integration-name">${escapeHtml(row.name)}</div></td>
                <td class="highlight-cell">${row.customerChats.toLocaleString()}</td>
                <td>${row.missedChats.toLocaleString()}</td>
                <td class="highlight-cell">${formatPercent(row.responseRate12h)}</td>
                <td class="highlight-cell">${formatPercent(row.responseRate10m)}</td>
                <td>${escapeHtml(row.avgResponseTime)}</td>
            </tr>
        `).join('');

        renderPagination('agentPagination', STATE.agentPage, totalPages, (p) => {
            STATE.agentPage = p;
            renderAgentTable(rows);
        });
    }

    function renderAgentLegend(rows) {
        const legend = document.getElementById('agentChartLegend');
        if (!legend) return;

        if (!rows.length) {
            legend.innerHTML = '';
            return;
        }

        const visibleRows = rows.slice(0, 8);
        const hiddenCount = Math.max(0, rows.length - visibleRows.length);

        legend.innerHTML = `
            ${visibleRows.map((row, index) => `
                <div class="legend-item">
                    <div class="legend-color" style="background-color:${getAgentColor(index, row.name)}"></div>
                    <span>${escapeHtml(row.name)}</span>
                </div>
            `).join('')}
            ${hiddenCount > 0 ? `<div class="legend-item"><span>+${hiddenCount} more</span></div>` : ''}
        `;
    }

    function renderAgentChart(agentData) {
        const canvas = document.getElementById('agentChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const chartRows = (agentData?.agents || []).slice(0, 8);
        const useMissedSeries = STATE.selectedAgentChartType === 'missed';

        if (!chartRows.length) {
            if (STATE.agentLineChart) {
                STATE.agentLineChart.data.labels = agentData?.labels || [];
                STATE.agentLineChart.data.datasets = [];
                STATE.agentLineChart.update();
            }
            renderAgentLegend([]);
            return;
        }

        const datasets = chartRows.map((row, index) => {
            const color = getAgentColor(index, row.name);
            return {
                label: row.name,
                data: useMissedSeries ? row.chartMissed : row.chartVolume,
                borderColor: color,
                backgroundColor: makeGradient(ctx, color),
                tension: 0.35,
                pointRadius: 2,
                pointHoverRadius: 4,
                borderWidth: 2,
                fill: false
            };
        });

        if (!STATE.agentLineChart) {
            STATE.agentLineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: agentData?.labels || [],
                    datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 3.5,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    scales: {
                        x: { grid: { display: false } },
                        y: {
                            beginAtZero: true,
                            max: 60,
                            ticks: { stepSize: 15 },
                            grid: { color: '#eee' }
                        }
                    }
                }
            });
        } else {
            STATE.agentLineChart.data.labels = agentData?.labels || [];
            STATE.agentLineChart.data.datasets = datasets;
            STATE.agentLineChart.update();
        }

        renderAgentLegend(chartRows);
    }

    function renderAgentPage(agentData, prevAgentData) {
        const rows = agentData?.agents || [];
        const prevRows = prevAgentData?.agents || [];
        renderAgentChart(agentData);
        renderAgentRankings(rows, prevRows);
        renderAgentTable(rows);
    }

    function setAgentLoadingState(message = 'Loading agent data...') {
        const tbody = document.getElementById('agentTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">${escapeHtml(message)}</td></tr>`;
        }

        ['rankHighestChats', 'rankLowestMissed', 'rankHighestRate', 'rankFastest'].forEach((id) => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `<div class="ranking-placeholder">${escapeHtml(message)}</div>`;
            }
        });
    }

    function rebuildAgentDataFromRaw() {
        const raw = STATE.agentRawContext;
        if (!raw) return;

        STATE.agentData = computeAgentMetrics(
            raw.messages,
            raw.assignmentContext,
            STATE.selectedAgentChannel,
            raw.startDate,
            raw.endDate
        );
        STATE.agentPrevData = computeAgentMetrics(
            raw.prevMessages,
            raw.assignmentContext,
            STATE.selectedAgentChannel,
            raw.prevStartDate,
            raw.prevEndDate
        );
        renderAgentPage(STATE.agentData, STATE.agentPrevData);
    }

    async function loadAgentData() {
        setAgentLoadingState();

        try {
            const [assignments, teamMembers, rootData] = await Promise.all([
                fetchChatAssignments(),
                fetchTeamMembers(),
                fetchFirebaseRootData()
            ]);

            const membersById = buildTeamMemberMap(teamMembers);
            const assignmentContext = normalizeAssignments(assignments, membersById);

            const { startDate, endDate } = getDateRangeBounds(STATE.selectedAgentDateRange);
            const messages = rootData ? extractFirebaseMessages(rootData, startDate, endDate) : [];

            const prev = getPreviousPeriodBounds(startDate, endDate);
            const prevMessages = rootData ? extractFirebaseMessages(rootData, prev.startDate, prev.endDate) : [];

            STATE.agentRawContext = {
                assignmentContext,
                messages,
                startDate,
                endDate,
                prevMessages,
                prevStartDate: prev.startDate,
                prevEndDate: prev.endDate
            };

            rebuildAgentDataFromRaw();
        } catch (error) {
            console.error('Agent analytics: failed to load data', error);
            setAgentLoadingState('Failed to load agent data');
        }
    }

    function bindAgentEvents() {
        const dateRangeSelect = document.getElementById('agentDateRange');
        const channelFilterSelect = document.getElementById('agentChannelFilter');
        const searchInput = document.getElementById('agentSearchInput');

        if (dateRangeSelect) {
            dateRangeSelect.value = STATE.selectedAgentDateRange;
            dateRangeSelect.addEventListener('change', async (event) => {
                STATE.selectedAgentDateRange = event.target.value || 'last_7_days';
                await loadAgentData();
            });
        }

        if (channelFilterSelect) {
            channelFilterSelect.value = STATE.selectedAgentChannel;
            channelFilterSelect.addEventListener('change', (event) => {
                STATE.selectedAgentChannel = event.target.value || 'all';
                STATE.agentPage = 1;
                rebuildAgentDataFromRaw();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (event) => {
                STATE.selectedAgentSearch = safeText(event.target.value).toLowerCase();
                STATE.agentPage = 1;
                if (STATE.agentData) {
                    renderAgentTable(STATE.agentData.agents || []);
                }
            });
        }

        document.querySelectorAll('.tabs .tab[data-agent-chart]').forEach((button) => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tabs .tab[data-agent-chart]').forEach((tab) => tab.classList.remove('active'));
                button.classList.add('active');
                STATE.selectedAgentChartType = button.dataset.agentChart || 'volume';

                if (STATE.agentData) {
                    renderAgentChart(STATE.agentData);
                }
            });
        });
    }

    function normalizeLabelPayload(data) {
        const summaryLabels = Array.isArray(data?.labelSummary?.labels) ? data.labelSummary.labels : [];
        const fallbackLabels = Array.isArray(data?.chartData?.labels) ? data.chartData.labels : [];
        const fallbackCounts = Array.isArray(data?.chartData?.counts) ? data.chartData.counts : [];
        const fallbackColors = Array.isArray(data?.chartData?.colors) ? data.chartData.colors : [];

        const labels = summaryLabels.length
            ? summaryLabels
                .map((item, index) => ({
                    id: item?.id ?? null,
                    name: safeText(item?.name, `Label ${index + 1}`),
                    count: toNumber(item?.count),
                    color: safeText(item?.color, fallbackColors[index] || '#4e73df')
                }))
            : fallbackLabels.map((name, index) => ({
                id: null,
                name: safeText(name, `Label ${index + 1}`),
                count: toNumber(fallbackCounts[index]),
                color: safeText(fallbackColors[index], '#4e73df')
            }));

        labels.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

        return {
            labels,
            totalUsage: labels.reduce((sum, item) => sum + toNumber(item.count), 0)
        };
    }

    function createLabelDistributionChart(labelRows) {
        const canvas = document.getElementById('labelDistributionChart');
        if (!canvas) return;

        const hasRows = Array.isArray(labelRows) && labelRows.length > 0;
        const names = hasRows ? labelRows.map((item) => item.name) : ['No labels'];
        const countsRaw = hasRows ? labelRows.map((item) => toNumber(item.count)) : [0];
        const totalRaw = countsRaw.reduce((sum, n) => sum + toNumber(n), 0);
        const counts = totalRaw > 0 ? countsRaw : [1];
        const colors = totalRaw > 0 ? labelRows.map((item) => item.color || '#4e73df') : ['#e5e7eb'];

        if (window.ChartDataLabels && Chart.register) {
            Chart.register(ChartDataLabels);
        }

        if (STATE.labelChart) {
            STATE.labelChart.data.labels = names;
            STATE.labelChart.data.datasets[0].data = counts;
            STATE.labelChart.data.datasets[0].backgroundColor = colors;
            STATE.labelChart.update();
            return;
        }

        STATE.labelChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: names,
                datasets: [{ data: counts, backgroundColor: colors, borderWidth: 0, borderRadius: 4 }]
            },
            options: {
                cutout: '70%',
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        color: '#ffffff',
                        font: { weight: '600', size: 14 },
                        formatter: (value, context) => {
                            if (toNumber(STATE.labelData?.totalUsage) <= 0) return '';
                            const series = context.chart.data.datasets[0].data || [];
                            const total = series.reduce((sum, n) => sum + toNumber(n), 0);
                            if (!total) return '';
                            return `${Math.round((toNumber(value) / total) * 100)}%`;
                        }
                    }
                }
            }
        });
    }

    function renderLabelLegend(labelRows, totalUsage) {
        const container = document.getElementById('labelLegendList');
        if (!container) return;

        if (!Array.isArray(labelRows) || labelRows.length === 0) {
            container.innerHTML = '<div class="legend-value">No labels yet. Add labels from the message page first.</div>';
            return;
        }

        container.innerHTML = labelRows.map((row) => {
            const count = toNumber(row.count);
            const percent = totalUsage > 0 ? ((count / totalUsage) * 100) : 0;
            return `
                <div class="label-legend-item">
                    <div class="legend-color" style="background-color: ${escapeHtml(row.color || '#4e73df')}"></div>
                    <div class="legend-info">
                        <div class="legend-name">${escapeHtml(row.name)}</div>
                        <div class="legend-value">${count.toLocaleString()} Chats (${percent.toFixed(1)}%)</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderLabelTable(labelRows, totalUsage) {
        const tbody = document.getElementById('labelTableBody');
        if (!tbody) return;

        const search = STATE.selectedLabelSearch;
        const rows = (Array.isArray(labelRows) ? labelRows : []).filter((row) => {
            if (!search) return true;
            return safeText(row.name).toLowerCase().includes(search);
        });

        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No matching labels</td></tr>';
            renderPagination('labelPagination', 1, 1, () => {});
            return;
        }

        const totalPages = Math.ceil(rows.length / ROWS_PER_PAGE);
        STATE.labelPage = Math.max(1, Math.min(STATE.labelPage, totalPages));
        const pageRows = rows.slice((STATE.labelPage - 1) * ROWS_PER_PAGE, STATE.labelPage * ROWS_PER_PAGE);

        tbody.innerHTML = pageRows.map((row) => {
            const count = toNumber(row.count);
            const percent = totalUsage > 0 ? ((count / totalUsage) * 100) : 0;
            return `
                <tr>
                    <td>
                        <div class="label-info">
                            <div class="label-color" style="background-color: ${escapeHtml(row.color || '#4e73df')}"></div>
                            <span class="label-name">${escapeHtml(row.name)}</span>
                        </div>
                    </td>
                    <td>${count.toLocaleString()}</td>
                    <td>${percent.toFixed(1)}%</td>
                    <td class="label-actions">-</td>
                </tr>
            `;
        }).join('');

        renderPagination('labelPagination', STATE.labelPage, totalPages, (p) => {
            STATE.labelPage = p;
            renderLabelTable(labelRows, totalUsage);
        });
    }

    function renderLabelPage(data) {
        const normalized = normalizeLabelPayload(data || {});
        STATE.labelData = normalized;

        createLabelDistributionChart(normalized.labels);
        renderLabelLegend(normalized.labels, normalized.totalUsage);
        renderLabelTable(normalized.labels, normalized.totalUsage);
    }

    function bindLabelEvents() {
        const searchInput = document.getElementById('labelSearchInput');
        if (!searchInput) return;

        searchInput.addEventListener('input', (event) => {
            STATE.selectedLabelSearch = safeText(event.target.value).toLowerCase();
            STATE.labelPage = 1;
            if (!STATE.labelData) return;
            renderLabelTable(STATE.labelData.labels, STATE.labelData.totalUsage);
        });
    }

    async function loadLabelData() {
        const data = await fetchAnalyticsData('label');
        if (!data || !data.success) {
            renderLabelPage({ labelSummary: { labels: [] }, chartData: { labels: [], counts: [], colors: [] } });
            return;
        }

        renderLabelPage(data);
    }

    async function initPage() {
        if (typeof window.lucide !== 'undefined') {
            window.lucide.createIcons();
        }

        if (isChatPage()) {
            bindChatEvents();
            await loadChatData();
            return;
        }

        if (isAgentPage()) {
            bindAgentEvents();
            await loadAgentData();
            return;
        }

        if (isLabelPage()) {
            bindLabelEvents();
            await loadLabelData();
        }
    }

    document.addEventListener('DOMContentLoaded', initPage);
})();
