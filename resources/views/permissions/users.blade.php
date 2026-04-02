@extends('layouts.app')

@section('title', 'Permissions - GO Hotel Admin')

@section('page-title', 'Permissions')
@section('page-subtitle', 'Manage all user permissions')

@section('content')
<div class="container">
    <h2>Manage Users</h2>

    <div class="card mb-4">
        <div class="card-header">
            <h3 class="card-title">Create New User</h3>
        </div>
        <div class="card-body">
            <form action="/store-user" method="POST">
                @csrf
                <div class="row mb-3">
                    <div class="col-md-4">
                        <label for="name" class="form-label">Name</label>
                        <input type="text" id="name" name="name" class="form-control" placeholder="Full Name" required>
                    </div>
                    <div class="col-md-4">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" id="email" name="email" class="form-control" placeholder="Email Address" required>
                    </div>
                    <div class="col-md-4">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" id="password" name="password" class="form-control" placeholder="Password" required>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-4">
                        <label for="role" class="form-label">Role</label>
                        <select name="role" id="role" class="form-select">
                            <option value="admin">Admin</option>
                            <option value="sales" selected>Sales</option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <button type="submit" class="btn btn-primary">Create User</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <div class="card mb-4">
        <div class="card-header">
            <h3 class="card-title">Edit Role Permissions</h3>
        </div>
        <div class="card-body">
            <form action="{{ route('role.permissions.save') }}" method="POST">
                @csrf

                <div class="mb-3">
                    <label class="form-label">Role</label>
                    <select name="role" id="role_select" class="form-select">
                        @php
                        $roles = DB::table('role_permissions')->select('role')->distinct()->get();
                        $selectedRole = request('role', $roles->first()->role ?? 'admin');

                        // Using the same permissions array as in PermissionController
                        $allPermissions = [
                            'dashboard',
                            'branches',
                            'rooms',
                            'bookings',
                            'broadcasts',
                            'analytics',
                            'automations',
                            'ai',
                            'messages',
                            'contacts'
                        ];

                        $rolePermissions = DB::table('role_permissions')
                        ->where('role', $selectedRole)
                        ->pluck('permission')
                        ->toArray();
                        @endphp

                        @foreach($roles as $roleOption)
                        <option value="{{ $roleOption->role }}" {{ $selectedRole == $roleOption->role ? 'selected' : '' }}>
                            {{ ucfirst($roleOption->role) }}
                        </option>
                        @endforeach
                    </select>
                </div>

                <div class="mb-3">
                    <label class="form-label">Permissions</label>
                    <div class="row">
                        @foreach($allPermissions as $perm)
                        <div class="col-md-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="permissions[]" 
                                    value="{{ $perm }}" id="perm_{{ $perm }}"
                                    {{ in_array($perm, $rolePermissions) ? 'checked' : '' }}>
                                <label class="form-check-label" for="perm_{{ $perm }}">
                                    {{ ucfirst($perm) }}
                                </label>
                            </div>
                        </div>
                        @endforeach
                    </div>
                </div>

                <div class="mb-3">
                    <button type="submit" class="btn btn-primary">Update Permissions</button>
                    <a href="{{ route('permissions.index') }}" class="btn btn-secondary">Back</a>
                </div>
            </form>
        </div>
    </div>

    <div class="card">
        <div class="card-header">
            <h3 class="card-title">Upload Profile Image</h3>
        </div>
        <div class="card-body">
            <form action="/upload-profile-image" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="user_id" class="form-label">Select User</label>
                        <select name="user_id" id="user_id" class="form-select">
                            @foreach(\App\Models\User::all() as $user)
                            <option value="{{ $user->id }}">{{ $user->name }} ({{ $user->email }})</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="profile_image" class="form-label">Profile Image</label>
                        <input type="file" id="profile_image" name="profile_image" class="form-control" accept="image/png, image/jpeg" required>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <button type="submit" class="btn btn-primary">Upload Image</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <div class="mt-4">
        <a href="{{ route('permissions.index') }}" class="btn btn-secondary">Back to Permissions</a>
    </div>
</div>

<script>
    document.getElementById('role_select').addEventListener('change', function() {
        // Redirect to the same page with the selected role as a query parameter
        window.location.href = '{{ request()->url() }}?role=' + this.value;
    });
</script>
@endsection