@php
    $bookingsCount = $bookingsCount ?? \App\Models\Booking::whereHas('room', function($query) use ($branch) {
        $query->where('branch_id', $branch->id);
    })->count();
@endphp

@extends('layouts.app')

@section('title', 'Branch Details - GO Hotel Admin')

@section('page-title', $branch->name)
@section('page-subtitle', 'Branch details and information')

@section('content')
    <div class="row mb-4">
        <div class="col-md-6">
            <a href="{{ route('branches.index') }}" class="btn btn-sm btn-primary">
                <i class="fas fa-arrow-left"></i> Back to Branches
            </a>
        </div>
        <div class="col-md-6 text-md-end">
            <a href="{{ route('branches.edit', $branch) }}" class="btn btn-sm btn-primary">
                <i class="fas fa-edit"></i> Edit Branch
            </a>
        </div>
    </div>

    <div class="row">
        <!-- Branch Details -->
        <div class="col-md-8">
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="card-title mb-0">Branch Information</h5>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-3 fw-bold">Name:</div>
                        <div class="col-md-9">{{ $branch->name }}</div>
                    </div>
                    @if ($branch->description)
                        <div class="row mb-3">
                            <div class="col-md-3 fw-bold">Description:</div>
                            <div class="col-md-9">{{ $branch->description }}</div>
                        </div>
                    @endif
                    @if ($branch->location)
                        <div class="row mb-3">
                            <div class="col-md-3 fw-bold">Location:</div>
                            <div class="col-md-9">{{ $branch->location }}</div>
                        </div>
                    @endif
                    @if ($branch->tel)
                        <div class="row mb-3">
                            <div class="col-md-3 fw-bold">Telephone:</div>
                            <div class="col-md-9">{{ $branch->tel }}</div>
                        </div>
                    @endif

                    <div class="row mb-3">
                        <div class="col-md-3 fw-bold">Total Rooms:</div>
                        <div class="col-md-9">{{ $branch->rooms->sum('total_rooms') }} ({{ $branch->rooms->count() }} room
                            types)</div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-3 fw-bold">Total Bookings:</div>
                        <div class="col-md-9">{{ $bookingsCount }}</div>
                    </div>

                    @if ($branch->map_url)
                        <div class="row">
                            <div class="col-12">
                                <div class="mb-2 fw-bold">Map:</div>
                                <div class="ratio ratio-16x9">
                                    <iframe src="{{ $branch->map_url }}" allowfullscreen="" loading="lazy"
                                        referrerpolicy="no-referrer-when-downgrade"></iframe>
                                </div>
                            </div>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Room List -->
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">Rooms at this Branch</h5>
                    <a href="{{ route('rooms.create') }}?branch_id={{ $branch->id }}" class="btn btn-sm btn-primary">
                        <i class="fas fa-plus-circle"></i> Add Room
                    </a>
                </div>
                <div class="card-body">
                    @if ($branch->rooms->count() > 0)
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Bed Type</th>
                                        <th>Price</th>
                                        <th>Max Guests</th>
                                        <th>Total Rooms</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($branch->rooms as $room)
                                        <tr>
                                            <td>{{ $room->bed_type }}</td>
                                            <td>{{ number_format($room->price_per_night, 2) }}</td>
                                            <td>{{ $room->max_guests }}</td>
                                            <td>{{ $room->total_rooms }}</td>
                                            <td>
                                                @if ($room->status == 'available')
                                                    <span class="badge bg-success">Available</span>
                                                @else
                                                    <span class="badge bg-danger">Unavailable</span>
                                                @endif
                                            </td>
                                            <td>
                                                <div class="btn-group btn-group-sm">
                                                    <a href="{{ route('rooms.show', $room) }}" class="btn btn-outline-primary view-btn">
                                                    <i class="fi fi-rr-search"></i>
                                                    </a>
                                                    <button type="submit" class="btn btn-outline-danger delete-btn">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                                </div>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <div class="alert alert-info">
                            No rooms have been added to this branch yet.
                            <a href="{{ route('rooms.create') }}?branch_id={{ $branch->id }}" class="alert-link">Add
                                your first room</a>.
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Branch Image and Nearby Places -->
        <div class="col-md-4">
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="card-title mb-0">Branch Image</h5>
                </div>
                <div class="card-body text-center">
    @if ($branch->image)
        @php
            $imagePath = $branch->image;
            // Check if the image is a full URL or a storage path
            if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                $imageSrc = $imagePath;
            } else {
                $imageSrc = asset('storage/' . $imagePath);
            }
        @endphp
        <img src="{{ \App\Helpers\ImageHelper::getImageUrl($branch->image) }}" alt="{{ $branch->name }}" class="img-fluid rounded">
    @else
        <div class="bg-light d-flex align-items-center justify-content-center p-5" style="height: 200px;">
            <span class="text-muted">No image available</span>
        </div>
    @endif
</div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">Nearby Places</h5>
                </div>
                <div class="card-body">
                    @if (is_array($branch->nearby_shoppingmall) && count($branch->nearby_shoppingmall) > 0)
                        <div class="mb-4">
                            <h6 class="fw-bold"><i class="fas fa-shopping-bag me-2"></i> Shopping Malls</h6>
                            <ul>
                                @foreach ($branch->nearby_shoppingmall as $mall)
                                    <li>{{ $mall }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    @if (is_array($branch->nearby_attractions) && count($branch->nearby_attractions) > 0)
                        <div class="mb-4">
                            <h6 class="fw-bold"><i class="fas fa-map-marker-alt me-2"></i> Attractions</h6>
                            <ul>
                                @foreach ($branch->nearby_attractions as $attraction)
                                    <li>{{ $attraction }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    @if (is_array($branch->nearby_industrialestates) && count($branch->nearby_industrialestates) > 0)
                        <div class="mb-4">
                            <h6 class="fw-bold"><i class="fas fa-industry me-2"></i> Industrial Estates</h6>
                            <ul>
                                @foreach ($branch->nearby_industrialestates as $estate)
                                    <li>{{ $estate }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    @if (is_array($branch->nearby_governmentinstitutions) && count($branch->nearby_governmentinstitutions) > 0)
                        <div>
                            <h6 class="fw-bold"><i class="fas fa-building me-2"></i> Government Institutions</h6>
                            <ul>
                                @foreach ($branch->nearby_governmentinstitutions as $institution)
                                    <li>{{ $institution }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    @if (
                        (!is_array($branch->nearby_shoppingmall) || count($branch->nearby_shoppingmall) == 0) &&
                            (!is_array($branch->nearby_attractions) || count($branch->nearby_attractions) == 0) &&
                            (!is_array($branch->nearby_industrialestates) || count($branch->nearby_industrialestates) == 0) &&
                            (!is_array($branch->nearby_governmentinstitutions) || count($branch->nearby_governmentinstitutions) == 0))
                        <div class="alert alert-info">
                            No nearby places have been added yet.
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
@endsection
