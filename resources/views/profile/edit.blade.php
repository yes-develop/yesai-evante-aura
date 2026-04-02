@extends('layouts.app')

@section('title', 'Edit Profile - GO Hotel Admin')

@section('page-title', 'Edit Profile')
@section('page-subtitle', 'Edit your profile information')

@section('content')
<div class="container">
    <h2>Edit Profile</h2>
    <div class="d-flex justify-content-center">
        <div class="profile-edit-card">
            <form action="{{ route('profile.update') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="mb-3 text-center">
                    <img src="{{ $user->profile_image ? asset('storage/' . $user->profile_image) : asset('images/default-profile.png') }}" class="rounded-circle mb-2" width="120" height="120" alt="Profile Image">
                </div>
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input type="text" name="name" id="name" class="form-control" value="{{ old('name', $user->name) }}" required>
                    @error('name')<div class="text-danger">{{ $message }}</div>@enderror
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" name="email" id="email" class="form-control" value="{{ old('email', $user->email) }}" required>
                    @error('email')<div class="text-danger">{{ $message }}</div>@enderror
                </div>
                <div class="mb-3">
                    <label for="profile_image" class="form-label">Profile Image</label>
                    <input type="file" name="profile_image" id="profile_image" class="form-control">
                    @error('profile_image')<div class="text-danger">{{ $message }}</div>@enderror
                </div>
                <div class="mb-3">
                    <label for="old_password" class="form-label">Old Password</label>
                    <input type="password" name="old_password" id="old_password" class="form-control" autocomplete="current-password">
                    @error('old_password')<div class="text-danger">{{ $message }}</div>@enderror
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">New Password</label>
                    <input type="password" name="password" id="password" class="form-control" autocomplete="new-password">
                    @error('password')<div class="text-danger">{{ $message }}</div>@enderror
                </div>
                <div class="mb-3">
                    <label for="password_confirmation" class="form-label">Confirm New Password</label>
                    <input type="password" name="password_confirmation" id="password_confirmation" class="form-control" autocomplete="new-password">
                </div>
                <div class="text-center mt-4">
                    <button type="submit" class="btn btn-success">Save</button>
                    <a href="{{ route('profile.show') }}" class="btn btn-secondary ms-2">Cancel</a>
                </div>
            </form>
        </div>
    </div>
</div>

<style>
    .profile-edit-card {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        padding: 40px;
        background-color: #fff;
        margin: 20px 0;
        max-width: 600px;
        width: 100%;
    }
    .profile-edit-card img {
        border: 4px solid #f8f9fa;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
</style>

<script>
    document.querySelector('form').addEventListener('submit', function(e) {
        var oldpw = document.getElementById('old_password').value;
        var pw = document.getElementById('password').value;
        var pwc = document.getElementById('password_confirmation').value;
        if (pw || pwc) {
            if (!oldpw) {
                e.preventDefault();
                alert('Please enter your old password to change your password.');
                return;
            }
            if (pw !== pwc) {
                e.preventDefault();
                alert('Password and confirmation do not match!');
            }
        }
    });
</script>
@endsection