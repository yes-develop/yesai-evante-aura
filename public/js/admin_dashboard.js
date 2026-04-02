$(document).ready(function() {
    // Only initialize DataTable if the table exists on the page
    var bookingsTable;
    if ($('#dashboardBookingsTable').length > 0) {
        bookingsTable = $('#dashboardBookingsTable').DataTable({
            pageLength: 10,
            lengthMenu: [10, 25, 50, 100],
            searching: true,
            ordering: true,
            info: true,
            responsive: true,
            dom: 't<"d-none"lip>', // Hide default controls as we're using custom ones
            language: {
                search: "",
                searchPlaceholder: "Search bookings..."
            },
            order: [[0, 'desc']], // Sort by first column (ID) in descending order
            columnDefs: [
                { targets: 0, type: 'num' } // Ensure ID column is treated as number for proper sorting
            ],
            // Initialize callbacks
            initComplete: function() {
                // Once the table is fully initialized, update our custom UI elements
                updateShowingEntries();
                updatePaginationButtons();
            }
        });

        // Handle custom page length dropdown
        $('#bookingsPerPage').on('change', function() {
            if (bookingsTable) {
                bookingsTable.page.len($(this).val()).draw();
                updateShowingEntries();
            }
        });

        // Handle custom search input
        $('.search-input').on('keyup', function() {
            // Check if bookingsTable is properly initialized
            if (bookingsTable && typeof bookingsTable.search === 'function') {
                bookingsTable.search(this.value).draw();
                updateShowingEntries();
            }
        });

        // Add focus and blur events to show when search is active
        $('.search-input').on('focus', function() {
            $(this).closest('.search-box').addClass('search-active');
        }).on('blur', function() {
            if (!$(this).val()) {
                $(this).closest('.search-box').removeClass('search-active');
            }
        });

        // Clear search when clicking the X button
        $(document).on('click', '.search-clear', function() {
            $('.search-input').val('').trigger('keyup').focus();
        });

        // Handle custom pagination - Only set up if the table exists
        $('.pagination .page-item:not(.disabled)').on('click', function(e) {
            e.preventDefault();
            var page = $(this).find('.page-link').text();
            
            // Check if bookingsTable is properly initialized
            if (!bookingsTable || typeof bookingsTable.page !== 'function') {
                return;
            }
            
            if (page === 'Previous') {
                bookingsTable.page('previous').draw('page');
            } else if (page === 'Next') {
                bookingsTable.page('next').draw('page');
            } else {
                bookingsTable.page(parseInt(page) - 1).draw('page');
            }
            
            updateShowingEntries();
            updatePaginationButtons();
        });
    }

    // Update showing entries text
    function updateShowingEntries() {
        // Check if bookingsTable is defined and initialized properly
        if (!bookingsTable || typeof bookingsTable.page !== 'function') {
            console.warn('Bookings table not properly initialized');
            return;
        }
        
        try {
            var info = bookingsTable.page.info();
            
            // Check if info exists and has required properties
            if (!info) {
                console.warn('Could not get table page info');
                return;
            }
            
            // Make sure the DOM elements exist before updating them
            if ($('#showingStart').length) {
                $('#showingStart').text(info.start + 1);
            }
            
            if ($('#showingEnd').length) {
                $('#showingEnd').text(info.end);
            }
            
            if ($('#totalEntries').length) {
                $('#totalEntries').text(info.recordsDisplay);
            }
        } catch (err) {
            console.warn('Error updating entries display:', err);
        }
    }

    // Update pagination buttons active state
    function updatePaginationButtons() {
        // Check if bookingsTable is defined and initialized properly
        if (!bookingsTable || typeof bookingsTable.page !== 'function') {
            console.warn('Bookings table not properly initialized for pagination');
            return;
        }
        
        try {
            var info = bookingsTable.page.info();
            
            // Check if info exists
            if (!info) {
                console.warn('Could not get pagination info');
                return;
            }
            
            // Check if pagination elements exist
            if ($('.pagination .page-item').length === 0) {
                console.warn('Pagination elements not found');
                return;
            }
            
            $('.pagination .page-item').removeClass('active');
            $('.pagination .page-item').eq(info.page + 1).addClass('active');
            
            // Update Previous/Next buttons state
            $('.pagination .page-item:first').toggleClass('disabled', info.page === 0);
            $('.pagination .page-item:last').toggleClass('disabled', info.page === info.pages - 1);
        } catch (err) {
            console.warn('Error updating pagination:', err);
        }
    }

    // Initialize DataTables
    $('#roomsTable').DataTable({
        paging: false,
        searching: false,
        info: false,
        responsive: true
    });
    
    // Date Range Picker
    $('#dateRange').daterangepicker({
        opens: 'left',
        startDate: moment().subtract(29, 'days'),
        endDate: moment(),
        ranges: {
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    });
    
    // Toggle Sidebar on Mobile
    $('.toggle-sidebar').on('click', function() {
        $('.sidebar').toggleClass('show');
    });

    
    // Initialize progress circles
    function initProgressCircles() {
        $('.progress-circle').each(function() {
            var circle = $(this);
            var progressBar = circle.find('.progress-bar');
            var progressValue = circle.data('value');
            
            // Calculate the circumference
            var radius = progressBar.attr('r');
            var circumference = 2 * Math.PI * radius;
            
            // Set the initial styles
            progressBar.css({
                'stroke-dasharray': circumference,
                'stroke-dashoffset': circumference
            });
            
            // Calculate the progress
            var progress = progressValue / 100;
            var dashoffset = circumference * (1 - progress);
            
            // Animate the progress bar
            setTimeout(function() {
                progressBar.css('stroke-dashoffset', dashoffset);
            }, 100);
        });
    }
    
    // Initialize charts
    function initCharts() {
        // Booking Statistics Chart
        const bookingsCanvas = document.getElementById('bookingsChart');
        if (bookingsCanvas) {
            const bookingsCtx = bookingsCanvas.getContext('2d');
            const months = JSON.parse(bookingsCanvas.dataset.months || '[]');
            const bookingsData = JSON.parse(bookingsCanvas.dataset.bookings || '[]');

        const gradient = bookingsCtx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(247, 255, 0, 1)');   // 100%
            gradient.addColorStop(0.5, 'rgba(246, 255, 0, 0.3)'); // 50%
            gradient.addColorStop(1, 'rgba(247, 255, 0, 0)');   // 0%

            new Chart(bookingsCtx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'Bookings',
                        data: bookingsData,
                        borderColor: '#F7FF00',
                        backgroundColor: gradient,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#212529',
                        pointBorderColor: '#212529',
                        pointHoverBackgroundColor: '#212529',
                                    pointHoverBorderColor: '#212529'
                                }]
                            },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index',
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: false, // Disable default tooltip
                            external: function(context) {
                                // Tooltip Element
                                let tooltipEl = document.getElementById('chartjs-tooltip');
                                let pointerEl = document.getElementById('chartjs-pointer');

                                // Create elements on first render
                                if (!tooltipEl) {
                                    tooltipEl = document.createElement('div');
                                    tooltipEl.id = 'chartjs-tooltip';
                                    document.body.appendChild(tooltipEl);
                                }
                                
                                if (!pointerEl) {
                                    pointerEl = document.createElement('div');
                                    pointerEl.id = 'chartjs-pointer';
                                    pointerEl.style.position = 'absolute';
                                    pointerEl.style.backgroundColor = '#212529';
                                    pointerEl.style.width = '1px';
                                    pointerEl.style.pointerEvents = 'none';
                                    document.body.appendChild(pointerEl);
                                }

                                // Hide if no tooltip
                                const tooltipModel = context.tooltip;
                                if (tooltipModel.opacity === 0) {
                                    tooltipEl.style.opacity = 0;
                                    pointerEl.style.opacity = 0;
                                    return;
                                }

                                // Set Text
                                if (tooltipModel.body) {
                                    const index = tooltipModel.dataPoints[0].dataIndex;
                                    const value = tooltipModel.dataPoints[0].parsed.y;
                                    const month = months[index];
                                    
                                    tooltipEl.innerHTML = `
                                        <div style="background: #212529; color: white; padding: 8px 12px; border-radius: 4px; font-size: 14px; text-align: center;">
                                            <div>${value} booking</div>
                                        </div>
                                    `;
                                }

                                const position = context.chart.canvas.getBoundingClientRect();
                                const chartHeight = context.chart.height;
                                const xPos = position.left + window.pageXOffset + tooltipModel.caretX
                                const yPosTop = position.top + window.pageYOffset + tooltipModel.caretY - 50;
                                
                                // Get data point y-position
                                const pointY = tooltipModel.caretY;
                                
                                // Calculate position for x-axis (where month labels are)
                                // This gets the position just above the x-axis
                                const scales = context.chart.scales;
                                const xAxisY = scales.x.bottom - 5; // Position slightly above the x-axis
                                
                                // Calculate line height from data point down to x-axis
                                const lineHeight = xAxisY - pointY + 5;
                                
                                // Display, position tooltip
                                tooltipEl.style.opacity = 1;
                                tooltipEl.style.position = 'absolute';
                                tooltipEl.style.left = xPos - 40 + 'px';
                                tooltipEl.style.top = yPosTop + 'px';
                                tooltipEl.style.pointerEvents = 'none';
                                tooltipEl.style.transition = 'all .1s ease';
                                
                                // Position and size the pointer line
                                pointerEl.style.opacity = 1;
                                pointerEl.style.height = lineHeight + 'px';
                                pointerEl.style.left = xPos + 'px';
                                pointerEl.style.top = position.top + window.pageYOffset + pointY + 'px';
                                pointerEl.style.transition = 'all .1s ease';
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#f0f0f0',
                                drawBorder: false
                            },
                            ticks: {
                                stepSize: 5
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    elements: {
                        line: {
                            tension: 0.4 // Make line smoother
                        }
                    }
                }
            });
        }

        // Room Types Chart
        const roomTypesCanvas = document.getElementById('roomTypesChart');
        if (roomTypesCanvas) {
            const roomTypesCtx = roomTypesCanvas.getContext('2d');
            const roomTypeLabels = JSON.parse(roomTypesCanvas.dataset.labels || '[]');
            const roomTypeCounts = JSON.parse(roomTypesCanvas.dataset.values || '[]');

            new Chart(roomTypesCtx, {
                type: 'doughnut',
                data: {
                    labels: roomTypeLabels,
                    datasets: [{
                        data: roomTypeCounts,
                        backgroundColor: [
                            'rgba(247, 255, 0, 0.2)',                     // สีแรก (เต็มสี)
                            'rgba(65,65, 65, 0.2)'     // สีที่สอง (มี opacity 20%)
                        ],
                        hoverBackgroundColor: [
                            'rgba(247, 255, 0, 1)', // สีเมื่อ hover เข้มขึ้น
                            'rgba(65, 65, 65, 1)'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
                            backgroundColor: '#333',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            padding: 12,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return context.parsed + ' Rooms';
                                }
                            }
                        }
                    }
                }
            });
        }
    }
    
    // Call initialization functions
    initProgressCircles();
    initCharts();
    
    // Handle filter application
    $('#applyFilter').on('click', function() {
        // Add filter functionality here
        alert('Filter applied for date range: ' + $('#dateRange').val());
    });
    
    $('#resetFilter').on('click', function() {
        // Reset functionality here
        $('#dateRange').val('');
        alert('Filters have been reset');
    });
    
    // Add tooltip initialization
    $('[data-bs-toggle="tooltip"]').tooltip();
    
    // Handle dropdown menu behavior
    $('.dropdown-toggle').dropdown();
    
    // Add confirmation for delete actions
    $('.btn-delete').on('click', function(e) {
        if (!confirm('Are you sure you want to delete this item?')) {
            e.preventDefault();
        }
    });
});
