document.addEventListener('DOMContentLoaded', function() {
    console.log('Sidebar script loaded');
    
    // Get the sidebar and toggle button
    const sidebar = document.querySelector('.main-sidebar');
    const toggleButton = document.getElementById('sidebar-toggle');
    const messageHub = document.querySelector('.message-hub');
    const content = document.querySelector('.content');
    
    console.log('Elements found:', {
        sidebar: !!sidebar,
        toggleButton: !!toggleButton,
        messageHub: !!messageHub,
        content: !!content
    });
    
    if (!sidebar) {
        console.error('Could not find sidebar');
        return;
    }
    
    // Add styles with fixed message-hub positioning
    const style = document.createElement('style');
    style.textContent = `
        /* Anti-flicker styles - applied immediately */
        html.sidebar-preload * {
            transition: none !important;
        }
        
        /* Preload state for anti-flicker */
        html.sidebar-collapsed-preload .main-sidebar {
            width: 110px !important;
        }
        html.sidebar-collapsed-preload .sidebar-menu span:not(.submenu-text),
        html.sidebar-collapsed-preload .logo-link span,
        html.sidebar-collapsed-preload .dropdown-toggle::after {
            display: none !important;
        }
        html.sidebar-collapsed-preload .content {
            margin-left: 110px !important;
        }
        html.sidebar-collapsed-preload .message-hub {
            left: 110px !important;
        }
        
        .main-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 250px;
            z-index: 1000;
            background: #ffffff;
            transition: all 0.3s ease;
            overflow-x: hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .main-sidebar.collapsed {
            width: 110px;
        }

        .sidebar-toggle-btn i{
            margin-left: -7px;
        }

        .sidebar-toggle-btn {
            position: absolute;
            margin-left: 10px;
            top: 23px;
            left: 225px;
            width: 26px;
            height: 55px;
            border-radius: 15px;
            background: #f4f4f4ff;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1001;
            transition: all 0.3s ease;
            opacity: 0.9;
            color: #000000ff;
        }

        .main-sidebar.collapsed .sidebar-toggle-btn {
            top: 20px;
            left: 84px;
            transform: rotate(180deg);
        }

        .main-sidebar.collapsed .sidebar-toggle-btn i {
            margin-left: 7px;
        }

        .main-sidebar.collapsed .sidebar-header {
            margin-top: 20px;
        }

        .sidebar-header {
            transition: margin-top 0.3s ease;
            margin-top: 0;
        }

        /* Fixed message hub positioning - no gap */
        .message-hub {
            position: absolute;
            left: 250px; /* Same as expanded sidebar width */
            top: 0;
            right: 0;
            bottom: 0;
            transition: left 0.3s ease;
            width: auto;
            margin-left: 0 !important; /* Override any existing margin */
        }

        body.sidebar-collapsed .message-hub {
            left: 110px; /* Same as collapsed sidebar width */
        }

        /* Content transition */
        .content {
            margin-left: 250px;
            transition: margin-left 0.3s ease;
        }
        
        body.sidebar-collapsed .content {
            margin-left: 110px;
        }

        /* All other content that should shift */
        .content-container, 
        .main-content, 
        .dashboard-container, 
        .panel-content,
        .panels-container,
        .chat-container {
            transition: margin-left 0.3s ease, width 0.3s ease;
        }
    `;
    
    document.head.appendChild(style);
    
    // Apply saved state immediately (if not already applied in the blade template)
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
        sidebar.classList.add('collapsed');
        document.body.classList.add('sidebar-collapsed');
        document.documentElement.classList.add('sidebar-collapsed');
    }
    
    // Add global toggle function that can be called from anywhere
    window.toggleSidebar = function() {
        const sidebar = document.querySelector('.main-sidebar');
        if (!sidebar) return;
        
        sidebar.classList.toggle('collapsed');
        document.body.classList.toggle('sidebar-collapsed');
        document.documentElement.classList.toggle('sidebar-collapsed');
        
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
        console.log('Sidebar toggled via global function, state:', isCollapsed ? 'collapsed' : 'expanded');
    };
    
    // Remove preload class to enable transitions
    setTimeout(() => {
        document.documentElement.classList.remove('sidebar-preload');
    }, 100);
});

// Simple direct implementation to ensure dropdown menus work properly with sidebar toggle
document.addEventListener('DOMContentLoaded', function() {
    // Set up dropdown toggle functionality
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Find the container
            const container = this.closest('.dropdown-menu-container');
            if (container) {
                // Close any other open dropdowns first (skip always-open)
                document.querySelectorAll('.dropdown-menu-container.expanded').forEach(openContainer => {
                    if (openContainer !== container && !openContainer.classList.contains('always-open')) {
                        openContainer.classList.remove('expanded');
                    }
                });
                
                // Toggle the expanded class on this container
                container.classList.toggle('expanded');
                
                console.log('Dropdown toggle clicked, expanded:', container.classList.contains('expanded'));
            }
        });
    });
    
    // Close dropdowns when clicking outside (skip always-open)
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown-menu-container')) {
            document.querySelectorAll('.dropdown-menu-container.expanded').forEach(container => {
                if (container.classList.contains('always-open')) return;
                container.classList.remove('expanded');
            });
        }
    });
});

// Anti-flicker script - executes immediately before DOM is ready
(function() {
    // Apply immediate styles before any page elements render
    document.documentElement.classList.add('sidebar-preload');
    
    // Check saved state and apply preload classes
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        document.documentElement.classList.add('sidebar-collapsed-preload');
    }
    
    // Insert critical styles directly into the head
    const criticalStyle = document.createElement('style');
    criticalStyle.textContent = `
        html.sidebar-preload * {
            transition: none !important;
        }
        html.sidebar-collapsed-preload .main-sidebar {
            width: 110px !important;
        }
        html.sidebar-collapsed-preload .sidebar-menu span,
        html.sidebar-collapsed-preload .logo-link span,
        html.sidebar-collapsed-preload .dropdown-toggle::after,
        html.sidebar-collapsed-preload .dropdown-menu {
            display: none !important;
        }
        html.sidebar-collapsed-preload .content {
            margin-left: 110px !important;
        }
        html.sidebar-collapsed-preload .message-hub {
            left: 110px !important;
        }
    `;
    document.head.appendChild(criticalStyle);
})();
