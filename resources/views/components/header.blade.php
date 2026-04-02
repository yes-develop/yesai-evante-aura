<!-- Header Component -->
<div class="dashboard-header">
    <div class="header-title">
        <h2 class="fw-bold mb-1">@yield('page-title', 'Dashboard')</h2>
        <p class="text-muted">
            @if(auth()->user()->role == 'admin')
                @yield('page-subtitle', 'Welcome back, Admin!')
            @else
                @yield('page-subtitle', 'Welcome back, ' . auth()->user()->name . '!')
            @endif
        </p>
    </div>
    <div class="header-actions">
        <div class="user-info user-info-dropdown-toggle" data-toggle="custom-dropdown-menu" aria-expanded="false">
            @php
                use Illuminate\Support\Str;
                $user = auth()->user();
                $profileImage = $user->profile_image ?? null;
            @endphp
            @if($profileImage)
                @if(Str::startsWith($profileImage, ['http://', 'https://']))
                    <img src="{{ $profileImage }}" alt="Avatar" class="avatar rounded-circle" style="width:40px;height:40px;object-fit:cover;">
                @else
                    <img src="{{ asset('storage/' . $profileImage) }}" alt="Avatar" class="avatar rounded-circle" style="width:40px;height:40px;object-fit:cover;">
                @endif
            @else
                <div class="avatar">{{ strtoupper(mb_substr($user->name, 0, 1)) }}</div>
            @endif
            <div>
                <div class="fw-bold">{{ $user->name }}</div>
                <div class="text-muted small">{{ ucfirst($user->role) }}</div>
            </div>
        </div>
        <div class="custom-dropdown-menu">
            <a class="dropdown-item" href="{{ route('profile.show') }}">
                <i class="fas fa-user me-2"></i> Profile
            </a>
            <a class="dropdown-item" href="{{ route('logout') }}"
                onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
                <i class="fas fa-sign-out-alt me-2"></i> Logout
            </a>
        </div>
        <div class="notification-badge">
            <i class="fas fa-bell fa-lg"></i>
            <span class="notification-count">
                {{ \App\Models\Booking::where('status', 'pending')->count() }}
            </span>
        </div>
    </div>
</div> 

<style>
    .header-actions {
        position: relative;
        display: flex;
        align-items: center;
    }
    .custom-dropdown-menu {
        position: absolute;
        top: 60px; /* ปรับตามขนาด user-info */
        left: 0;
        min-width: 160px;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        z-index: 1000;
        padding: 0.5rem 0;
        display: none;
    }
    .custom-dropdown-menu.show {
        display: block;
    }
    .custom-dropdown-menu .dropdown-item {
        color: #222;
        padding: 0.75rem 1.5rem;
        text-decoration: none;
        display: flex;
        align-items: center;
        background: none;
        border: none;
        width: 100%;
        font-size: 1rem;
        transition: background 0.2s;
    }
    .custom-dropdown-menu .dropdown-item:hover {
        background: #f5f5f5;
        color: #185a9d;
    }
    .user-info.user-info-dropdown-toggle {
        cursor: pointer;
    }
</style>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const userToggle = document.querySelector('.user-info-dropdown-toggle');
        const dropdown = document.querySelector('.custom-dropdown-menu');
        if(userToggle && dropdown) {
            userToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
            document.addEventListener('click', function(e) {
                if (!dropdown.contains(e.target) && !userToggle.contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            });
        }
    });
</script>