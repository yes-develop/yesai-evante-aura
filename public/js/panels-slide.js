document.addEventListener('DOMContentLoaded', function() {
    console.log('Panels slide script loaded');
    
    // Get the panels container
    const panelsContainer = document.getElementById('panels-container');
    
    console.log('Elements found:', {
        panelsContainer: !!panelsContainer
    });
    
    if (!panelsContainer) {
        console.error('Could not find panels container');
        return;
    }
    
    // Add styles for sliding animation
    const style = document.createElement('style');
    style.textContent = `
        #panels-container {
            position: fixed;
            right: 0;
            top: 0;
            bottom: 0;
            width: 300px;
            transition: transform 0.3s ease;
            transform: translateX(0);
            background: #fff;
            overflow-x: hidden;
            box-shadow: -2px 0 10px rgba(0,0,0,0.1);
            z-index: 998;
        }

        #panels-container.collapsed {
            transform: translateX(300px);
        }

        .panels-toggle-wrapper {
            position: fixed;
            right: 300px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 999;
            transition: right 0.3s ease;
        }

        #panels-container.collapsed + .panels-toggle-wrapper {
            right: 0;
        }

        .panels-toggle-btn {
            background: #007bff;
            border: none;
            padding: 12px;
            cursor: pointer;
            box-shadow: -2px 0 5px rgba(0,0,0,0.2);
            border-radius: 4px 0 0 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            transition: background-color 0.3s ease;
        }

        .panels-toggle-btn i {
            font-size: 16px;
            color: #fff;
            transition: transform 0.3s ease;
        }

        #panels-container.collapsed + .panels-toggle-wrapper .panels-toggle-btn i {
            transform: rotate(180deg);
        }

        .panels-toggle-btn:hover {
            background: #0056b3;
        }

        .panels-toggle-btn:focus {
            outline: none;
            box-shadow: -2px 0 8px rgba(0,0,0,0.3);
        }
    `;
    document.head.appendChild(style);
    
    // Create wrapper for toggle button
    const toggleWrapper = document.createElement('div');
    toggleWrapper.className = 'panels-toggle-wrapper';
    
    // Add toggle button if it doesn't exist
    if (!document.querySelector('.panels-toggle-btn')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'panels-toggle-btn';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        toggleWrapper.appendChild(toggleBtn);
        
        // Insert wrapper after panels container
        panelsContainer.parentNode.insertBefore(toggleWrapper, panelsContainer.nextSibling);
        
        // Toggle panels visibility
        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            panelsContainer.classList.toggle('collapsed');
            
            // Update icon direction
            const icon = this.querySelector('i');
            if (panelsContainer.classList.contains('collapsed')) {
                icon.classList.remove('fa-chevron-left');
                icon.classList.add('fa-chevron-right');
            } else {
                icon.classList.remove('fa-chevron-right');
                icon.classList.add('fa-chevron-left');
            }
        });
    }
    
    // Close panels when clicking outside
    document.addEventListener('click', function(event) {
        if (!panelsContainer.contains(event.target) && !toggleWrapper.contains(event.target)) {
            const toggleBtn = document.querySelector('.panels-toggle-btn');
            const icon = toggleBtn.querySelector('i');
            panelsContainer.classList.add('collapsed');
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
        }
    });
    
    // Prevent panels from closing when clicking inside
    panelsContainer.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    // Initialize panel state
    if (!panelsContainer.classList.contains('collapsed')) {
        const toggleBtn = document.querySelector('.panels-toggle-btn');
        const icon = toggleBtn.querySelector('i');
        icon.classList.add('fa-chevron-left');
    }
}); 