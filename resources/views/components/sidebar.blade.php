@php
use App\Helpers\PermissionHelper;

// Fetch permissions for current role
function hasPerm($perm) {
    return \App\Helpers\PermissionHelper::hasPermission($perm);
}

$messagesActive = request()->is('messages*', 'contacts*');
$permissionsActive = request()->is('permissions*', 'role_permissions*');
$dashboardActive = request()->routeIs('dashboard');
$aiActive = request()->routeIs('ai.*');
$automationsActive = request()->routeIs('automations.*');
$broadcastsActive = request()->routeIs('broadcasts.*');
$auraAnalyticsActive = request()->routeIs('analytics.*');
$branchesActive = request()->routeIs('branches.*');
$roomsActive = request()->routeIs('rooms.*');
$bookingsActive = request()->routeIs('bookings.*');

$showMain = hasPerm('dashboard') || hasPerm('messages') || hasPerm('contacts') || hasPerm('ai') || hasPerm('automations') || hasPerm('broadcasts') || hasPerm('analytics');
$showOperations = hasPerm('branches') || hasPerm('rooms') || hasPerm('bookings');
$showAccount = hasPerm('permissions');

// sona Voice AI permissions
$showCore = hasPerm('overview') || hasPerm('inbox');
$showAiAgent = hasPerm('agentSettings') || hasPerm('callFlow');
$showPerformance = hasPerm('Analytics');
$showsona = $showCore || $showAiAgent || $showPerformance;

$mainOpen = $messagesActive || $dashboardActive || $aiActive || $automationsActive || $broadcastsActive || $auraAnalyticsActive;
$operationsOpen = $branchesActive || $roomsActive || $bookingsActive;
$accountOpen = $permissionsActive;

// sona Voice AI active states
$overviewActive = request()->routeIs('sona.overview');
$inboxActive = request()->routeIs('sona.inbox');
$agentSettingsActive = request()->routeIs('sona.agent_settings');
$callFlowActive = request()->routeIs('sona.callFlow');
$sonaAnalyticsActive = request()->routeIs('sona.analytics');

$coreOpen = $overviewActive || $inboxActive;
$aiAgentOpen = $agentSettingsActive || $callFlowActive;
$performanceOpen = $sonaAnalyticsActive;
$sonaOpen = $coreOpen || $aiAgentOpen || $performanceOpen;
@endphp

<!-- Aura Sidebar -->
<div class="main-sidebar aura-sidebar">
    <div class="sidebar-card">
        <div class="sidebar-header">
            <a href="{{ hasPerm('dashboard') ? route('dashboard') : (hasPerm('messages') ? route('messages.index') : '#') }}" class="logo-link" style="text-decoration: none; position: relative !important;">
            <img src="{{ asset('images/logo.png') }}" alt="GO Hotel" class="logo-img"> 
            <span class="logo-text" style="color: black !important; font-size: 1.2rem !important; margin-left: 70px !important;">Yes AI</span>
            </a>
        </div>

        <!-- aura Chatbot AI container -->
        <div class="sidebar-menu-content">
            <div class="sidebar-menu">
                <div class="sidebar-menu-header">
                    <button class="aura-toggle" type="button" aria-label="Toggle Aura menu">
                        <div class="aura-brand">
                            <span class="aura-title">AURA</span>
                            <span class="aura-pill">Chatbot AI</span>
                        </div>
                        <i class="fa-solid fa-chevron-up aura-caret"></i>
                    </button>
                </div>
                <div class="aura-menu">
                    @if($showMain)
                    <div class="sidebar-section {{ $mainOpen ? 'open' : '' }}">
                        <button class="section-toggle" type="button">
                            <span class="section-title">Main</span>
                            <i class="fa-solid fa-chevron-up section-caret"></i>
                        </button>
                        <div class="section-menu">
                            @if(hasPerm('dashboard'))
                            <a href="{{ route('dashboard') }}" class="sidebar-link {{ $dashboardActive ? 'active' : '' }}">
                                <span class="icon-wrap"><i class="fi fi-ts-tachometer-alt-fastest"></i></span>
                                <span class="link-text">Dashboard</span>
                            </a>
                            @endif

                            @if(hasPerm('messages') || hasPerm('contacts'))
                            <div class="dropdown-menu-container always-open open expanded">
                                <button class="sidebar-link dropdown-toggle {{ $messagesActive ? 'active' : '' }}" type="button">
                                    <span class="icon-wrap"><i class="fi fi-tr-comments"></i></span>
                                    <span class="link-text">Messages</span>
                                    <i class="fa-solid fa-chevron-up dropdown-caret"></i>
                                </button>
                                <div class="dropdown-menus show">
                                    @if(hasPerm('messages'))
                                    <a href="{{ route('messages.index') }}" class="submenu-link dropdown-item {{ request()->routeIs('messages.index') ? 'active' : '' }}">
                                        <i class="fa fa-regular fa-message"></i><span class="submenu-text">Inbox</span>
                                    </a>
                                    @endif
                                    @if(hasPerm('contacts'))
                                    <a href="{{ route('contacts.index') }}" class="submenu-link dropdown-item {{ request()->routeIs('contacts.*') ? 'active' : '' }}">
                                        <i class="fi fi-tr-address-book"></i><span class="submenu-text">Contacts</span>
                                    </a>
                                    @endif
                                </div>
                            </div>
                            @endif

                            @if(hasPerm('ai'))
                            <a href="{{ route('ai.index') }}" class="sidebar-link {{ $aiActive ? 'active' : '' }}">
                                <span class="icon-wrap"><i class="fi fi-tr-artificial-intelligence"></i></span>
                                <span class="link-text">AI</span>
                            </a>
                            @endif

                            @if(hasPerm('automations'))
                            <a href="{{ route('automations.index') }}" class="sidebar-link {{ $automationsActive ? 'active' : '' }}">
                                <span class="icon-wrap"><i class="fi fi-tr-robot"></i></span>
                                <span class="link-text">Automation</span>
                            </a>
                            @endif

                            @if(hasPerm('broadcasts'))
                            <a href="{{ route('broadcasts.index') }}" class="sidebar-link {{ $broadcastsActive ? 'active' : '' }}">
                                <span class="icon-wrap"><i class="fi fi-ts-bullhorn"></i></span>
                                <span class="link-text">Broadcasts</span>
                            </a>
                            @endif

                            @if(hasPerm('analytics'))
                            <a href="{{ route('analytics.index') }}" class="sidebar-link {{ $auraAnalyticsActive ? 'active' : '' }}">
                                <span class="icon-wrap"><i class="fi fi-tr-chart-histogram"></i></span>
                                <span class="link-text">Analytics</span>
                            </a>
                            @endif
                        </div>
                    </div>
                    @endif

                    @if($showOperations)
                    <div class="sidebar-section {{ $operationsOpen ? 'open' : '' }}">
                        <button class="section-toggle" type="button">
                            <span class="section-title">Operations</span>
                            <i class="fa-solid fa-chevron-up section-caret"></i>
                        </button>
                        <div class="section-menu">
                            @if(hasPerm('branches'))
                            <a href="{{ route('branches.index') }}" class="sidebar-link {{ $branchesActive ? 'active' : '' }}">
                                <span class="icon-wrap"><i class="fi fi-tr-hotel"></i></span>
                                <span class="link-text">Branches</span>
                            </a>
                            @endif
                            @if(hasPerm('rooms'))
                            <a href="{{ route('rooms.index') }}" class="sidebar-link {{ $roomsActive ? 'active' : '' }}">
                                <span class="icon-wrap"><i class="fi fi-tr-bed-alt"></i></span>
                                <span class="link-text">Rooms</span>
                            </a>
                            @endif
                            @if(hasPerm('bookings'))
                            <a href="{{ route('bookings.index') }}" class="sidebar-link {{ $bookingsActive ? 'active' : '' }}">
                                <span class="icon-wrap"><i class="fi fi-tr-calendar-check"></i></span>
                                <span class="link-text">Bookings</span>
                            </a>
                            @endif
                        </div>
                    </div>
                    @endif
                </div>
            </div>
        </div>
        
        <!-- sona Voice AI Container -->
        @if($showsona)
        <div class="sidebar-menu-content">
            <div class="sidebar-menu">
                <div class="sidebar-menu-header">
                    <button class="sona-toggle" type="button" aria-label="Toggle sona menu">
                        <div class="sona-brand">
                            <span class="sona-title">SONA</span>
                            <div class="sona-pill">Voice AI</div>
                        </div>
                        <i class="fas fa-chevron-up sona-caret"></i>
                    </button>
                </div>
                <div class="sona-menu">
                    @if($showCore)
                    <div class="sidebar-section {{ $coreOpen ? 'open' : '' }}">
                        <button class="section-toggle" type="button">
                            <span class="section-title">Core</span>
                            <i class="fa-solid fa-chevron-up section-caret"></i>
                        </button>
                        <div class="section-menu">
                            @if(hasPerm('overview'))
                            <a href="{{ route('sona.overview') }}" class="sidebar-link {{ $overviewActive ? 'active' : '' }}">
                                <span class="icon-wrap"><i class="fa fa-solid fa-cubes"></i></span>
                                <span class="link-text">Overview</span>
                            </a>
                            @endif

                            @if(hasPerm('inbox'))
                            <a href="{{ route('sona.inbox') }}" class="sidebar-link {{ $inboxActive ? 'active' : '' }}">
                                <span class="icon-wrap"><i class="fa fa-regular fa-message"></i></span>
                                <span class="link-text">Inbox</span>
                            </a>
                            @endif

                        </div>
                    </div>
                    @endif

                    @if($showAiAgent)
                    <div class="sidebar-section {{ $aiAgentOpen ? 'open' : '' }}">
                        <button class="section-toggle" type="button">
                            <span class="section-title">Ai Agent</span>
                            <i class="fa-solid fa-chevron-up section-caret"></i>
                        </button>
                        <div class="section-menu">
                            @if(hasPerm('agentSettings'))
                            <a href="{{ route('sona.agent_settings') }}" class="sidebar-link {{ $agentSettingsActive ? 'active' : '' }}">
                                <span class="icon-wrap"><i class="fa fa-solid fa-user-gear"></i></span>
                                <span class="link-text">Agent Settings</span>
                            </a>
                            @endif
                            @if(hasPerm('callFlow'))
                            <a href="{{ route('sona.callFlow') }}" class="sidebar-link {{ $callFlowActive ? 'active' : '' }}">
                                <span class="icon-wrap"><i class="fa fa-solid fa-phone"></i></span>
                                <span class="link-text">Call Flow</span>
                            </a>
                            @endif
                        </div>
                    </div>
                    @endif
                    
                    @if($showPerformance)
                    <div class="sidebar-section {{ $performanceOpen ? 'open' : '' }}">
                        <button class="section-toggle" type="button">
                            <span class="section-title">Performance</span>
                            <i class="fa-solid fa-chevron-up section-caret"></i>
                        </button>
                        <div class="section-menu">
                            @if(hasPerm('Analytics'))
                            <a href="{{ route('sona.analytics') }}" class="sidebar-link {{ $sonaAnalyticsActive ? 'active' : '' }}">
                                <span class="icon-wrap"><i class="fi fi-tr-chart-histogram"></i></span>
                                <span class="link-text">Analytics</span>
                            </a>
                            @endif
                        </div>
                    </div>
                    @endif
                </div>
            </div>
        </div>
        @endif

        <div class="sidebar-footer">
            <a href="{{ route('permissions.index') }}" class="footer-button">
                <i class="fi fi-tr-user-shield"></i>
                <span>User</span>
            </a>
            <a href="{{ auth()->user() && auth()->user()->role ? route('role_permissions.edit', auth()->user()->role) : '#' }}" class="footer-button">
                <i class="fi fi-tr-shield"></i>
                <span>Permissions Role</span>
            </a>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" class="logout-btn">
                    <i class="fi fi-tr-sign-out-alt"></i>
                    <span>Logout</span>
                </button>
            </form>
        </div>
    </div>

    <button class="sidebar-toggle-btn" id="sidebar-toggle" aria-label="Toggle sidebar">
        <i class="fa-solid fa-angle-left"></i>
    </button>
</div>

<style>
    /* More specific selectors to prevent summarize.css override */
    .main-sidebar .sidebar-section .section-title,
    .sidebar-menu-content .sidebar-section .section-title {
        font-size: 0.8rem ;
        font-weight: bold !important;
        color: inherit !important;
        margin-bottom: 0 !important;
    }

    .link-text {
        font-size: 0.85rem !important;
    }

    /* Protect all sidebar text from summarize.css */
    .main-sidebar .section-title,
    .sidebar-menu-content .section-title {
        font-size: 0.8rem ;
        font-weight: bold !important;
        color: inherit !important;
        margin-bottom: 0 !important;
    }

    .aura-menu {
        background-color: rgb(241, 241, 241);
        flex: 1;                /* ⭐ NEW */
        overflow-y: auto;       /* ⭐ move scroll here */
        border: 1px solid #e1e4e8;
        border-bottom-left-radius: 1rem;
        border-bottom-right-radius: 1rem;
    }

    .sona-menu {
        background-color: rgb(241, 241, 241);
        flex: 1;
        overflow-y: auto;
        border: 1px solid #e1e4e8;
        border-bottom-left-radius: 1rem;
        border-bottom-right-radius: 1rem;
    }

    /* sona Voice AI Container Styles */
    .sona-container {
        background-color: white;
        border: 1px solid #e1e4e8;
        border-radius: 1rem;
        padding: 12px 15px;
        margin: 0px 20px 20px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .sona-brand {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .sona-title {
        font-weight: 700;
        letter-spacing: 0.08em;
        font-size: 0.8rem;
        color: #111111;
        position: relative;
    }

    .sona-pill {
        background: #83FF2F;
        color: black;
        padding: 1px 8px;
        border-radius: 20px;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        font-weight: 600;
    }

    .sona-caret {
        color: black;
        font-size: 0.7rem;
        transition: transform 0.2s ease;
    }

    .sona-toggle.is-collapsed .sona-caret {
        transform: rotate(180deg);
    }

    /* sona Toggle Styles */
    .sona-toggle {
        width: 100%;
        background: transparent;
        border: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 0;
        cursor: pointer;
        color: #111111;
    }

    .sona-menu.is-collapsed {
        display: none;
    }

    /* Footer Buttons Styling */
    .footer-button {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 15px;
        text-decoration: none;
        color: #333;
        font-size: 0.85rem;
        font-weight: 500;
        border-radius: 8px;
        transition: all 0.2s ease;
        margin-bottom: 8px;
    }

    .footer-button:hover {
        background-color: #f5f5f5;
        color: #000;
    }

    .footer-button i {
        display: inline-flex;
        font-size: 1rem;
        width: 16px;
        text-align: center;
    }

    .sidebar-footer {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid #e1e4e8;
        background-color: #fff;
    }

    /* Hide specific elements when sidebar is collapsed */
    body.sidebar-collapsed .aura-pill,
    body.sidebar-collapsed .link-text,
    body.sidebar-collapsed .section-caret,
    body.sidebar-collapsed .dropdown-caret,
    body.sidebar-collapsed .submenu-text,
    body.sidebar-collapsed .sona-pill,
    body.sidebar-collapsed .footer-button span,
    body.sidebar-collapsed .logout-btn span {
        display: none;
    }

    /* Keep these elements visible when collapsed */
    body.sidebar-collapsed .icon-wrap,
    body.sidebar-collapsed .section-title,
    body.sidebar-collapsed .section-toggle,
    body.sidebar-collapsed .aura-title,
    body.sidebar-collapsed .sona-title,
    body.sidebar-collapsed .aura-caret,
    body.sidebar-collapsed .sona-caret,
    body.sidebar-collapsed .footer-button i {
        display: inline-block !important;
        visibility: visible;
    }

    /* Center sidebar-toggle when collapsed */
    body.sidebar-collapsed .sidebar-toggle {
        justify-content: center;
    }

    /* Center footer button and logout button icons when collapsed */
    body.sidebar-collapsed .sidebar-link,
    body.sidebar-collapsed .sidebar-link .dropdown-toggle,
    body.sidebar-collapsed .footer-button,
    body.sidebar-collapsed .logout-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    /* Always show submenu dropdown items when collapsed */
    body.sidebar-collapsed .dropdown-menus {
        display: flex !important;
        visibility: visible !important;
        position: static !important;
        right: auto !important;
        top: auto !important;
        margin-top: 0 !important;
        margin-left: 0 !important;
        background: white !important;
        border: 1px solid #e1e4e8 !important;
        border-radius: 8px !important;
        padding: 8px 12px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        flex-direction: column !important;
        gap: 5px !important;
    }

    /* Force in-flow placement in collapsed state to prevent overlap with AI/Automation links */
    body.sidebar-collapsed .sidebar-section .dropdown-menu-container {
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
    }

    body.sidebar-collapsed .sidebar-section .dropdown-menu-container > .dropdown-menus {
        position: static !important;
        inset: auto !important;
        transform: none !important;
        z-index: auto !important;
        margin: 0 !important;
    }

    body.sidebar-collapsed .section-menu > .dropdown-menu-container {
        position: relative !important;
        z-index: 1 !important;
    }

    body.sidebar-collapsed .section-menu > .sidebar-link {
        position: relative !important;
        z-index: 2 !important;
        visibility: visible !important;
        opacity: 1 !important;
    }

    body.sidebar-collapsed .submenu-link {
        display: flex !important;
        visibility: visible !important;
        position: static !important;
        background: transparent !important;
        border: none !important;
        padding: 5px 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
    }

    /* Reduce padding when collapsed */
    body.sidebar-collapsed .sidebar-section {
        padding-left: 5px;
        padding-right: 5px;
        padding-top: 10px;
        padding-bottom: 10px;
    }
    
    body.sidebar-collapsed .sona-container {
        padding-left: 5px;
        padding-right: 5px;
    }

    body.sidebar-collapsed .sona-text {
        font-size: 0.7rem;
        padding-left: 5px;
    }

    body.sidebar-collapsed .sidebar-menu-header {
        padding-left: 6px;
        padding-right: 6px;
    }

    body.sidebar-collapsed .aura-title {
        font-size: 0.7rem;
        font-weight: 1000;
        letter-spacing: 0.04em;
        white-space: nowrap;
    }

    body.sidebar-collapsed .sona-title {
        font-size: 0.7rem;
        font-weight: 1000;
        letter-spacing: 0.04em;
        white-space: nowrap;
    }

    body.sidebar-collapsed .aura-toggle,
    body.sidebar-collapsed .sona-toggle {
        gap: 6px;
    }

    body.sidebar-collapsed .aura-brand,
    body.sidebar-collapsed .sona-brand {
        gap: 6px;
        min-width: 0;
    }
    
    body.sidebar-collapsed .aura-title::after {
        width: 35px;
    }
    
    body.sidebar-collapsed .sona-title::after {
        width: 25px;
    }

    body.sidebar-collapsed .section-title {
        font-size: 0.4rem !important;
    }

    .sidebar-menu-header {
        padding: 15px 15px 15px 15px;
        background-color: #ffff;
        border: 1px solid #e1e4e8;
        border-top-left-radius: 1rem;
        border-top-right-radius: 1rem;
    }

    .sidebar-menu-header.is-collapsed {
        border-bottom-left-radius: 1rem;
        border-bottom-right-radius: 1rem;
    }

    .sidebar-card {
        background: #ffffff;
        display: flex;
        flex-direction: column;
        min-height: 100%;
        overflow: hidden;
        position: relative;
    }

    .aura-toggle,
    .sona-toggle {
        width: 100%;
        background: transparent;
        border: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 0;
        cursor: pointer;
        color: #111111;
    }

    .aura-brand,
    .sona-brand {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .aura-title {
        font-weight: 700;
        letter-spacing: 0.08em;
        font-size: 0.8rem;
        color: #111111;
        position: relative;
    }

    .aura-title::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -4px;
        width: 40px;
        height: 3px;
        background: #f7ff00;
        border-radius: 999px;
    }

    .aura-pill {
        background: #f7ff00;
        color: #111111;
        padding: 3px 5px;
        border-radius: 999px;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        font-weight: 600;
    }

    .aura-caret {
        color: #222222;
        transition: transform 0.2s ease;
        font-size: 0.7rem;
    }

    .aura-toggle.is-collapsed .aura-caret {
        transform: rotate(180deg);
    }

    .sidebar-menu-content {
        display: block;
    }

    .aura-menu.is-collapsed {
        display: none;
    }

    .dropdown-toggle::after {
        display: none !important;
    }

    .sidebar-menu {
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .sidebar-section {
        display: flex;
        flex-direction: column;
        gap: 6px;
        border-bottom: 1px solid #e1e4e8;
        padding: 10px 10px 10px 10px;
    }

    .account {
        border-bottom: none;
    }

    .sidebar-section + .sidebar-section {
        border-top: 1px solid #f0f0f0;
    }

    .section-toggle {
        width: 100%;
        background: transparent;
        border: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #b0b0b0;
        font-weight: 700;
        font-size: 0.85rem;
        padding: 4px 4px 6px;
        cursor: pointer;
    }

    .section-caret {
        color: #9a9a9a;
        transition: transform 0.2s ease;
        font-size: 0.7rem;
    }

    .sidebar-section:not(.open) .section-caret {
        transform: rotate(180deg);
    }

    .section-menu {
        display: none;
        flex-direction: column;
        gap: 6px;
        padding: 2px 0 6px;
    }

    .sidebar-section.open .section-menu {
        display: flex;
    }

    .sidebar-link,
    .sidebar-link a,
    .dropdown-toggle {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 1px 10px;
        border-radius: 12px;
        color: #1b1b1b;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        background: transparent;
        border: none;
        cursor: pointer;
        text-align: left;
    }

    .sidebar-link:hover,
    .sidebar-link a:hover,
    .dropdown-toggle:hover {
        background: #f4f4f4;
        color: #111111;
    }

    .sidebar-link:hover .fi,
    .sidebar-link:hover .fi:before,
    .sidebar-link:hover .fi::after {
        background-color: #F7FF00 !important;
        color: #000000 !important;
    }

    .icon-wrap {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #222222;
        background: transparent;
        font-size: 18px;
    }

    .sidebar-link.active,
    .dropdown-toggle.active {
        font-weight: 700;
    }

    .sidebar-link.active .icon-wrap,
    .dropdown-toggle.active .icon-wrap {
        background: #f7ff00;
        color: #111111;
    }

    .dropdown-menu-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .dropdown-caret {
        margin-left: auto;
        color: #888888;
        transition: transform 0.2s ease;
        font-size: 0.7rem;
    }

    .dropdown-menu-container.open .dropdown-caret {
        transform: rotate(180deg);
    }

    .dropdown-menus {
        display: none;
        flex-direction: column;
        gap: 6px;
        margin-left: 38px;
        position: relative;
        z-index: 1;
    }

    .dropdown-menus.show {
        display: flex;
    }

    .submenu-link.dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 1px 10px;
        border-radius: 10px;
        font-size: 0.85rem;
        font-weight: 600;
        color: #4a4a4a;
        text-decoration: none;
    }

    .submenu-link.dropdown-item:hover {
        background: #f4f4f4;
        color: #111111;
    }

    .submenu-link.dropdown-item.active {
        background: #f0f0f0;
        color: #111111;
        font-weight: 700;
    }

    .sidebar-footer {
        margin-top: auto;
        padding: 12px 16px 16px;
        border-top: 1px solid #f0f0f0;
    }

    .logout-btn {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 15px;
        margin-bottom: 8px;
        border: none;
        border-radius: 12px;
        background: #ffffff;
        color: #ff0000ff;
        font-weight: 500;
        font-size: 0.85rem;
        cursor: pointer;
        transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
    }

    .logout-btn i {
        display: inline-flex;
        color: #ff0000ff;
    }

    .logout-btn:hover {
        background: #f4f4f4ff;
        color: #fd5858ff;
    }

    .logout-btn:hover i {
        color: #fd5858ff;
    }

    

</style>

<script>
    // Anti-flicker on page load
    (function() {
        var savedState = localStorage.getItem('sidebarCollapsed');
        var isCollapsed = savedState === 'true';

        document.documentElement.classList.add('sidebar-preload');

        if (isCollapsed) {
            document.documentElement.classList.add('sidebar-collapsed-preload');
            document.querySelector('.main-sidebar')?.classList.add('collapsed');
            document.body.classList.add('sidebar-collapsed');
            document.documentElement.classList.add('sidebar-collapsed');
        } else {
            document.querySelector('.main-sidebar')?.classList.remove('collapsed');
            document.body.classList.remove('sidebar-collapsed');
            document.documentElement.classList.remove('sidebar-collapsed');
        }
    })();

    document.addEventListener('DOMContentLoaded', function() {
        var toggleBtn = document.getElementById('sidebar-toggle');
        var sidebar = document.querySelector('.main-sidebar');
        var auraToggle = document.querySelector('.aura-toggle');

        if (toggleBtn && sidebar) {
            toggleBtn.style.visibility = 'visible';
            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                sidebar.classList.toggle('collapsed');
                document.body.classList.toggle('sidebar-collapsed');
                document.documentElement.classList.toggle('sidebar-collapsed');

                var newCollapsed = sidebar.classList.contains('collapsed');
                localStorage.setItem('sidebarCollapsed', newCollapsed);
            });
        }

        if (auraToggle) {
            auraToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var auraMenu = document.querySelector('.aura-menu');
                var sidebarMenuHeader = document.querySelector('.sidebar-menu-header');
                if (auraMenu) {
                    auraMenu.classList.toggle('is-collapsed');
                }
                auraToggle.classList.toggle('is-collapsed');
                if (sidebarMenuHeader) {
                    sidebarMenuHeader.classList.toggle('is-collapsed');
                }
            });
        }

        // sona Toggle functionality
        var sonaToggle = document.querySelector('.sona-toggle');
        if (sonaToggle) {
            sonaToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var sonaMenu = document.querySelector('.sona-menu');
                var sonaMenuHeader = sonaToggle.closest('.sidebar-menu-header');
                if (sonaMenu) {
                    sonaMenu.classList.toggle('is-collapsed');
                }
                sonaToggle.classList.toggle('is-collapsed');
                if (sonaMenuHeader) {
                    sonaMenuHeader.classList.toggle('is-collapsed');
                }
            });
        }

        document.querySelectorAll('.section-toggle').forEach(function(toggle) {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var section = toggle.closest('.sidebar-section');
                if (section) {
                    section.classList.toggle('open');
                }
            });
        });

        document.querySelectorAll('.dropdown-toggle').forEach(function(toggle) {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var menu = toggle.nextElementSibling;
                if (menu && menu.classList.contains('dropdown-menus')) {
                    menu.classList.toggle('show');
                    toggle.classList.toggle('active');
                    var container = toggle.closest('.dropdown-menu-container');
                    if (container) {
                        container.classList.toggle('open');
                    }
                }
            });
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown-menu-container')) {
                document.querySelectorAll('.dropdown-menu-container .dropdown-menus').forEach(function(menu) {
                    if (menu.closest('.always-open')) return;
                    menu.classList.remove('show');
                    if (menu.previousElementSibling) {
                        menu.previousElementSibling.classList.remove('active');
                    }
                    var container = menu.closest('.dropdown-menu-container');
                    if (container) {
                        container.classList.remove('open');
                    }
                });
            }
        });

        document.querySelectorAll('.dropdown-menus .dropdown-item').forEach(function(item) {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        });

        setTimeout(function() {
            document.documentElement.classList.remove('sidebar-preload');
            document.documentElement.classList.remove('sidebar-collapsed-preload');
        }, 100);
    });
</script>
