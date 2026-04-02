@extends('layouts.app')

@section('title', 'Branches - GO Hotel Admin')

@section('page-title', 'Branches')
@section('page-subtitle', 'Manage all hotel branches')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <h5 class="mb-0">All Branches</h5>
    <a href="{{ route('branches.create') }}" class="btn btn-sm btn-dark rounded-80">
        <i class="fas fa-plus-circle me-1"></i> Add New Branch
    </a>
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
                <input type="text" id="searchInput" class="search-input" placeholder="Search branches...">
                <span class="search-clear" title="Clear search"><i class="fas fa-times"></i></span>
            </div>
        </div>

        <div class="table-responsive">
            <table class="table table-hover" id="branchesTable">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Rooms</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($branches as $branch)
                    <tr>
                        <td>{{ $branch->id }}</td>
                        <td>
                            @if($branch->image)
                            <img src="{{ \App\Helpers\ImageHelper::getImageUrl($branch->image) }}" alt="{{ $branch->name }}" class="img-thumbnail" style="max-height: 50px; max-width: 100px;">
                            @else
                            <div class="bg-secondary text-white rounded p-2 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                <i class="fas fa-hotel"></i>
                            </div>
                            @endif
                        </td>
                        <td>{{ $branch->name }}</td>
                        <td>{{ $branch->location ?? 'N/A' }}</td>
                        <td>{{ $branch->rooms->count() }}</td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <a href="{{ route('branches.show', $branch) }}" class="btn btn-outline-primary view-btn" title="View">
                                    <i class="fi fi-rr-search"></i>
                                </a>
                                <a href="{{ route('branches.edit', $branch) }}" class="btn btn-outline-primary edit-btn" title="Edit">
                                    <i class="fi fi-rr-edit"></i>
                                </a>
                                <button type="submit" class="btn btn-outline-danger delete-btn delete-branch-btn" data-id="{{ $branch->id }}" title="Delete">
                                    <i class="fas fa-times"></i>
                                </button>
                                <form id="delete-form-{{ $branch->id }}" action="{{ route('branches.destroy', $branch) }}" method="POST" style="display: none;">
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
                Showing <span id="showingStart">1</span> to <span id="showingEnd">10</span> of <span id="totalEntries">{{ count($branches) }}</span> entries
            </div>
            <nav aria-label="Page navigation">
                <ul class="pagination custom-pagination mb-0">
                    <!-- Pagination will be dynamically inserted by JavaScript -->
                </ul>
            </nav>
        </div>
    </div>
</div>
@endsection

@section('styles')
<style>
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
    
    /* Action Button Styles */
    .btn-group-sm .btn {
        transition: all 0.2s ease;
    }
    
    .btn-group-sm .view-btn {
        border-top-left-radius: 8px !important;
        border-bottom-left-radius: 8px !important;
        border-top-right-radius: 8px !important;
        border-bottom-right-radius: 8px !important;
    }
    
    .btn-group-sm .edit-btn {
        border-radius: 8px !important;
    }
    
    .btn-group-sm .delete-btn {
        border-top-right-radius: 8px !important;
        border-bottom-right-radius: 8px !important;
        border-top-left-radius: 8px !important;
        border-bottom-left-radius: 8px !important;
    }
    
    .btn-group-sm .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 1;
    }
</style>
@endsection

@section('scripts')
<script src="{{ asset('js/branch-list.js?time=') }}<?php echo time();?>"></script>
<script>
    // Handle delete confirmation with custom styling
    $(document).ready(function() {
        $('.delete-branch-btn').on('click', function(e) {
            e.preventDefault();
            const branchId = $(this).data('id');

            if (confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
                $(`#delete-form-${branchId}`).submit();
            }
        });
    });
</script>
@endsection