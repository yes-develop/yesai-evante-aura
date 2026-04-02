<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'GO Hotel')</title>
    <link rel="icon" type="image/png" href="{{ asset('images/favicon.png') }}">

    <!-- Early loading of sidebar state CSS to prevent flickering -->
    <link rel="stylesheet" href="{{ asset('css/sidebar-state.css?time=') }}<?php echo time();?>">
    
    <link rel="stylesheet" href="{{ asset('styles/fonts.css?time=') }}<?php echo time();?>">
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- ฟอนต์ Nunito สำหรับอังกฤษ -->
    <link href="https://fonts.googleapis.com/css2?family=Nunito&display=swap" rel="stylesheet">
    <!-- ฟอนต์ Prompt สำหรับไทย แบบ official unicode-range -->
    <link href="https://fonts.googleapis.com/css2?family=Sarabun&subset=thai&display=swap" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- DataTables CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css">
    <!-- Date Range Picker CSS -->
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" />
    <!-- Custom CSS -->
    <link rel="stylesheet" href="{{ asset('css/sidebar.css?time=') }}<?php echo time();?>">
    <link rel="stylesheet" href="{{ asset('styles/message_sidebar.css?time=') }}<?php echo time();?>">

    <!-- ฟอนต์ Nunito สำหรับอังกฤษ -->
    <link href="https://fonts.googleapis.com/css2?family=Nunito&display=swap" rel="stylesheet">

    <!-- ฟอนต์ Sarabun สำหรับไทย แบบ official unicode-range -->
    <link href="https://fonts.googleapis.com/css2?family=Sarabun&subset=thai&display=swap" rel="stylesheet">

    <!-- flaticon Icons -->
    <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.6.0/uicons-thin-straight/css/uicons-thin-straight.css'>
    <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.6.0/uicons-thin-rounded/css/uicons-thin-rounded.css'>
    <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css'>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&display=swap" rel="stylesheet">
    @yield('styles')
    @stack('styles')
    
    <!-- Load the simplified sidebar.js first for immediate state application -->
    <script src="{{ asset('js/sidebarslide.js?time=') }}<?php echo time();?>"></script>
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

    <!-- Main Content -->
    <div class="content">
        <div class="container-fluid">
            <!-- Header -->
            @include('components.header')

            <!-- Flash Messages -->
            @if (session('success'))
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                {{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            @endif

            @if (session('error'))
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                {{ session('error') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            @endif

            <!-- Main Content -->
            @yield('content')

            <!-- Footer -->
            @include('components.footer')
        </div>
    </div>

    <script>
    window.AppConfig = window.AppConfig || {};
    window.AppConfig.GOOGLE_SHEETS_ID = '{{ config('services.google_sheets.id') }}';
    window.AppConfig.GOOGLE_SHEETS_API_KEY = '{{ config('services.google_sheets.api_key') }}';
    window.AppConfig.MAKE_WEBHOOK_AUTOMATIONS_URL = '{{ config('services.make.webhook_automations_url') }}';
    window.AppConfig.MAKE_WEBHOOK_AI_CHAT_URL = '{{ config('services.make.webhook_ai_chat_url') }}';
    </script>
    <script src="{{ asset('js/app.js') . '?v=2024110401&t=' . time() }}"></script>
    <script src="{{ asset('js/debug.js') . '?v=' . (file_exists(public_path('js/debug.js')) ? filemtime(public_path('js/debug.js')) : '1') }}"></script>

    <!-- Bootstrap Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- DataTables -->
    <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
    <!-- Date Range Picker -->
    <script type="text/javascript" src="https://cdn.jsdelivr.net/momentjs/latest/moment.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>
    <!-- Custom JavaScript -->
    <script src="{{ asset('js/admin_dashboard.js?time=') }}<?php echo time();?>"></script>
    <script src="{{ asset('js/sidebar_scroll.js?time=') }}<?php echo time();?>"></script>
    @yield('scripts')
    @stack('scripts')

    <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
        @csrf
    </form>

    <script>
        // Mobile sidebar toggle
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

            // Close sidebar on resize to desktop
            window.addEventListener('resize', function () {
                if (window.innerWidth > 991) {
                    closeSidebar();
                }
            });
        })();
    </script>

</body>

</html>