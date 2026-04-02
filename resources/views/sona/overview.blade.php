@extends('layouts.app')

@section('title', 'SONA Overview')

@section('content')
<div style="display: flex; justify-content: center; align-items: center; min-height: 80vh; flex-direction: column;">
    <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 500px;">
        <i class="fa fa-solid fa-cubes" style="font-size: 4rem; color: #6c757d; margin-bottom: 1rem;"></i>
        <h2 style="color: #333; margin-bottom: 1rem;">SONA Overview</h2>
        <p style="color: #666; margin-bottom: 2rem; font-size: 1.1rem;">During maintenance</p>
        <button onclick="history.back()" style="background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 1rem; cursor: pointer; transition: background 0.3s ease;">
            <i class="fa-solid fa-arrow-left" style="margin-right: 8px;"></i>
            Go Back
        </button>
    </div>
</div>
@endsection
