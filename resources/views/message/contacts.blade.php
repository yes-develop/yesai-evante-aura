@extends('layouts.app')

@section('page-title', 'Contacts')
@section('page-subtitle', 'View all contacts')

@section('content')
<div class="d-flex">

    <!-- Main content -->
    <div class="flex-grow-1">
        <div class="container-fluid">
            <div class="card">
                <div class="card-header">
                    <h4 class="mb-0">Contact List</h4>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table custom-table">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th>Profile</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Channel</th>
                                    <th>Labels</th>
                                    <th>Unread</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Note</th>
                                    <th>Created</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                            @foreach(array_reverse($contacts) as $index => $contact)
                                    <tr>
                                        <td>{{ count($contacts) - $index }}</td>
                                        <td>
                                            @if($contact['profile image'])
                                                <img src="{{ $contact['profile image'] }}" alt="Profile" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">
                                            @else
                                                <div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                                    <i class="fi fi-tr-user"></i>
                                                </div>
                                            @endif
                                        </td>
                                        <td>{{ $contact['profile name'] }}</td>
                                        <td>
                                            <span class="badge rounded-pill bg-light text-dark">
                                                {{ $contact['status'] }}
                                            </span>
                                        </td>
                                        <td>{{ $contact['messagechannel'] }}</td>
                                        <td>
                                            @php
                                                $labels = explode(',', $contact['label']);
                                            @endphp
                                            @foreach($labels as $label)
                                                @if(trim($label))
                                                    <span class="badge rounded-pill mb-1" style="background-color: {{ $contact['color'] ?? '#6c757d' }}">
                                                        <i class="fas fa-circle me-1" style="font-size: 8px;"></i>
                                                        {{ trim($label) }}
                                                    </span>
                                                @endif
                                            @endforeach
                                        </td>
                                        <td>
                                            @if($contact['unreadchat'] > 0)
                                                <span class="badge bg-danger rounded-pill">{{ $contact['unreadchat'] }}</span>
                                            @else
                                                <span class="badge bg-secondary rounded-pill">0</span>
                                            @endif
                                        </td>
                                        <td>{{ $contact['phone'] }}</td>
                                        <td>{{ $contact['email'] }}</td>
                                        <td>{{ $contact['note'] }}</td>
                                        <td>{{ $contact['create date'] }}</td>
                                        <td></td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.table th {
    white-space: nowrap;
    border-bottom: 2px solid #e9ecef !important;
    color: #6c757d;
    font-weight: 600;
    padding: 1rem;
}

.custom-table {
    border-collapse: separate;
    border-spacing: 0;
}

.custom-table td {
    border-bottom: 1px solid #f1f1f1;
    padding: 1rem;
    vertical-align: middle;
}

.custom-table tbody tr:hover {
    background-color: #f8f9fa;
}

.badge {
    font-weight: 500;
}

td .badge {
    display: inline-block;
    margin-right: 4px;
}

.badge .fas {
    display: inline-block;
    vertical-align: middle;
    margin-top: -2px;
}

.card {
    border: none;
    box-shadow: 0 0 20px rgba(0,0,0,0.05);
}

.card-header {
    background-color: white;
    border-bottom: 1px solid #f1f1f1;
    padding: 1rem;
}

.table-responsive {
    border-radius: 0.5rem;
}

/* Message sidebar specific styles */
.d-flex {
    display: flex;
}

.flex-grow-1 {
    flex-grow: 1;
    min-width: 0;
    overflow-x: auto;
}

.container-fluid {
    padding: 0rem;
}

.card-body{
    flex: 1 1 auto !important;
    padding: 0px !important;
}

/* --- Responsive --- */
@media (max-width: 992px) {
    .container-fluid {
        padding: 0;
    }

    .card-header {
        padding: 0.75rem 1rem;
    }

    .card-header h4 {
        font-size: 1.1rem;
    }

    .custom-table td,
    .table th {
        padding: 0.6rem 0.5rem;
        font-size: 13px;
    }

    /* Hide less important columns on tablet */
    .custom-table th:nth-child(6),
    .custom-table td:nth-child(6),
    .custom-table th:nth-child(9),
    .custom-table td:nth-child(9),
    .custom-table th:nth-child(10),
    .custom-table td:nth-child(10) {
        display: none;
    }
}

@media (max-width: 576px) {
    .card {
        border-radius: 0;
        box-shadow: none;
    }

    .custom-table td,
    .table th {
        padding: 0.5rem 0.4rem;
        font-size: 12px;
    }

    /* Hide more columns on mobile — keep: #, Profile, Name, Status, Unread, Created */
    .custom-table th:nth-child(5),
    .custom-table td:nth-child(5),
    .custom-table th:nth-child(6),
    .custom-table td:nth-child(6),
    .custom-table th:nth-child(8),
    .custom-table td:nth-child(8),
    .custom-table th:nth-child(9),
    .custom-table td:nth-child(9),
    .custom-table th:nth-child(10),
    .custom-table td:nth-child(10) {
        display: none;
    }

    .custom-table td img,
    .custom-table td .rounded-circle {
        width: 32px !important;
        height: 32px !important;
    }
}
</style>

@push('scripts')
<script src="https://kit.fontawesome.com/your-font-awesome-kit.js"></script>
@endpush
@endsection
