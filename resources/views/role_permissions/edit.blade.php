@extends('layouts.app')

@section('title', 'Role Permissions - GO Hotel Admin')

@section('page-title', 'Role Permissions')
@section('page-subtitle', 'Manage all role permissions')

@section('content')
<div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold">Edit Role Permissions</h2>
        <div>
            <a href="{{ url()->previous() }}" class="btn btn-secondary rounded-pill">Back</a>
        </div>
    </div>
    <div class="card shadow-sm rounded-4 p-4" style="max-width: 700px; margin: 0 auto;">
        <form action="{{ route('role_permissions.update', $role) }}" method="POST">
            @csrf
            <div class="mb-4">
                <label for="role" class="form-label fw-semibold">Role</label>
                <select name="role" id="role" class="form-select rounded-pill" onchange="location = '/role-permissions/' + this.value + '/edit'">
                    @foreach($roles as $r)
                        <option value="{{ $r }}" {{ $role == $r ? 'selected' : '' }}>{{ ucfirst($r) }}</option>
                    @endforeach
                </select>
            </div>
            <div class="mb-4">
                <label class="form-label fw-semibold">Permissions</label>
                <div class="row g-3">
                    @foreach($allPermissions as $perm)
                        <div class="col-md-4 col-6">
                            <div class="form-check form-switch">
                                <input type="checkbox" name="permissions[]" value="{{ $perm }}" id="perm_{{ $perm }}" class="form-check-input" {{ in_array($perm, $permissions) ? 'checked' : '' }}>
                                <label for="perm_{{ $perm }}" class="form-check-label">{{ ucfirst($perm) }}</label>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
            <div class="d-flex justify-content-end gap-2">
                <button type="submit" class="btn btn-success rounded-pill px-4">Update Permissions</button>
            </div>
        </form>
    </div>
</div>

<style>
    .card {
        border-radius: 18px;
        border: none;
        background: #fff;
    }
    .form-check-input:checked {
        background-color: #185a9d;
        border-color: #185a9d;
    }
    .form-check-input {
        width: 2.2em;
        height: 1.2em;
        margin-right: 0.5em;
        cursor: pointer;
    }
    .form-check-label {
        cursor: pointer;
        font-weight: 500;
    }
    .btn-success {
        background: #185a9d;
        border: none;
    }
    .btn-success:hover {
        background: #0d3c6e;
    }
    .btn-secondary {
        background: #f6f8fa;
        color: #222;
        border: none;
    }
    .btn-secondary:hover {
        background: #e9ecef;
        color: #222;
    }
</style>
@endsection