@extends('layouts.app')

@section('title', 'Bookings - GO Hotel Admin')

@section('page-title', 'Bookings')
@section('page-subtitle', 'Manage all hotel bookings')

@push('scripts')
<script>
    const bookingData = @json($bookings);
</script>

<script src="{{ asset('js/booking.js?time=') }}<?php echo time();?>"></script>
@endpush


@section('content')
<div class="row mb-4">
    <div class="col-md-6">
        <h4>All Bookings</h4>
    </div>
    <div class="col-md-6 text-md-end">
        <a href="{{ route('bookings.create') }}" class="btn btn-sm btn-dark rounded-80">
            <i class="fas fa-plus-circle"></i> Add New Booking
        </a>
    </div>
</div>

<div class="card">
    <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="show-entries">
                <label for="entriesSelect">Show</label>
                <select id="entriesSelect" class="entries-select">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="-1">All</option>
                </select>
                <span class="entries-text">entries per page</span>
            </div>
            <div class="calendar-booking">
                <button class="calendar-icon" onclick="showCalendarbooking()">
                    <i class="fas fa-calendar-alt"></i>
                </button>
            </div>
            <div class="search-box">
                <input type="text" id="searchInput" class="search-input" placeholder="Search bookings...">
                <span class="search-clear" title="Clear search"><i class="fas fa-times"></i></span>
            </div>
        </div>

        <div class="table-responsive">
            <table class="table table-hover" id="bookingsTable">
                <thead>
                    <tr>
                        <th class="sortable" data-sort="id">ID <i class="fas fa-sort"></i></th>
                        <th class="sortable" data-sort="guest">Guest <i class="fas fa-sort"></i></th>
                        <th class="sortable" data-sort="room">Room <i class="fas fa-sort"></i></th>
                        <th class="sortable" data-sort="dates">Dates <i class="fas fa-sort"></i></th>
                        <th class="sortable" data-sort="channel">Channel <i class="fas fa-sort"></i></th>
                        <th class="sortable" data-sort="status">Status <i class="fas fa-sort"></i></th>
                        <th class="sortable" data-sort="total">Total <i class="fas fa-sort"></i></th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($bookings as $booking)
                        <tr>
                            <td>{{ $booking->id }}</td>
                            <td>
                                <div class="fw-bold">{{ $booking->full_name }}</div>
                                @if($booking->phone)
                                    <div class="small text-muted">☎ {{ $booking->phone }}</div>
                                @endif
                                @if($booking->user_line_id)
                                    <div class="small text-muted">
                                        <i class="fab fa-line text-success"></i>
                                        {{ Str::limit($booking->user_line_id, 15) }}
                                    </div>
                                @endif
                            </td>
                            <td>
                                @if($booking->room)
                                    <div>{{ $booking->room->name }}</div>
                                    <div class="small text-muted">{{ $booking->room->branch->name ?? 'N/A' }}</div>
                                    <div class="small">{{ $booking->room_count }} room(s)</div>
                                @else
                                    <span class="text-muted">Room not available</span>
                                @endif
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="me-2">
                                        <i class="far fa-calendar-check text-success"></i>
                                    </div>
                                    <div>
                                        <div>{{ \Carbon\Carbon::parse($booking->check_in)->format('M d, Y') }}</div>
                                        <div class="small text-muted">to</div>
                                        <div>{{ \Carbon\Carbon::parse($booking->check_out)->format('M d, Y') }}</div>
                                        <div class="small">
                                            @php
                                                $nights = \Carbon\Carbon::parse($booking->check_in)->diffInDays(
                                                    \Carbon\Carbon::parse($booking->check_out),
                                                );
                                            @endphp
                                            {{ $nights }} {{ Str::plural('night', $nights) }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                @if($booking->channel)
                                    <div class="channel-icon-container">
                                        @switch(strtolower($booking->channel))
                                            @case('agoda')
                                                <div class="channel-icon-wrapper bg-light">
                                                    <img src="{{ asset('images/channels/agoda.png') }}" alt="Agoda" class="channel-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                                    <span class="channel-icon-fallback" style="display:none;">
                                                        <i class="fas fa-hotel text-primary"></i>
                                                    </span>
                                                </div>
                                                <span class="ms-2 small">Agoda</span>
                                                @break
                                            @case('booking.com')
                                                <div class="channel-icon-wrapper bg-light">
                                                    <img src="{{ asset('images/channels/booking.png') }}" alt="Booking.com" class="channel-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                                    <span class="channel-icon-fallback" style="display:none;">
                                                        <i class="fas fa-hotel text-primary"></i>
                                                    </span>
                                                </div>
                                                <span class="ms-2 small">Booking.com</span>
                                                @break
                                            @case('expedia')
                                                <div class="channel-icon-wrapper bg-light">
                                                    <img src="{{ asset('images/channels/expedia.png') }}" alt="Expedia" class="channel-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                                    <span class="channel-icon-fallback" style="display:none;">
                                                        <i class="fas fa-suitcase text-warning"></i>
                                                    </span>
                                                </div>
                                                <span class="ms-2 small">Expedia</span>
                                                @break
                                            @case('traveloka')
                                                <div class="channel-icon-wrapper bg-light">
                                                    <img src="{{ asset('images/channels/traveloka.png') }}" alt="Traveloka" class="channel-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                                    <span class="channel-icon-fallback" style="display:none;">
                                                        <i class="fas fa-plane text-info"></i>
                                                    </span>
                                                </div>
                                                <span class="ms-2 small">Traveloka</span>
                                                @break
                                            @case('trip.com')
                                                <div class="channel-icon-wrapper bg-light">
                                                    <img src="{{ asset('images/channels/trip.png') }}" alt="Trip.com" class="channel-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                                    <span class="channel-icon-fallback" style="display:none;">
                                                        <i class="fas fa-globe text-primary"></i>
                                                    </span>
                                                </div>
                                                <span class="ms-2 small">Trip.com</span>
                                                @break
                                            @case('direct')
                                                <div class="channel-icon-direct">
                                                    <i class="fas fa-globe"></i>
                                                </div>
                                                <span class="ms-2 small">Direct</span>
                                                @break
                                            @case('phone')
                                                <div class="channel-icon-phone">
                                                    <i class="fas fa-phone-alt"></i>
                                                </div>
                                                <span class="ms-2 small">Phone</span>
                                                @break
                                            @case('line')
                                                <div class="channel-icon-line">
                                                    <i class="fab fa-line"></i>
                                                </div>
                                                <span class="ms-2 small">Line</span>
                                                @break
                                            @default
                                                <div class="channel-icon-default">
                                                    <i class="fas fa-question"></i>
                                                </div>
                                                <span class="ms-2 small">{{ $booking->channel }}</span>
                                        @endswitch
                                    </div>
                                @else
                                    <span class="text-muted small">Not specified</span>
                                @endif
                            </td>
                            <td>
                                @if($booking->status == 'confirmed')
                                    <span class="badge bg-success">Confirmed</span>
                                @elseif($booking->status == 'pending')
                                    <span class="badge bg-warning text-dark">Pending</span>
                                @elseif($booking->status == 'canceled' || $booking->status == 'cancelled')
                                    <span class="badge bg-danger">Cancelled</span>
                                @elseif($booking->status == 'waiting_payment')
                                    <span class="badge bg-info">Awaiting Payment</span>
                                @elseif($booking->status == 'completed')
                                    <span class="badge bg-secondary">Completed</span>
                                @else
                                    <span class="badge bg-secondary">{{ ucfirst($booking->status ?? 'Unknown') }}</span>
                                @endif
                                <div class="small text-muted mt-1">{{ $booking->created_at->format('M d, Y') }}</div>
                            </td>
                            <td>
                                @php
                                    $checkIn = \Carbon\Carbon::parse($booking->check_in);
                                    $checkOut = \Carbon\Carbon::parse($booking->check_out);
                                    $nights = $checkIn->diffInDays($checkOut);
                                    $pricePerNight = $booking->room->price_per_night ?? 0;
                                    $roomCount = $booking->room_count ?? 1;
                                    $totalPrice = $pricePerNight * $nights * $roomCount;
                                @endphp
                                <div class="fw-bold">฿{{ number_format($totalPrice, 2) }}</div>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <a href="{{ route('bookings.show', $booking) }}" class="btn btn-outline-primary view-btn" 
                                       title="View Details">
                                        <i class="fi fi-rr-search"></i>
                                    </a>
                                    <a href="{{ route('bookings.edit', $booking) }}" class="btn btn-outline-primary edit-btn"
                                       title="Edit Booking">
                                        <i class="fi fi-rr-edit"></i>
                                    </a>
                                    <button type="submit" class="btn btn-outline-danger delete-btn delete-branch-btn" title="Delete"
                                        onclick="event.preventDefault(); if(confirm('Are you sure you want to delete this booking?')) document.getElementById('delete-booking-{{ $booking->id }}').submit();">
                                        <i class="fas fa-times"></i>
                                    </button>
                                    <form id="delete-booking-{{ $booking->id }}" action="{{ route('bookings.destroy', $booking) }}" method="POST" style="display: none;">
                                        @csrf
                                        @method('DELETE')
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3">
            <div class="show-entries">
                Showing <span id="showingStart">1</span> to <span id="showingEnd">{{ count($bookings) }}</span> of <span id="totalEntries">{{ count($bookings) }}</span> entries
            </div>
            <nav aria-label="Page navigation">
                <ul class="pagination custom-pagination mb-0">
                    <li class="page-item {{ count($bookings) <= 10 ? 'disabled' : '' }}">
                        <a class="page-link prev-page" href="#" aria-label="Previous">
                            <i class="fas fa-chevron-left"></i>
                        </a>
                    </li>
                
                    <li class="page-item active">
                        <a class="page-link page-number" data-page="0" href="#">1</a>
                    </li>
                
                    <li class="page-item {{ count($bookings) <= 10 ? 'disabled' : '' }}">
                        <a class="page-link next-page" href="#" aria-label="Next">
                            <i class="fas fa-chevron-right"></i>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
</div>
@endsection

@section('styles')
<style>
    .show-entries {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .entries-select {
        padding: 4px 8px;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        background-color: white;
    }

    /* Sortable Table Styles */
    .sortable {
        cursor: pointer;
        position: relative;
    }
    
    .sortable i.fas {
        font-size: 12px;
        margin-left: 5px;
        color: #ccc;
    }
    
    .sortable.sort-asc i.fas:before {
        content: "\f0de";
        color: #007bff;
    }
    
    .sortable.sort-desc i.fas:before {
        content: "\f0dd";
        color: #007bff;
    }

    /* Channel Icon Styles */
    .channel-icon-container {
        display: flex;
        align-items: center;
    }
    
    .channel-icon-wrapper {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        overflow: hidden;
        background-color: transparent !important;
    }
    
    .channel-icon {
        width: 24px;
        height: 24px;
        object-fit: contain;
    }
    
    .channel-icon-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f8f9fa;
    }
    
    .channel-icon-direct,
    .channel-icon-phone,
    .channel-icon-line,
    .channel-icon-default {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        font-size: 12px;
    }
    
    .channel-icon-direct {
        background-color: #e3f2fd;
        color: #1976d2;
    }
    
    .channel-icon-phone {
        background-color: #e8f5e9;
        color: #388e3c;
    }
    
    .channel-icon-line {
        background-color: #f1f8e9;
        color: #06c755;
    }
    
    .channel-icon-default {
        background-color: #f5f5f5;
        color: #757575;
    }

    /* Pagination Styles */
    .custom-pagination {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .custom-pagination .page-item .page-link {
        border-radius: 4px;
        color: #6c757d;
        padding: 6px 12px;
        font-size: 14px;
    }

    .custom-pagination .page-item.active .page-link {
        background-color: #c0e2f1;
        border-color: #007bff;
        color: black;
        font-weight: 500;
    }

    .custom-pagination .page-item.disabled .page-link {
        color: #ccc;
        pointer-events: none;
    }

    .badge {
        font-size: 0.75rem;
        padding: 0.35em 0.65em;
    }

    .table td {
        vertical-align: middle;
    }

    .btn-outline-secondary {
        --bs-btn-color: #6c757d;
        --bs-btn-border-color: #dee2e6;
        --bs-btn-hover-color: #fff;
        --bs-btn-hover-bg: #6c757d;
        --bs-btn-hover-border-color: #6c757d;
        --bs-btn-active-color: #fff;
        --bs-btn-active-bg: #6c757d;
        --bs-btn-active-border-color: #6c757d;
    }

    .d-flex.gap-1 {
        gap: 0.25rem !important;
    }

    .calendar-icon {
        background: none;
        border: none;
        color: #7ec3e3;
        font-size: 18px;
        cursor: pointer;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
    }

    .calendar-icon:hover {
        color: #333;
    }
</style>
@endsection

@section('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    let itemsPerPage = 10;
    let currentPage = 0;
    let filteredRows = [];
    let currentSort = {
        column: 'id',
        direction: 'desc'
    };
    
    const tableBody = document.querySelector('#bookingsTable tbody');
    const allRows = Array.from(tableBody.querySelectorAll('tr'));
    const totalRows = allRows.length;
    
    // Initialize sortable headers
    document.querySelectorAll('th.sortable').forEach(header => {
        header.addEventListener('click', function() {
            const column = this.getAttribute('data-sort');
            
            // Toggle direction if same column is clicked
            if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                currentSort.direction = 'asc';
            }
            
            // Update header classes
            document.querySelectorAll('th.sortable').forEach(th => {
                th.classList.remove('sort-asc', 'sort-desc');
            });
            
            this.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
            
            // Sort data and update table
            sortData();
            currentPage = 0;
            updateTable();
            updatePagination();
        });
    });
    
    // Sort data based on currentSort
    function sortData() {
        filteredRows.sort((a, b) => {
            let valA, valB;
            
            // Extract values based on column
            switch(currentSort.column) {
                case 'id':
                    valA = parseInt(a.querySelector('td:nth-child(1)').textContent.trim()) || 0;
                    valB = parseInt(b.querySelector('td:nth-child(1)').textContent.trim()) || 0;
                    break;
                case 'guest':
                    valA = a.querySelector('td:nth-child(2)').textContent.trim().toLowerCase();
                    valB = b.querySelector('td:nth-child(2)').textContent.trim().toLowerCase();
                    break;
                case 'room':
                    valA = a.querySelector('td:nth-child(3)').textContent.trim().toLowerCase();
                    valB = b.querySelector('td:nth-child(3)').textContent.trim().toLowerCase();
                    break;
                case 'dates':
                    const dateA = a.querySelector('td:nth-child(4)').textContent.trim();
                    const dateB = b.querySelector('td:nth-child(4)').textContent.trim();
                    valA = new Date(dateA.split('\n')[0]);
                    valB = new Date(dateB.split('\n')[0]);
                    break;
                case 'channel':
                    valA = a.querySelector('td:nth-child(5)').textContent.trim().toLowerCase();
                    valB = b.querySelector('td:nth-child(5)').textContent.trim().toLowerCase();
                    break;
                case 'status':
                    valA = a.querySelector('td:nth-child(6)').textContent.trim().toLowerCase();
                    valB = b.querySelector('td:nth-child(6)').textContent.trim().toLowerCase();
                    break;
                case 'total':
                    valA = parseFloat(a.querySelector('td:nth-child(7)').textContent.replace(/[^0-9.-]+/g, '')) || 0;
                    valB = parseFloat(b.querySelector('td:nth-child(7)').textContent.replace(/[^0-9.-]+/g, '')) || 0;
                    break;
                default:
                    valA = a.querySelector('td:nth-child(1)').textContent.trim().toLowerCase();
                    valB = b.querySelector('td:nth-child(1)').textContent.trim().toLowerCase();
            }
            
            // Compare values
            if (valA < valB) {
                return currentSort.direction === 'asc' ? -1 : 1;
            }
            if (valA > valB) {
                return currentSort.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        // Filter rows based on search term
        filteredRows = allRows.filter(row => {
            const text = row.textContent.toLowerCase();
            return text.includes(searchTerm);
        });
        
        // Apply current sort
        sortData();
        
        currentPage = 0; // Reset to first page
        updateTable();
        updatePagination();
    });

    // Initialize
    filteredRows = [...allRows];
    sortData(); // Apply initial sort
    updateTable();
    updatePagination();

    // Entries per page handling
    document.getElementById('entriesSelect').addEventListener('change', function(e) {
        const newItemsPerPage = parseInt(e.target.value);
        itemsPerPage = newItemsPerPage === -1 ? filteredRows.length : newItemsPerPage;
        currentPage = 0; // Reset to first page
        updateTable();
        updatePagination();
    });

    // Pagination click handlers
    document.querySelector('.prev-page').addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage > 0) {
            currentPage--;
            updateTable();
            updatePagination();
        }
    });

    document.querySelector('.next-page').addEventListener('click', function(e) {
        e.preventDefault();
        const maxPage = Math.ceil(filteredRows.length / itemsPerPage) - 1;
        if (currentPage < maxPage) {
            currentPage++;
            updateTable();
            updatePagination();
        }
    });

    // Update table content
    function updateTable() {
        const start = currentPage * itemsPerPage;
        const end = Math.min(start + itemsPerPage, filteredRows.length);
        
        // Clear table
        tableBody.innerHTML = '';
        
        // Add visible rows
        for (let i = start; i < end; i++) {
            tableBody.appendChild(filteredRows[i].cloneNode(true));
        }
        
        // Update counter
        document.getElementById('showingStart').textContent = filteredRows.length ? start + 1 : 0;
        document.getElementById('showingEnd').textContent = end;
        document.getElementById('totalEntries').textContent = filteredRows.length;
    }

    // Update pagination buttons
    function updatePagination() {
        const prevButton = document.querySelector('.prev-page');
        const nextButton = document.querySelector('.next-page');
        const pageNumbers = document.querySelector('.pagination');
        const maxPage = Math.ceil(filteredRows.length / itemsPerPage) - 1;

        // Update prev/next buttons
        prevButton.parentElement.classList.toggle('disabled', currentPage === 0);
        nextButton.parentElement.classList.toggle('disabled', currentPage >= maxPage);

        // Update page numbers
        const pageNumbersHtml = [];
        for (let i = 0; i <= maxPage; i++) {
            if (
                i === 0 || // First page
                i === maxPage || // Last page
                (i >= currentPage - 1 && i <= currentPage + 1) // Pages around current
            ) {
                pageNumbersHtml.push(`
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link page-number" href="#" data-page="${i}">${i + 1}</a>
                    </li>
                `);
            } else if (
                (i === currentPage - 2 && currentPage > 2) ||
                (i === currentPage + 2 && currentPage < maxPage - 2)
            ) {
                pageNumbersHtml.push(`
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `);
            }
        }

        // Insert page numbers
        const paginationHtml = `
            <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
                <a class="page-link prev-page" href="#" aria-label="Previous">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
            ${pageNumbersHtml.join('')}
            <li class="page-item ${currentPage >= maxPage ? 'disabled' : ''}">
                <a class="page-link next-page" href="#" aria-label="Next">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;
        pageNumbers.innerHTML = paginationHtml;

        // Add click handlers for page numbers
        document.querySelectorAll('.page-number').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                currentPage = parseInt(this.dataset.page);
                updateTable();
                updatePagination();
            });
        });

        // Reattach prev/next click handlers
        document.querySelector('.prev-page').addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage > 0) {
                currentPage--;
                updateTable();
                updatePagination();
            }
        });

        document.querySelector('.next-page').addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage < maxPage) {
                currentPage++;
                updateTable();
                updatePagination();
            }
        });
    }
});
</script>
@endsection