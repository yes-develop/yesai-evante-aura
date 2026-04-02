@extends('layouts.app')

@section('title', 'SONA Call Flow')

@section('content')
<div style="display: grid; grid-template-columns: 300px 1fr; gap: 1rem; height: calc(100vh - 230px); min-height: 560px; overflow: hidden;">

    {{-- Left: Call List --}}
    <div style="background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; display: flex; flex-direction: column; overflow: hidden;">
        <div style="padding: 1.1rem 1.25rem 0.75rem; border-bottom: 1px solid #f3f4f6;">
            <h3 style="font-size: 1rem; font-weight: 700; color: #111827; margin: 0;">Call Flow</h3>
        </div>
        <div style="overflow-y: auto; flex: 1;">
            @forelse($calls as $c)
            @php
            $isActive = $selectedCall && $selectedCall->id === $c->id;
            $badgeColor = match($c->status) {
                'completed' => '#16a34a',
                'no-answer' => '#d97706',
                'failed'    => '#dc2626',
                default     => '#9ca3af',
            };
            @endphp
            <a href="{{ route('sona.callFlow') }}?call={{ $c->id }}"
               style="display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1.25rem; text-decoration: none; border-bottom: 1px solid #f9fafb;
                      {{ $isActive ? 'background: #f0fdf4;' : '' }}">
                <img src="https://ui-avatars.com/api/?name={{ urlencode($c->customer_name ?? 'Unknown') }}&background=e0e0e0&color=999&size=36"
                     alt="" style="width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;">
                <div style="min-width: 0; flex: 1;">
                    <div style="font-size: 0.87rem; font-weight: {{ $isActive ? '700' : '600' }}; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        {{ $c->customer_name ?? $c->phone_number ?? 'Unknown' }}
                    </div>
                    <div style="font-size: 0.75rem; color: #9ca3af;">{{ $c->started_at?->format('M d, H:i') ?? '—' }}</div>
                </div>
                <span style="width: 8px; height: 8px; border-radius: 50%; background: {{ $badgeColor }}; flex-shrink: 0;"></span>
            </a>
            @empty
            <div style="padding: 2rem 1.25rem; text-align: center; color: #9ca3af; font-size: 0.88rem;">No calls found.</div>
            @endforelse
        </div>
    </div>

    {{-- Right: Transcript Timeline --}}
    <div style="background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; display: flex; flex-direction: column; overflow: hidden;">

        @if($selectedCall)

        {{-- Call Header --}}
        <div style="padding: 1.1rem 1.5rem; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 1rem;">
            <img src="https://ui-avatars.com/api/?name={{ urlencode($selectedCall->customer_name ?? 'Unknown') }}&background=e0e0e0&color=999&size=44"
                 alt="" style="width: 44px; height: 44px; border-radius: 50%;">
            <div style="flex: 1;">
                <div style="font-size: 1rem; font-weight: 700; color: #111827;">
                    {{ $selectedCall->customer_name ?? $selectedCall->phone_number ?? 'Unknown' }}
                </div>
                <div style="font-size: 0.8rem; color: #9ca3af;">
                    {{ $selectedCall->started_at?->format('D, M d Y · H:i') ?? '—' }}
                    @if($selectedCall->duration_seconds)
                    · <span>{{ $selectedCall->formatted_duration }}</span>
                    @endif
                </div>
            </div>
            {{-- Status badge --}}
            @php
            $sb = match($selectedCall->status) {
                'completed' => ['bg' => '#dcfce7', 'txt' => '#16a34a'],
                'no-answer' => ['bg' => '#fef9c3', 'txt' => '#854d0e'],
                'failed'    => ['bg' => '#fee2e2', 'txt' => '#dc2626'],
                default     => ['bg' => '#f3f4f6', 'txt' => '#6b7280'],
            };
            @endphp
            <span style="font-size: 0.78rem; font-weight: 600; padding: 4px 12px; border-radius: 99px; background: {{ $sb['bg'] }}; color: {{ $sb['txt'] }};">
                {{ ucfirst($selectedCall->status ?? '—') }}
            </span>
            @if($selectedCall->sentiment)
            @php
            $sc = match($selectedCall->sentiment) {
                'positive' => ['bg' => '#f0fdf4', 'txt' => '#16a34a', 'icon' => 'fa-face-smile'],
                'negative' => ['bg' => '#fee2e2', 'txt' => '#dc2626', 'icon' => 'fa-face-frown'],
                default    => ['bg' => '#f9fafb', 'txt' => '#6b7280', 'icon' => 'fa-face-meh'],
            };
            @endphp
            <span style="font-size: 0.78rem; font-weight: 600; padding: 4px 12px; border-radius: 99px; background: {{ $sc['bg'] }}; color: {{ $sc['txt'] }}; display: flex; align-items: center; gap: 4px;">
                <i class="fas {{ $sc['icon'] }}" style="font-size: 0.85rem;"></i>
                {{ ucfirst($selectedCall->sentiment) }}
            </span>
            @endif
        </div>

        {{-- Summary --}}
        @if($selectedCall->summary)
        <div style="padding: 0.85rem 1.5rem; background: #f9fafb; border-bottom: 1px solid #f3f4f6;">
            <span style="font-size: 0.8rem; font-weight: 600; color: #374151; margin-right: 0.5rem;">Summary:</span>
            <span style="font-size: 0.82rem; color: #6b7280;">{{ $selectedCall->summary }}</span>
        </div>
        @endif

        {{-- Transcript Timeline --}}
        <div style="flex: 1; overflow-y: auto; padding: 1.5rem;">
            @if($selectedCall->transcripts->count())
            <div style="display: flex; flex-direction: column; gap: 0;">
                @foreach($selectedCall->transcripts as $t)
                @php $isAgent = strtolower($t->speaker) === 'agent' || strtolower($t->speaker) === 'bot'; @endphp
                <div style="display: flex; {{ $isAgent ? '' : 'flex-direction: row-reverse;' }} align-items: flex-end; gap: 0.6rem; margin-bottom: 1rem;">
                    {{-- Avatar --}}
                    <div style="width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
                                background: {{ $isAgent ? '#83FF2F' : '#e0e0e0' }}; font-size: 0.7rem; font-weight: 700; color: {{ $isAgent ? '#1a1a1a' : '#666' }};">
                        {{ $isAgent ? 'AI' : 'U' }}
                    </div>
                    {{-- Bubble --}}
                    <div style="max-width: 72%;">
                        <div style="font-size: 0.7rem; color: #9ca3af; margin-bottom: 0.25rem; {{ $isAgent ? '' : 'text-align: right;' }}">
                            {{ $isAgent ? 'Agent' : ($selectedCall->customer_name ?? 'Customer') }}
                            @if($t->timestamp_ms)
                            · {{ gmdate('i:s', intdiv($t->timestamp_ms, 1000)) }}
                            @endif
                        </div>
                        <div style="padding: 0.65rem 0.9rem; border-radius: {{ $isAgent ? '4px 14px 14px 14px' : '14px 4px 14px 14px' }};
                                    background: {{ $isAgent ? '#f0fdf4' : '#f3f4f6' }};
                                    border: 1px solid {{ $isAgent ? '#bbf7d0' : '#e5e7eb' }};
                                    font-size: 0.88rem; color: #1f2937; line-height: 1.5;">
                            {{ $t->content }}
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
            @else
            <div style="text-align: center; padding: 4rem 2rem; color: #9ca3af;">
                <i class="fas fa-comment-slash" style="font-size: 2.5rem; margin-bottom: 1rem; display: block;"></i>
                No transcript available for this call.
            </div>
            @endif
        </div>

        @else
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 1rem; color: #9ca3af;">
            <i class="fas fa-comments" style="font-size: 3rem;"></i>
            <p style="margin: 0; font-size: 0.95rem;">Select a call to view its transcript</p>
        </div>
        @endif

    </div>

</div>
@endsection
