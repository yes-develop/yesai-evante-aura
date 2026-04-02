@extends('layouts.app')

@section('title', 'SONA Inbox')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/sona-inbox.css') }}?v={{ time() }}">
@endsection

@section('content')
@php
    // Support both inbox() (list) and show() (single active call)
    $activeCall = $activeCall ?? ($call ?? $calls->first());
@endphp
<div class="sona-inbox-hub">
    {{-- Left Panel: Call List --}}
    <div class="sona-call-list">
        <div class="call-list-header">
            <h3>Call Recording</h3>
        </div>
        <div class="call-search">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Search Call..." id="callSearchInput" value="{{ request('search') }}">
        </div>
        <div class="call-list-items">
            <div class="call-item-content">
                @forelse($calls as $callItem)
                <a href="{{ route('sona.calls.show', $callItem->id) }}" style="text-decoration:none;color:inherit;">
                    <div class="call-item {{ isset($activeCall) && $activeCall->id === $callItem->id ? 'active' : '' }}"
                         data-call-id="{{ $callItem->id }}">
                        <div class="call-avatar">
                            <img src="https://ui-avatars.com/api/?name={{ urlencode($callItem->customer_name ?? 'Unknown') }}&background=e0e0e0&color=999&size=40"
                                 alt="{{ $callItem->customer_name ?? 'Unknown' }}">
                        </div>
                        <div class="call-info">
                            <span class="call-name">{{ $callItem->customer_name ?? $callItem->phone_number ?? 'Unknown' }}</span>
                            <span class="call-preview">{{ $callItem->first_transcript_preview }}</span>
                        </div>
                        <span class="call-date">{{ $callItem->started_at?->format('Y-m-d') ?? '—' }}</span>
                    </div>
                </a>
                @empty
                <div style="padding: 1.5rem; text-align:center; color:#999; font-size:.9rem;">
                    No call recordings yet.
                </div>
                @endforelse
            </div>
        </div>
    </div>

    {{-- Center Panel: Call Detail --}}
    <div class="sona-call-detail">
        <div class="call-detail-header">
            <div class="detail-caller">
                <button class="mobile-back-btn" id="mobileBackBtn" title="Back to list">
                    <i class="fas fa-arrow-left"></i>
                    <span>Back</span>
                </button>
                <div class="detail-avatar">
                    <img src="https://ui-avatars.com/api/?name={{ urlencode($activeCall->customer_name ?? 'Unknown') }}&background=e0e0e0&color=999&size=44"
                         alt="{{ $activeCall->customer_name ?? 'Unknown' }}">
                </div>
                <div class="detail-caller-info">
                    <span class="detail-name">{{ $activeCall->customer_name ?? $activeCall->phone_number ?? 'Unknown' }}</span>
                    <span class="detail-date">{{ $activeCall->started_at?->format('Y-m-d') ?? '—' }}</span>
                </div>
            </div>
            <div class="detail-actions">
                <button class="detail-action-btn" title="Phone call"><i class="fas fa-phone"></i></button>
                <button class="detail-action-btn" title="Video call"><i class="fas fa-video"></i></button>
                <button class="mobile-insights-toggle" id="insightsToggleBtn" title="Call Insights">
                    <i class="fas fa-info-circle"></i>
                </button>
            </div>
        </div>

        <div class="call-detail-body">
            {{-- Call Recording Player --}}
            <div class="recording-card">
                <h4>Call Recording</h4>
                @if($activeCall->recording_url)
                <audio id="callAudio" src="{{ $activeCall->recording_url }}" preload="metadata" style="display:none;"></audio>
                @endif
                <div class="recording-player">
                    <div class="progress-bar-container" id="progressContainer">
                        <div class="progress-bar-fill" id="progressFill" style="width: 0%;"></div>
                        <div class="progress-bar-thumb" id="progressThumb" style="left: 0%;"></div>
                    </div>
                    <div class="progress-time">
                        <span id="currentTime">0:00</span>
                        <span id="totalTime">-{{ $activeCall->formatted_duration }}</span>
                    </div>
                    <div class="player-controls">
                        <button class="player-btn" id="rewindBtn" title="Rewind"><i class="fas fa-undo"></i></button>
                        <button class="player-btn player-btn--play" id="playBtn" title="Play"><i class="fas fa-play"></i></button>
                        <button class="player-btn" id="forwardBtn" title="Forward"><i class="fas fa-redo"></i></button>
                    </div>
                </div>
            </div>

            {{-- AI Transcript --}}
            <div class="transcript-card">
                <div class="transcript-header">
                    <h4>AI Transcript</h4>
                </div>
                <div class="transcript-content">
                    <div class="call-messages">
                        @if($activeCall->started_at)
                        <div class="message-date-separator">
                            <span>{{ $activeCall->started_at->format('D, d/m') }}</span>
                        </div>
                        @endif

                        @forelse($activeCall->transcripts as $transcript)
                            @if($transcript->speaker === 'ai')
                            <div class="message-row message-sent">
                                <span class="message-time">{{ $activeCall->started_at?->addMilliseconds($transcript->timestamp_ms ?? 0)->format('H:i') }}</span>
                                <div class="message-bubble">{{ $transcript->content }}</div>
                                <div class="message-avatar">
                                    <img src="https://ui-avatars.com/api/?name=AI&background=83FF2F&color=333&size=32" alt="AI">
                                </div>
                            </div>
                            @elseif($transcript->speaker === 'human')
                            <div class="message-row message-received">
                                <div class="message-avatar">
                                    <img src="https://ui-avatars.com/api/?name={{ urlencode($activeCall->customer_name ?? 'User') }}&background=e0e0e0&color=999&size=32"
                                         alt="{{ $activeCall->customer_name ?? 'User' }}">
                                </div>
                                <div class="message-bubble">{{ $transcript->content }}</div>
                                <span class="message-time">{{ $activeCall->started_at?->addMilliseconds($transcript->timestamp_ms ?? 0)->format('H:i') }}</span>
                            </div>
                            @else
                            <div class="message-date-separator">
                                <span>{{ $transcript->content }}</span>
                            </div>
                            @endif
                        @empty
                        <div style="padding:1rem;text-align:center;color:#999;font-size:.85rem;">No transcript available.</div>
                        @endforelse
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Right Panel: Call Insights --}}
    <div class="sona-call-insights">
        <div class="insights-tabs">
            <button class="insights-tab active" data-tab="info">Info</button>
            <button class="insights-tab" data-tab="summary">Summary</button>
        </div>
        <div class="insights-body">
            {{-- Info Tab --}}
            <div class="insights-content" id="tab-info">
                <h4>Call Insights</h4>
                <div class="insights-fields">
                    <div class="insight-field">
                        <span class="field-label">Name</span>
                        <span class="field-value">{{ $activeCall->customer_name ?? '—' }}</span>
                    </div>
                    <div class="insight-field">
                        <span class="field-label">Date & time</span>
                        <span class="field-value">{{ $activeCall->started_at?->format('M d, Y H:i') ?? '—' }}</span>
                    </div>
                    <div class="insight-field">
                        <span class="field-label">Channels</span>
                        <span class="field-value">{{ ucfirst($activeCall->direction ?? 'inbound') }} Call</span>
                    </div>
                    <div class="insight-field">
                        <span class="field-label">Duration</span>
                        <span class="field-value">{{ $activeCall->formatted_duration }}</span>
                    </div>
                    <div class="insight-field">
                        <span class="field-label">Status</span>
                        <span class="field-value">{{ ucfirst(str_replace('-', ' ', $activeCall->status ?? '—')) }}</span>
                    </div>
                    <div class="insight-field">
                        <span class="field-label">Sentiment</span>
                        @if($activeCall->sentiment)
                        <span class="field-value sentiment-{{ $activeCall->sentiment }}">
                            <span class="sentiment-dot"></span>
                            {{ ucfirst($activeCall->sentiment) }}
                        </span>
                        @else
                        <span class="field-value">—</span>
                        @endif
                    </div>
                </div>
            </div>

            {{-- Summary Tab --}}
            <div class="insights-content" id="tab-summary" style="display:none;">
                <h4>AI Summary</h4>
                <div style="padding: .5rem 0; color: #444; font-size: .9rem; line-height: 1.6;">
                    {{ $activeCall->summary ?? 'No summary available for this call.' }}
                </div>
            </div>
        </div>
        <div class="insights-actions">
            <button class="insights-btn insights-btn--share"><i class="fas fa-share-from-square"></i> Share</button>
            <button class="insights-btn insights-btn--download"><i class="fas fa-download"></i> Download</button>
        </div>
    </div>
</div>

{{-- Insights overlay (for slide-over drawer on tablet/mobile) --}}
<!-- <div class="insights-overlay" id="insightsOverlay"></div> -->

@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    var hub = document.querySelector('.sona-inbox-hub');
    var backBtn = document.getElementById('mobileBackBtn');
    var insightsToggle = document.getElementById('insightsToggleBtn');
    var insightsPanel = document.querySelector('.sona-call-insights');
    var insightsOverlay = document.getElementById('insightsOverlay');

    function isMobileView() {
        return window.innerWidth <= 768;
    }

    // --- Panel toggle: show detail panel on mobile ---
    function showDetailPanel() {
        if (isMobileView() && hub) {
            hub.classList.add('show-detail');
        }
    }

    function showListPanel() {
        if (hub) {
            hub.classList.remove('show-detail');
        }
    }

    // --- Insights drawer open/close ---
    function openInsights() {
        if (insightsPanel) insightsPanel.classList.add('insights-open');
        if (insightsOverlay) insightsOverlay.classList.add('active');
    }

    function closeInsights() {
        if (insightsPanel) insightsPanel.classList.remove('insights-open');
        if (insightsOverlay) insightsOverlay.classList.remove('active');
    }

    // Back button — return to call list
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            showListPanel();
        });
    }

    // Insights toggle
    if (insightsToggle) {
        insightsToggle.addEventListener('click', function() {
            if (insightsPanel && insightsPanel.classList.contains('insights-open')) {
                closeInsights();
            } else {
                openInsights();
            }
        });
    }

    // Close insights on overlay click
    if (insightsOverlay) {
        insightsOverlay.addEventListener('click', closeInsights);
    }

    // Tab switching (Info / Summary)
    document.querySelectorAll('.insights-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.insights-tab').forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active');
            var tabName = this.getAttribute('data-tab');
            document.querySelectorAll('.insights-content').forEach(function(c) { c.style.display = 'none'; });
            var target = document.getElementById('tab-' + tabName);
            if (target) target.style.display = '';
        });
    });

    // Call item selection — navigate to call detail page on desktop, show detail panel on mobile
    document.querySelectorAll('.call-item').forEach(function(item) {
        item.addEventListener('click', function() {
            document.querySelectorAll('.call-item').forEach(function(i) { i.classList.remove('active'); });
            this.classList.add('active');
            showDetailPanel();
        });
    });

    // Search
    var searchInput = document.getElementById('callSearchInput');
    if (searchInput) {
        var searchTimer;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimer);
            var q = this.value;
            searchTimer = setTimeout(function() {
                var url = new URL(window.location.href);
                if (q) { url.searchParams.set('search', q); } else { url.searchParams.delete('search'); }
                window.location.href = url.toString();
            }, 600);
        });
    }

    // On resize: clean up if going back to desktop
    window.addEventListener('resize', function() {
        if (!isMobileView()) {
            hub && hub.classList.remove('show-detail');
            closeInsights();
        }
    });

    // Simple audio player (if recording available)
    var audio = document.getElementById('callAudio');
    var playBtn = document.getElementById('playBtn');
    var progressFill = document.getElementById('progressFill');
    var progressThumb = document.getElementById('progressThumb');
    var currentTimeEl = document.getElementById('currentTime');

    function formatTime(s) {
        var m = Math.floor(s / 60);
        var sec = Math.floor(s % 60);
        return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    if (audio && playBtn) {
        playBtn.addEventListener('click', function() {
            if (audio.paused) {
                audio.play();
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                audio.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        });

        audio.addEventListener('timeupdate', function() {
            if (!audio.duration) return;
            var pct = (audio.currentTime / audio.duration) * 100;
            if (progressFill) progressFill.style.width = pct + '%';
            if (progressThumb) progressThumb.style.left = pct + '%';
            if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
        });

        audio.addEventListener('ended', function() {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        });
    }

    var rewindBtn = document.getElementById('rewindBtn');
    var forwardBtn = document.getElementById('forwardBtn');
    if (audio && rewindBtn) rewindBtn.addEventListener('click', function() { audio.currentTime = Math.max(0, audio.currentTime - 10); });
    if (audio && forwardBtn) forwardBtn.addEventListener('click', function() { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); });
});
</script>
@endpush
