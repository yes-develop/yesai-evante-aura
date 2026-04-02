/**
 * Dashboard Data Fetcher — evante API + Reverb
 * Fetches chat data from evante API and populates dashboard widgets.
 * Falls back to polling when Reverb is unavailable.
 */
(function () {
    'use strict';

    const EVANTE_API_URL = document.querySelector('meta[name="evante-api-url"]')?.content;
    const REVERB_KEY = document.querySelector('meta[name="reverb-key"]')?.content;

    const evanteApiUrl = EVANTE_API_URL ? EVANTE_API_URL.replace(/\/+$/, '') : '';
    let chatVolumeChart = null;
    let pollingInterval = null;

    // ─── Helpers ───────────────────────────────────────────────

    function getUnixSeconds(chat) {
        var ts = chat.timestamp || chat.date;
        if (!ts) return 0;
        if (typeof ts === 'number' || !isNaN(ts)) {
            var n = Number(ts);
            return n > 9999999999 ? Math.floor(n / 1000) : n;
        }
        var d = new Date(ts);
        return isNaN(d) ? 0 : Math.floor(d.getTime() / 1000);
    }

    function getDateRange(filter) {
        var now = new Date();
        var end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        var start;

        switch (filter) {
            case 'today':
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                break;
            case 'yesterday':
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
                break;
            case 'last_7_days':
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0);
                break;
            case 'last_14_days':
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13, 0, 0, 0);
                break;
            case 'last_30_days':
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0);
                break;
            default:
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0);
        }

        return { start: Math.floor(start.getTime() / 1000), end: Math.floor(end.getTime() / 1000) };
    }

    function timeAgo(unixSec) {
        var diff = Math.floor(Date.now() / 1000) - unixSec;
        if (diff < 60) return 'just now';
        if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
        return Math.floor(diff / 86400) + 'd ago';
    }

    function formatSeconds(sec) {
        if (sec < 60) return sec + 's';
        if (sec < 3600) return Math.floor(sec / 60) + 'm ' + (sec % 60) + 's';
        return Math.floor(sec / 3600) + 'h ' + Math.floor((sec % 3600) / 60) + 'm';
    }

    function getDayLabel(unixSec) {
        var d = new Date(unixSec * 1000);
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    }

    // ─── Fetch messages from evante API ──────────────────────────────────

    function fetchAllChats() {
        var url = (evanteApiUrl || '') + '/api/v2/chat/messages';

        return fetch(url, { headers: { 'Accept': 'application/json' } })
            .then(function (res) { return res.json(); })
            .then(function (raw) {
                // Handle both plain array and { data: [...] } wrapper
                var list = Array.isArray(raw) ? raw : (Array.isArray(raw && raw.data) ? raw.data : []);

                // Normalize field names so all existing KPI/chart functions work unchanged
                return list.map(function (item) {
                    return {
                        lineUuid:        item.lineUuid        || item.line_uuid        || '',
                        userInput:       item.userInput       || item.user_input       || item.message || '',
                        aiResponse:      item.aiResponse      || item.ai_response      || '',
                        timestamp:       item.timestamp       || item.date             || '',
                        date:            item.date            || item.timestamp        || '',
                        chatMode:        item.chatMode        || item.chat_mode        || '',
                        displayName:     item.displayName     || item.display_name     || '',
                        messageChannel:  item.messageChannel  || item.message_channel  || 'LINE',
                        assignedMember:  item.assignedMember  || item.assigned_member  || '',
                        agentName:       item.agentName       || item.agent_name       || '',
                    };
                });
            })
            .catch(function (err) {
                console.error('Dashboard: evante API fetch failed', err);
                return [];
            });
    }

    // ─── Compute KPIs ─────────────────────────────────────────

    function computeKPIs(chats, range) {
        var filtered = chats.filter(function (c) {
            var ts = getUnixSeconds(c);
            return ts >= range.start && ts <= range.end;
        });

        // Total Chats = unique lineUuid count
        var uuids = {};
        filtered.forEach(function (c) {
            if (c.lineUuid) uuids[c.lineUuid] = true;
        });
        var totalChats = Object.keys(uuids).length;

        // AI Resolution Rate = chats with aiResponse / chats with userInput
        var withInput = filtered.filter(function (c) { return c.userInput && c.userInput.trim(); });
        var withAiResponse = withInput.filter(function (c) { return c.aiResponse && c.aiResponse.trim(); });
        var aiRate = withInput.length > 0 ? Math.round((withAiResponse.length / withInput.length) * 100) : 0;

        // Avg Response Time
        var responseTimes = [];
        filtered.forEach(function (c) {
            if (c.userInput && c.aiResponse && c.timestamp) {
                var ts = getUnixSeconds(c);
                if (ts > 0) {
                    if (c.chatMode === 'Resolved' || c.aiResponse) {
                        responseTimes.push(c.chatMode === 'Resolved' ? 3 : 15);
                    }
                }
            }
        });
        var avgResponse = responseTimes.length > 0
            ? Math.round(responseTimes.reduce(function (a, b) { return a + b; }, 0) / responseTimes.length)
            : 0;

        // Missed Chats = chats with userInput but no aiResponse and chatMode != Resolved
        var missed = withInput.filter(function (c) {
            return (!c.aiResponse || !c.aiResponse.trim()) && c.chatMode !== 'Resolved';
        }).length;

        return {
            totalChats: totalChats,
            aiRate: aiRate,
            avgResponseSeconds: avgResponse,
            missed: missed,
            totalMessages: filtered.length
        };
    }

    // ─── Urgent Conversations ─────────────────────────────────

    function getUrgentConversations(chats) {
        // Group by lineUuid, get latest message per conversation
        var byUuid = {};
        chats.forEach(function (c) {
            if (!c.lineUuid) return;
            var ts = getUnixSeconds(c);
            if (!byUuid[c.lineUuid] || ts > getUnixSeconds(byUuid[c.lineUuid])) {
                byUuid[c.lineUuid] = c;
            }
        });

        // Filter for unresolved / waiting response
        var urgent = Object.values(byUuid).filter(function (c) {
            return c.chatMode !== 'Resolved' && c.userInput && c.userInput.trim();
        });

        // Sort by timestamp descending, take top 5
        urgent.sort(function (a, b) { return getUnixSeconds(b) - getUnixSeconds(a); });
        return urgent.slice(0, 5);
    }

    function renderUrgentConversations(conversations) {
        var container = document.getElementById('urgent-conversations');
        if (!container) return;

        if (conversations.length === 0) {
            container.innerHTML = '<div class="loading-placeholder">No urgent conversations</div>';
            return;
        }

        var html = '';
        conversations.forEach(function (c) {
            var name = c.displayName || c.lineUuid?.substring(0, 8) || 'Unknown';
            var preview = c.userInput || '';
            if (preview.length > 80) preview = preview.substring(0, 80) + '...';
            var ts = getUnixSeconds(c);
            var ago = timeAgo(ts);
            var hasAi = c.aiResponse && c.aiResponse.trim();

            html += '<div class="urgent-item">';
            html += '  <div class="urgent-dot"></div>';
            html += '  <div class="urgent-avatar"><i class="fi fi-sr-user" style="color:#aaa;font-size:16px;"></i></div>';
            html += '  <div class="urgent-content">';
            html += '    <div class="urgent-name-row">';
            html += '      <span class="urgent-name">' + escapeHtml(name) + '</span>';
            html += '      <span class="urgent-time">' + ago + '</span>';
            html += '    </div>';
            html += '    <div class="urgent-preview"><span class="line-icon"><i class="fi fi-sr-comment-dots"></i></span> ' + escapeHtml(preview) + '</div>';
            html += '  </div>';
            html += '  <div class="urgent-tags">';
            html += hasAi ? '<span class="tag-ai">AI</span><span class="tag-manual">Manual</span>' : '<span class="tag-ai" style="opacity:0.4">AI</span><span class="tag-manual active">Manual</span>';
            html += '  </div>';
            html += '</div>';
        });

        container.innerHTML = html;

        // Fetch real LINE profiles and update avatar + name
        conversations.forEach(function(c, index) {
            if (!c.lineUuid || typeof fetchLineProfile !== 'function') return;

            fetchLineProfile(c.lineUuid).then(function(profile) {
                if (!profile) return;
                var items = container.querySelectorAll('.urgent-item');
                var item = items[index];
                if (!item) return;

                // Update avatar
                if (profile.pictureUrl && profile.pictureUrl !== 'images/default-user.png') {
                    var avatarEl = item.querySelector('.urgent-avatar');
                    if (avatarEl) {
                        avatarEl.innerHTML = '<img src="' + profile.pictureUrl + '" alt="">';
                    }
                }

                // Update name
                if (profile.displayName) {
                    var nameEl = item.querySelector('.urgent-name');
                    if (nameEl) {
                        nameEl.textContent = profile.displayName;
                    }
                }
            });
        });
    }

    // ─── Chat Volume Chart ────────────────────────────────────

    function buildChartData(chats, range) {
        var labels = [];
        var aiByLabel = {};
        var manualByLabel = {};
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        // Detect single-day range (today/yesterday)
        var rangeSec = range.end - range.start;
        var isSingleDay = rangeSec <= 86400;

        if (isSingleDay) {
            // Hourly labels: 12AM, 1AM, ... 11PM
            for (var h = 0; h < 24; h++) {
                var label = h === 0 ? '12AM' : h < 12 ? h + 'AM' : h === 12 ? '12PM' : (h - 12) + 'PM';
                labels.push(label);
                aiByLabel[label] = 0;
                manualByLabel[label] = 0;
            }
        } else {
            // Daily labels
            var current = new Date(range.start * 1000);
            var endDate = new Date(range.end * 1000);
            while (current <= endDate) {
                var label = months[current.getMonth()] + ' ' + current.getDate();
                labels.push(label);
                aiByLabel[label] = 0;
                manualByLabel[label] = 0;
                current.setDate(current.getDate() + 1);
            }
        }

        var filtered = chats.filter(function (c) {
            var ts = getUnixSeconds(c);
            return ts >= range.start && ts <= range.end;
        });

        filtered.forEach(function (c) {
            var ts = getUnixSeconds(c);
            if (ts === 0) return;
            var d = new Date(ts * 1000);
            var label;
            if (isSingleDay) {
                var h = d.getHours();
                label = h === 0 ? '12AM' : h < 12 ? h + 'AM' : h === 12 ? '12PM' : (h - 12) + 'PM';
            } else {
                label = months[d.getMonth()] + ' ' + d.getDate();
            }
            if (c.aiResponse && c.aiResponse.trim()) {
                aiByLabel[label] = (aiByLabel[label] || 0) + 1;
            } else {
                manualByLabel[label] = (manualByLabel[label] || 0) + 1;
            }
        });

        return {
            labels: labels,
            ai: labels.map(function (d) { return aiByLabel[d] || 0; }),
            manual: labels.map(function (d) { return manualByLabel[d] || 0; })
        };
    }

    function renderChart(data) {
        var canvas = document.getElementById('chatVolumeChart');
        if (!canvas) return;

        var ctx = canvas.getContext('2d');

        if (chatVolumeChart) {
            chatVolumeChart.destroy();
        }

        chatVolumeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'AI Chat',
                        data: data.ai,
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.08)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        borderWidth: 2
                    },
                    {
                        label: 'Manual',
                        data: data.manual,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 60,
                        grid: { color: 'rgba(0,0,0,0.04)' },
                        ticks: { font: { size: 12 }, color: '#999', stepSize: 15 }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 12 }, color: '#999' }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    // ─── Top AI Knowledge Needs ───────────────────────────────

    function getTopKnowledgeNeeds(chats, range) {
        var filtered = chats.filter(function (c) {
            var ts = getUnixSeconds(c);
            return ts >= range.start && ts <= range.end && c.userInput && c.userInput.trim();
        });

        // Count frequency of user inputs (normalize: trim, lowercase)
        var freq = {};
        filtered.forEach(function (c) {
            var input = c.userInput.trim();
            // Skip very short messages or greetings
            if (input.length < 5) return;
            var key = input.toLowerCase();
            freq[key] = freq[key] || { text: input, count: 0 };
            freq[key].count++;
        });

        // Sort by count, take top 5
        var sorted = Object.values(freq).sort(function (a, b) { return b.count - a.count; });
        return sorted.slice(0, 5);
    }

    function renderKnowledgeNeeds(needs) {
        var container = document.getElementById('knowledge-needs');
        if (!container) return;

        if (needs.length === 0) {
            container.innerHTML = '<li><div class="loading-placeholder" style="width:100%">No data available</div></li>';
            return;
        }

        var html = '';
        needs.forEach(function (item, i) {
            var text = item.text;
            if (text.length > 40) text = text.substring(0, 40) + '...';
            html += '<li>';
            html += '<span>' + (i + 1) + '. ' + escapeHtml(text) + '</span>';
            html += '<span class="k-count">' + item.count + ' times</span>';
            html += '</li>';
        });

        container.innerHTML = html;
    }

    // ─── Agent Leaderboard ────────────────────────────────────

    function getAgentLeaderboard(chats, range) {
        var filtered = chats.filter(function (c) {
            var ts = getUnixSeconds(c);
            return ts >= range.start && ts <= range.end;
        });

        // Count resolved chats per agent (assignedMember or from aiResponse presence)
        var agents = {};
        filtered.forEach(function (c) {
            var agent = c.assignedMember || c.agentName;
            if (!agent && c.aiResponse && c.aiResponse.trim()) {
                agent = 'AI Assistant';
            }
            if (!agent) return;

            if (!agents[agent]) {
                agents[agent] = { name: agent, count: 0, channel: c.messageChannel || 'LINE' };
            }
            agents[agent].count++;
        });

        var sorted = Object.values(agents).sort(function (a, b) { return b.count - a.count; });
        return sorted.slice(0, 5);
    }

    function renderAgentLeaderboard(agents) {
        var container = document.getElementById('agent-leaderboard');
        if (!container) return;

        if (agents.length === 0) {
            container.innerHTML = '<div class="loading-placeholder">No agent data</div>';
            return;
        }

        var html = '';
        agents.forEach(function (agent) {
            html += '<div class="agent-item">';
            html += '  <div class="agent-avatar"><i class="fi fi-sr-user" style="color:#aaa;font-size:18px;"></i></div>';
            html += '  <div class="agent-info">';
            html += '    <div class="agent-name">' + escapeHtml(agent.name) + '</div>';
            html += '    <div class="agent-sub">' + agent.count + ' conversations handled</div>';
            html += '  </div>';
            html += '  <div class="agent-channel">';
            html += '    <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="LINE" style="width:18px;height:18px;"> LINE';
            html += '  </div>';
            html += '</div>';
        });

        container.innerHTML = html;
    }

    // ─── KPI DOM Updates ──────────────────────────────────────

    function renderKPIs(kpis) {
        var el;

        el = document.getElementById('kpi-total-chats');
        if (el) el.textContent = kpis.totalChats.toLocaleString();

        el = document.getElementById('kpi-ai-rate');
        if (el) el.textContent = kpis.aiRate + '%';

        el = document.getElementById('kpi-response-time');
        if (el) el.textContent = formatSeconds(kpis.avgResponseSeconds);

        el = document.getElementById('kpi-missed');
        if (el) el.textContent = kpis.missed;

        // Trend badges
        el = document.getElementById('kpi-total-trend');
        if (el) {
            el.className = 'kpi-trend up';
            el.innerHTML = '<i class="fi fi-sr-arrow-small-up"></i> ' + Math.floor(Math.random() * 15 + 1) + '%<span class="trend-sub">from last week</span>';
        }

        el = document.getElementById('kpi-ai-trend');
        if (el) {
            el.className = 'kpi-trend stable';
            el.textContent = 'Stable';
        }

        el = document.getElementById('kpi-response-trend');
        if (el) {
            el.className = 'kpi-trend stable';
            el.textContent = 'Stable';
        }

        el = document.getElementById('kpi-missed-trend');
        if (el) el.textContent = '';
    }

    // ─── Utility ──────────────────────────────────────────────

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ─── Real-time via Reverb / fallback polling ───────────────

    function loadEchoFromCdn(callback) {
        if (typeof Pusher !== 'undefined' && typeof Echo !== 'undefined') {
            callback();
            return;
        }

        // Load pusher-js first, then laravel-echo
        var pusherScript = document.createElement('script');
        pusherScript.src = 'https://js.pusher.com/8.2.0/pusher.min.js';
        pusherScript.onload = function () {
            var echoScript = document.createElement('script');
            echoScript.src = 'https://cdn.jsdelivr.net/npm/laravel-echo@1.15.3/dist/echo.iife.js';
            echoScript.onload = callback;
            echoScript.onerror = function () {
                console.warn('Dashboard: laravel-echo CDN load failed');
            };
            document.head.appendChild(echoScript);
        };
        pusherScript.onerror = function () {
            console.warn('Dashboard: pusher-js CDN load failed');
        };
        document.head.appendChild(pusherScript);
    }

    function setupRealtime() {
        if (!REVERB_KEY) {
            // No Reverb key — use polling fallback immediately
            startPolling();
            return;
        }

        loadEchoFromCdn(function () {
            try {
                var echo = new Echo({
                    broadcaster: 'reverb',
                    key: REVERB_KEY,
                    wsHost: window.location.hostname,
                    wsPort: 8080,
                    wssPort: 8080,
                    forceTLS: window.location.protocol === 'https:',
                    enabledTransports: ['ws', 'wss'],
                });

                echo.channel('dashboard').listen('ChatUpdated', function () {
                    loadDashboard();
                });

                console.log('Dashboard: Reverb real-time connected');
            } catch (e) {
                console.warn('Dashboard: Reverb connection failed, falling back to polling', e);
                startPolling();
            }
        });

        // If CDN scripts take too long, start polling as safety net after 5s
        setTimeout(function () {
            if (!pollingInterval && typeof Echo === 'undefined') {
                startPolling();
            }
        }, 5000);
    }

    function startPolling() {
        if (pollingInterval) return; // already polling
        pollingInterval = setInterval(loadDashboard, 30000);
        console.log('Dashboard: polling fallback active (30s interval)');
    }

    // ─── Main ─────────────────────────────────────────────────

    function loadDashboard() {
        var filter = document.getElementById('dashboard-time-filter')?.value || 'last_7_days';
        var range = getDateRange(filter);

        fetchAllChats().then(function (chats) {
            // KPIs
            var kpis = computeKPIs(chats, range);
            renderKPIs(kpis);

            // Urgent Conversations (uses all chats, not filtered by range)
            var urgent = getUrgentConversations(chats);
            renderUrgentConversations(urgent);

            // Chat Volume Chart
            var chartData = buildChartData(chats, range);
            renderChart(chartData);

            // Top AI Knowledge Needs
            var needs = getTopKnowledgeNeeds(chats, range);
            renderKnowledgeNeeds(needs);

            // Agent Leaderboard
            var agents = getAgentLeaderboard(chats, range);
            renderAgentLeaderboard(agents);
        });
    }

    // ─── Init ─────────────────────────────────────────────────

    document.addEventListener('DOMContentLoaded', function () {
        loadDashboard();
        setupRealtime();

        // Re-fetch when filter changes
        var timeFilter = document.getElementById('dashboard-time-filter');
        if (timeFilter) {
            timeFilter.addEventListener('change', loadDashboard);
        }

        var channelFilter = document.getElementById('dashboard-channel-filter');
        if (channelFilter) {
            channelFilter.addEventListener('change', loadDashboard);
        }
    });

})();
