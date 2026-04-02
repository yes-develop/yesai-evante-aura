$(document).ready(function() {
    // Initialize DataTable with custom options
    var branchesTable = $('#branchesTable').DataTable({
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100, -1],
        searching: true,
        ordering: true,
        info: true,
        responsive: true,
        dom: 't<"d-none"lip>', // Hide default controls as we're using custom ones
        language: {
            search: "",
            searchPlaceholder: "Search branches..."
        },
        order: [[0, 'desc']], // Sort by first column (ID) in descending order
        columnDefs: [
            { targets: 0, type: 'num' } // Ensure ID column is treated as number for proper sorting
        ]
    });

    // Custom entries dropdown
    $('#entriesSelect').on('change', function() {
        const val = $(this).val();
        branchesTable.page.len(val).draw();
        updateEntriesInfo();
    });

    // Custom search input - Fix to ensure search works properly
    $('#searchInput').on('keyup', function() {
        // Ensure we're searching properly
        branchesTable.search($(this).val()).draw();
        updateEntriesInfo();
    });

    // Add focus and blur events to show when search is active
    $('#searchInput').on('focus', function() {
        $(this).closest('.search-box').addClass('search-active');
    }).on('blur', function() {
        if (!$(this).val()) {
            $(this).closest('.search-box').removeClass('search-active');
        }
    });

    // Clear search when clicking the X button
    $(document).on('click', '.search-clear', function() {
        $('#searchInput').val('').trigger('keyup').focus();
    });

    // Update entries info text
    function updateEntriesInfo() {
        const info = branchesTable.page.info();
        $('#showingStart').text(info.start + 1);
        $('#showingEnd').text(info.end);
        $('#totalEntries').text(info.recordsDisplay);
    }

    // Handle custom pagination
    function setupPagination() {
        const info = branchesTable.page.info();
        
        // Clear existing pagination
        $('.custom-pagination').empty();
        
        // Previous button
        $('.custom-pagination').append(`
            <li class="page-item ${info.page === 0 ? 'disabled' : ''}">
                <a class="page-link prev-page" href="#" aria-label="Previous">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `);
        
        // Page numbers
        const totalPages = info.pages;
        const currentPage = info.page;
        
        // Show a limited range of pages
        let startPage = Math.max(0, currentPage - 2);
        let endPage = Math.min(totalPages - 1, currentPage + 2);
        
        // Always show at least 5 pages if available
        if (endPage - startPage < 4 && totalPages > 5) {
            if (startPage === 0) {
                endPage = Math.min(4, totalPages - 1);
            } else if (endPage === totalPages - 1) {
                startPage = Math.max(0, totalPages - 5);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            $('.custom-pagination').append(`
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link page-number" data-page="${i}" href="#">${i + 1}</a>
                </li>
            `);
        }
        
        // Next button
        $('.custom-pagination').append(`
            <li class="page-item ${info.page === info.pages - 1 ? 'disabled' : ''}">
                <a class="page-link next-page" href="#" aria-label="Next">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `);
        
        // Attach event handlers
        $('.page-number').on('click', function(e) {
            e.preventDefault();
            const page = $(this).data('page');
            branchesTable.page(page).draw('page');
            updateEntriesInfo();
            setupPagination();
        });
        
        $('.prev-page').on('click', function(e) {
            e.preventDefault();
            if (info.page > 0) {
                branchesTable.page('previous').draw('page');
                updateEntriesInfo();
                setupPagination();
            }
        });
        
        $('.next-page').on('click', function(e) {
            e.preventDefault();
            if (info.page < info.pages - 1) {
                branchesTable.page('next').draw('page');
                updateEntriesInfo();
                setupPagination();
            }
        });
    }

    // Add confirmation for delete actions
    $('.delete-branch-btn').on('click', function(e) {
        e.preventDefault();
        const branchId = $(this).data('id');
        
        if (confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
            $(`#delete-form-${branchId}`).submit();
        }
    });

    // Initialize custom controls
    updateEntriesInfo();
    setupPagination();
    
    // Add event listener for page draw
    branchesTable.on('draw', function() {
        setupPagination();
        updateEntriesInfo();
    });
}); 