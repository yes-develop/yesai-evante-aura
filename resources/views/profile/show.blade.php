@extends('layouts.app')

@section('title', 'Profile - GO Hotel Admin')

@section('page-title', 'Profile')
@section('page-subtitle', 'View your profile information')

@section('content')
<div class="container">
    <h2>My Profile</h2>
    <div class="d-flex justify-content-center">
        <div class="profilecard" style="max-width: 600px; width: 100%;">
            <div class="card-body text-center">
                <img src="{{ $user->profile_image ? asset('storage/' . $user->profile_image) : asset('images/default-profile.png') }}" class="rounded-circle mb-3" width="120" height="120" alt="Profile Image">
                <h4>{{ $user->name }}</h4>
                <p class="text-muted">{{ $user->email }}</p>
                <a href="{{ route('profile.edit') }}" class="btn btn-primary mt-2">Edit Profile</a>
            </div>
        </div>
    </div>
</div>
@endsection 

<style>
    .profilecard {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 40px;
        background-color: #fff;
        margin: 20px 0;
    }
    .profilecard img {
        border-radius: 50%;
    }
    .profilecard h4 {
        margin-bottom: 10px;
    }
</style>