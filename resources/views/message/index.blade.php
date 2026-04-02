<!DOCTYPE html>
<html lang="en">

<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="reverb-key" content="{{ config('services.reverb.app_key') }}">
    <meta name="reverb-host" content="{{ config('services.reverb.host') }}">
    <meta name="reverb-port" content="{{ config('services.reverb.port') }}">
    <meta name="reverb-scheme" content="{{ config('services.reverb.scheme') }}">
    <meta name="evante-api-url" content="{{ config('services.evante.url') }}">
    <meta name="evante-api-key" content="{{ config('services.evante.key') }}">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YesWebDesign - Messaging App</title>
    <link rel="icon" type="image/png" href="{{ asset('images/favicon.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('images/favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('images/favicon-16x16.png') }}">
    <link rel="apple-touch-icon" href="{{ asset('images/apple-touch-icon.png') }}">
    <link rel="stylesheet" href="{{ asset('styles/main.css') . '?v=2024110501&t=' . time() }}">
    <link rel="stylesheet" href="{{ asset('styles/chat.css') . '?v=2024110501&t=' . time() }}">
    <link rel="stylesheet" href="{{ asset('styles/conversations.css') . '?v=2024110501&t=' . time() }}">
    <link rel="stylesheet" href="{{ asset('styles/modal.css') . '?v=2024110501&t=' . time() }}">
    <link rel="stylesheet" href="{{ asset('styles/profile-modal.css') . '?v=2024110501&t=' . time() }}">
    <link rel="stylesheet" href="{{ asset('styles/conversation-modal.css') . '?v=2024110501&t=' . time() }}">
    <link rel="stylesheet" href="{{ asset('styles/panels.css') . '?v=2024110501&t=' . time() }}">
    <link rel="stylesheet" href="{{ asset('styles/social-apps.css') . '?v=2024110501&t=' . time() }}">
    <link rel="stylesheet" href="{{ asset('styles/insights.css') . '?v=2024110501&t=' . time() }}">
    <link rel="stylesheet" href="{{ asset('styles/button.css') . '?v=2024110501&t=' . time() }}">
    <link rel="stylesheet" href="{{ asset('css/sidebar-state.css') . '?v=2024110501&t=' . time() }}">
    <link rel="stylesheet" href="{{ asset('styles/message_sidebar.css') . '?v=2024110501&t=' . time() }}">
    <link rel="stylesheet" href="{{ asset('styles/translate.css') . '?v=2024110501&t=' . time() }}">
    <link rel="stylesheet" href="{{ asset('styles/summarize.css') . '?v=2024110501&t=' . time() }}">
    <link rel="stylesheet" href="{{ asset('styles/calendar.css') . '?v=2024110501&t=' . time() }}">
    <link rel="stylesheet" href="{{ asset('styles/ai-assistant.css') . '?v=2024110501&t=' . time() }}">

    <!-- iziToast CSS (จาก CDN) -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/izitoast/dist/css/iziToast.min.css">

    <!-- CSS ของคุณ (โหลดทีหลังเพื่อทับ style) -->
    <link rel="stylesheet" href="{{ asset('styles/izi-toast.css') . '?v=2024110501&t=' . time() }}">

    <!-- โหลด JavaScript สำหรับ iziToast -->
    <script src="https://cdn.jsdelivr.net/npm/izitoast/dist/js/iziToast.min.js"></script>

    <!-- ฟอนต์ Nunito สำหรับอังกฤษ -->
    <link href="https://fonts.googleapis.com/css2?family=Nunito&display=swap" rel="stylesheet">

    <!-- ฟอนต์ Prompt สำหรับไทย แบบ official unicode-range -->
    <link href="https://fonts.googleapis.com/css2?family=Sarabun&subset=thai&display=swap" rel="stylesheet">


    <!-- flaticon Icons -->
    <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.6.0/uicons-thin-straight/css/uicons-thin-straight.css'>
    <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.6.0/uicons-thin-rounded/css/uicons-thin-rounded.css'>
    <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css'>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&display=swap" rel="stylesheet">

</head>

<body>
    <!-- Mobile Sidebar Overlay -->
    <div id="sidebar-mobile-overlay" class="sidebar-mobile-overlay"></div>

    <!-- Sidebar Toggle (Mobile) -->
    <div class="toggle-sidebar" id="mobile-sidebar-toggle">
        <i class="fas fa-bars"></i>
    </div>

    <!-- GO Hotel Sidebar -->
    @include('components.sidebar')

    <!-- Modified message hub to account for the main sidebar -->
    <div class="message-hub">
        <!-- Invisible hover trigger for expanding conversations on tablet -->
        <div class="conversations-hover-trigger" id="conversations-hover-trigger">
            <i class="fas fa-chevron-right"></i>
        </div>
        <!-- Panels toggle button (visible at ≤992px) -->
        <button class="panels-toggle-btn" id="panels-toggle-btn" title="Show panels">
            <i class="fi fi-br-menu-dots-vertical"></i>
        </button>

        <div class="message-section conversations" id="conversation-list"></div>
        <div class="message-section chat" id="chat-section">
            <div class="empty-chat-message">
                <i class="fas fa-comments chat-icon"></i>
                <p class="empty-text">Please select a conversation to start messaging.</p>
            </div>
        </div>


        <div class="panels-container" id="panels-container">
            <div class="panel-header">
                <button class="back-button" id="back-button"><i class="fa-solid fa-chevron-left"></i></button> 
            </div>
            <div class="panels-tabs">
                <div class="panel-tab active" data-panel="information">Information</div>
                <div class="panel-tab" data-panel="ai">AI Assistant</div>
                <div class="panel-tab" data-panel="team">Team Chat</div>
            </div>
            <div class="panels-content">
                <div class="panel-content active" id="information-panel"></div>
                <div class="panel-content" id="ai-panel"></div>
                <div class="panel-content" id="team-panel"></div>
            </div>
        </div>
    </div>

    <div id="profile-modal"></div>

    <!-- Reverb real-time: pusher-js then laravel-echo must load before chat.js -->
    <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/laravel-echo@1.15.3/dist/echo.iife.js"></script>
    <script src="{{ asset('js/label-management.js') . '?v=2024110501&t=' . time() }}"></script>
    <script src="{{ asset('js/chat.js') . '?v=2024110501&t=' . time() }}"></script>
    <script>
    window.AppConfig = window.AppConfig || {};
</script>
    <script src="{{ asset('js/app.js') . '?v=2024110501&t=' . time() }}"></script>
    <script src="{{ asset('js/evante-chat-override.js') . '?v=2024110501&t=' . time() }}"></script>
    <script src="{{ asset('js/debug.js') . '?v=2024110501&t=' . time() }}"></script>
    <script src="{{ asset('js/statuswebhook.js') . '?v=2024110501&t=' . time() }}"></script>
    <script src="{{ asset('js/panels-tabs.js') . '?v=2024110501&t=' . time() }}"></script>
    <script src="{{ asset('js/sidebarslide.js') . '?v=2024110501&t=' . time() }}"></script>
    <!-- Disabled: unreadChat-webhook.js overrides loadConversation and causes badge flash.
         Unread tracking now handled by Reverb + API data in renderConversationsList. -->
    <!-- <script src="{{ asset('js/unreadChat-webhook.js') . '?v=2024110501&t=' . time() }}"></script> -->
    <!-- <script src="{{ asset('js/panels-slide.js') . '?v=' . (file_exists(public_path('js/panels-slide.js')) ? filemtime(public_path('js/panels-slide.js')) : '1') }}"></script> -->

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Handle menu item clicks
            document.querySelectorAll('.message-menu .menu-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    // Let the normal link navigation happen
                    // Remove any section parameter handling
                });
            });

            // Remove section parameter if it exists
            const url = new URL(window.location.href);
            if (url.searchParams.has('section')) {
                url.searchParams.delete('section');
                window.history.replaceState({}, '', url);
            }
        });
    </script>

    <script>
        // Mobile sidebar toggle (matches app.blade.php logic)
        (function () {
            var mobileTrigger = document.getElementById('mobile-sidebar-toggle');
            var sidebar = document.querySelector('.main-sidebar');
            var overlay = document.getElementById('sidebar-mobile-overlay');

            function openSidebar() {
                if (sidebar) sidebar.classList.add('mobile-visible');
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }

            function closeSidebar() {
                if (sidebar) sidebar.classList.remove('mobile-visible');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
            }

            if (mobileTrigger) {
                mobileTrigger.addEventListener('click', function () {
                    if (sidebar && sidebar.classList.contains('mobile-visible')) {
                        closeSidebar();
                    } else {
                        openSidebar();
                    }
                });
            }

            if (overlay) {
                overlay.addEventListener('click', closeSidebar);
            }

            window.addEventListener('resize', function () {
                if (window.innerWidth > 991) {
                    closeSidebar();
                }
            });
        })();
    </script>
</body>

</html>