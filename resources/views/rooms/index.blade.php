@extends('layouts.app')

@section('title', 'Rooms - GO Hotel Admin')

@section('page-title', 'Rooms')
@section('page-subtitle', 'Manage all hotel rooms')

@section('content')
<div class="row mb-4">
    <div class="col-md-6">
        <h4>All Rooms</h4>
    </div>
    <div class="col-md-6 text-md-end">
        <a href="{{ route('rooms.create') }}" class="btn btn-sm btn-dark rounded-80">
            <i class="fas fa-plus-circle"></i> Add New Room
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
            <div class="search-box">
                <input type="text" id="searchInput" class="search-input" placeholder="Search rooms...">
                <span class="search-clear" title="Clear search"><i class="fas fa-times"></i></span>
            </div>
        </div>

        <div class="table-responsive">
            <table class="table table-hover" id="roomsTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Branch</th>
                        <th>Price</th>
                        <th>Discount</th>
                        <th>Bed Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($rooms as $room)
                    <tr>
                        <td>{{ $room->id }}</td>
                        <td>
                            @if($room->images->count() > 0)
                                @php
                                    $imagePath = $room->images->first()->image_url;
                                    if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                                        $imageSrc = $imagePath;
                                    } else {
                                        $imageSrc = asset('storage/' . $imagePath);
                                    }
                                @endphp
                                <div class="room-thumbnail-container">
                                    <img src="{{ $imageSrc }}" alt="{{ $room->name }}" class="room-thumbnail">
                                </div>
                            @else
                                <div class="room-image-placeholder">
                                    <i class="fas fa-bed"></i>
                                </div>
                            @endif
                        </td>
                        <td>{{ $room->name }}</td>
                        <td>{{ $room->branch->name ?? 'N/A' }}</td>
                        <td>฿{{ number_format($room->price_per_night, 2) }}</td>
                        <td>฿{{ number_format($room->discount, 2) }}</td>
                        <td>{{ $room->bed_type }}</td>
                        <td>
                            @if($room->status == 'available')
                                <span class="badge bg-success">Available</span>
                            @elseif($room->status == 'booked')
                                <span class="badge bg-warning">Booked</span>
                            @else
                                <span class="badge bg-danger">Unavailable</span>
                            @endif
                        </td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <a href="{{ route('rooms.show', $room) }}" class="btn btn-outline-primary view-btn" title="View">
                                    <i class="fi fi-rr-search"></i>
                                </a>
                                <a href="{{ route('rooms.edit', $room) }}" class="btn btn-outline-primary edit-btn" title="Edit">
                                    <i class="fi fi-rr-edit"></i>
                                </a>
                                <button type="submit" class="btn btn-outline-danger delete-btn delete-branch-btn" title="Delete"
                                    onclick="event.preventDefault(); if(confirm('Are you sure you want to delete this room?')) document.getElementById('delete-room-{{ $room->id }}').submit();">
                                    <i class="fas fa-times"></i>
                                </button>
                                <form id="delete-room-{{ $room->id }}" action="{{ route('rooms.destroy', $room) }}" method="POST" style="display: none;">
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
                Showing <span id="showingStart">1</span> to <span id="showingEnd">10</span> of <span id="totalEntries">{{ count($rooms) }}</span> entries
            </div>
            <nav aria-label="Page navigation">
                <ul class="pagination custom-pagination mb-0">
                    <li class="page-item disabled">
                        <a class="page-link prev-page" href="#" aria-label="Previous">
                            <i class="fas fa-chevron-left"></i>
                        </a>
                    </li>
                    
                    <li class="page-item active">
                        <a class="page-link page-number" href="#" data-page="0">1</a>
                    </li>
                    
                    <li class="page-item">
                        <a class="page-link page-number" href="#" data-page="1">2</a>
                    </li>
                    
                    <li class="page-item">
                        <a class="page-link page-number" href="#" data-page="2">3</a>
                    </li>
                    
                    <li class="page-item">
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
    .room-thumbnail-container {
        width: 60px;
        height: 45px;
        overflow: hidden;
        border-radius: 4px;
        background-color: #f8f9fa;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .room-thumbnail {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .room-image-placeholder {
        width: 60px;
        height: 45px;
        border-radius: 4px;
        background-color: #e9ecef;
        display: flex;
        align-items: center;
        justify-content: center;
    }

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

    .page-link:focus {
        box-shadow: none;
    }
</style>
@endsection

@section('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    let entriesPerPage = 10;
    let filteredData = [];
    const tableBody = document.querySelector('#roomsTable tbody');
    const originalRows = Array.from(tableBody.querySelectorAll('tr'));
    
    // Store the original table rows and use them without reordering
    // Data is already sorted from the server
    filteredData = [...originalRows]; // Create a shallow copy to avoid reference issues
    
    // Remove any initial DOM manipulation that causes flickering
    // Don't clear and repopulate the table here

    // Entries per page handling
    document.getElementById('entriesSelect').addEventListener('change', function(e) {
        entriesPerPage = parseInt(e.target.value);
        currentPage = 1;
        updateTable();
    });

    // Search functionality
    document.getElementById('searchInput').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filteredData = originalRows.filter(row => {
            return Array.from(row.cells).some(cell => 
                cell.textContent.toLowerCase().includes(searchTerm)
            );
        });
        currentPage = 1;
        updateTable();
    });

    // Clear search
    document.querySelector('.search-clear').addEventListener('click', function() {
        document.getElementById('searchInput').value = '';
        filteredData = [...originalRows]; // Use a copy rather than reference
        currentPage = 1;
        updateTable();
    });

    // Pagination controls
    document.querySelector('.prev-page').addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            updateTable();
        }
    });

    document.querySelector('.next-page').addEventListener('click', function(e) {
        e.preventDefault();
        const maxPage = Math.ceil(filteredData.length / entriesPerPage);
        if (currentPage < maxPage) {
            currentPage++;
            updateTable();
        }
    });
    
    // Page number clicks
    document.querySelectorAll('.page-number').forEach(function(pageLink) {
        pageLink.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute('data-page')) + 1;
            currentPage = page;
            updateTable();
        });
    });

    function updateTable() {
        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = Math.min(startIndex + entriesPerPage, filteredData.length);
        
        // Clear table without causing flickering
        // Detach from DOM first, then modify, then reattach
        const tempContainer = document.createDocumentFragment();
        
        // Add visible rows to the fragment
        for (let i = startIndex; i < endIndex; i++) {
            tempContainer.appendChild(filteredData[i].cloneNode(true));
        }
        
        // Clear and replace in a single operation
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }
        tableBody.appendChild(tempContainer);
        
        // Update showing entries text
        document.getElementById('showingStart').textContent = filteredData.length ? startIndex + 1 : 0;
        document.getElementById('showingEnd').textContent = endIndex;
        document.getElementById('totalEntries').textContent = filteredData.length;
        
        // Update pagination
        updatePagination();
    }

    function updatePagination() {
        const maxPage = Math.ceil(filteredData.length / entriesPerPage);
        
        // Update active page
        document.querySelectorAll('.page-number').forEach(function(pageLink) {
            const pageNum = parseInt(pageLink.getAttribute('data-page')) + 1;
            if (pageNum === currentPage) {
                pageLink.parentElement.classList.add('active');
            } else {
                pageLink.parentElement.classList.remove('active');
            }
        });
        
        // Previous button state
        if (currentPage === 1) {
            document.querySelector('.prev-page').parentElement.classList.add('disabled');
        } else {
            document.querySelector('.prev-page').parentElement.classList.remove('disabled');
        }
        
        // Next button state
        if (currentPage === maxPage) {
            document.querySelector('.next-page').parentElement.classList.add('disabled');
        } else {
            document.querySelector('.next-page').parentElement.classList.remove('disabled');
        }
    }

    // Delay initial table update slightly to ensure DOM is fully loaded
    setTimeout(() => {
        updateTable();
    }, 10);
});
</script>
@endsection