document.addEventListener('DOMContentLoaded', function() {
    // Get all sidebar menu elements (Aura + Sona)
    const sidebarMenus = document.querySelectorAll('.sidebar-menu');
    
    if (sidebarMenus.length > 0) {
        // Add custom scrollbar styling
        const style = document.createElement('style');
        style.textContent = `
            .sidebar-menu::-webkit-scrollbar {
                width: 4px;
            }
            
            .sidebar-menu::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .sidebar-menu::-webkit-scrollbar-thumb {
                background-color: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
            }
            
            .sidebar-menu::-webkit-scrollbar-thumb:hover {
                background-color: rgba(255, 255, 255, 0.3);
            }

            .sidebar-menu {
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
            }
        `;
        document.head.appendChild(style);

        sidebarMenus.forEach(function(sidebarMenu) {
            // Set the height and enable smooth scrolling
            sidebarMenu.style.maxHeight = 'calc(100vh - 150px)'; // ความสูงทั้งหมดลบด้วยความสูงของ header
            sidebarMenu.style.overflowY = 'auto';
            sidebarMenu.style.overflowX = 'hidden';
            sidebarMenu.style.scrollBehavior = 'smooth';

            // Make menu focusable for keyboard navigation
            if (!sidebarMenu.hasAttribute('tabindex')) {
                sidebarMenu.setAttribute('tabindex', '0');
            }

            // Add keyboard navigation
            sidebarMenu.addEventListener('keydown', function(e) {
                const currentScroll = sidebarMenu.scrollTop;
                const scrollAmount = 50;

                switch(e.key) {
                    case 'ArrowUp':
                        e.preventDefault();
                        sidebarMenu.scrollTo({
                            top: currentScroll - scrollAmount,
                            behavior: 'smooth'
                        });
                        break;

                    case 'ArrowDown':
                        e.preventDefault();
                        sidebarMenu.scrollTo({
                            top: currentScroll + scrollAmount,
                            behavior: 'smooth'
                        });
                        break;

                    case 'Home':
                        e.preventDefault();
                        sidebarMenu.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                        break;

                    case 'End':
                        e.preventDefault();
                        sidebarMenu.scrollTo({
                            top: sidebarMenu.scrollHeight,
                            behavior: 'smooth'
                        });
                        break;
                }
            });

            // Add touch support for mobile
            let touchStartY = 0;
            let touchEndY = 0;

            sidebarMenu.addEventListener('touchstart', function(e) {
                touchStartY = e.touches[0].clientY;
            });

            sidebarMenu.addEventListener('touchmove', function(e) {
                touchEndY = e.touches[0].clientY;
                const deltaY = touchStartY - touchEndY;
                sidebarMenu.scrollTop += deltaY;
                touchStartY = touchEndY;
            });
        });
    }
}); 
