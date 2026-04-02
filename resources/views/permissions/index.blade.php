@extends('layouts.app')

@section('title', 'Permissions - GO Hotel Admin')

@section('page-title', 'Permissions')
@section('page-subtitle', 'Manage all user permissions')

@section('content')
<div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">Manage User Permissions (RBCA)</h2>
        <input type="text" class="form-control" id="user-search" placeholder="Search users..." style="max-width: 300px;">
    </div>
    <div class="card shadow-sm rounded-4 p-3">
        <table class="table align-middle mb-0">
            <thead class="table-light rounded-3">
                <tr>
                    <th class="text-center">#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th class="text-center">Action</th>
                </tr>
            </thead>
            <tbody id="user-table-body">
                @foreach($users as $index => $user)
                <tr class="user-row">
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="fw-semibold">{{ $user->name }}</td>
                    <td class="text-muted">{{ $user->email }}</td>
                    <form action="{{ route('user.permissions.update', $user->id) }}" method="POST" class="d-inline">
                        @csrf
                        @method('PUT')
                        <td>
                            <select name="role" class="form-select rounded-pill">
                                <option value="admin" @if($user->role == 'admin') selected @endif>Admin</option>
                                <option value="sales" @if($user->role == 'sales') selected @endif>Sales</option>
                            </select>
                        </td>
                        <td class="text-center">
                            <button type="submit" class="btn btn-sm btn-success rounded-pill px-3">Update</button>
                    </form>
                            <form action="{{ route('user.permissions.destroy', $user->id) }}" method="POST" class="d-inline">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-sm btn-danger rounded-pill ms-2 px-3" onclick="return confirm('Are you sure you want to delete this user?')">Delete</button>
                            </form>
                        </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>

<style>
    .card {
        border-radius: 18px;
        border: none;
        background: #fff;
    }
    .table {
        border-radius: 12px;
        overflow: hidden;
    }
    .table thead th {
        background: #f8f9fa;
        border-bottom: 2px solid #e9ecef;
        font-weight: 600;
        font-size: 1rem;
    }
    .table tbody tr {
        transition: background 0.15s;
    }
    .table tbody tr:hover {
        background: #f6f8fa;
    }
    .form-select, .form-control {
        border-radius: 20px;
    }
    .btn-success {
        background: #185a9d;
        border: none;
    }
    .btn-success:hover {
        background: #0d3c6e;
    }
    .btn-warning {
        background: #ffe600;
        color: #222;
        border: none;
    }
    .btn-warning:hover {
        background: #ffe600cc;
        color: #222;
    }
    .btn-danger {
        background: #e74a3b;
        border: none;
    }
    .btn-danger:hover {
        background: #c0392b;
    }
</style>
<script>
    // Simple search filter for users
    document.getElementById('user-search').addEventListener('input', function() {
        var val = this.value.toLowerCase();
        document.querySelectorAll('.user-row').forEach(function(row) {
            var text = row.innerText.toLowerCase();
            row.style.display = text.includes(val) ? '' : 'none';
        });
    });
</script>
@endsection