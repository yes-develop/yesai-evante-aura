@extends('layouts.app')

@section('title', 'Room Details - GO Hotel Admin')

@section('page-title', $room->name)
@section('page-subtitle', 'View room information and details')

@section('content')
<div class="row mb-4">
    <div class="col-md-6">
        <a href="{{ route('rooms.index') }}" class="btn btn-sm btn-dark rounded-80">
            <i class="fas fa-arrow-left"></i> Back to Rooms
        </a>
    </div>
    <div class="col-md-6 text-md-end">
        <div class="btn-group">
            <a href="{{ route('rooms.edit', $room) }}" class="btn btn-sm btn-primary">
                <i class="fas fa-edit"></i> Edit Room
            </a>
            <button type="button" class="btn btn-sm btn-primary bg-danger" data-bs-toggle="modal" data-bs-target="#deleteRoomModal">
                <i class="fas fa-trash"></i> Delete Room
            </button>
        </div>
    </div>
</div>

<!-- Room Information Card -->
<div class="card mb-4 shadow-sm border-0 overflow-hidden">
    <div class="card-header bg-white py-3">
        <h5 class="mb-0">Room Information</h5>
    </div>
    <div class="row g-0">
        <div class="col-md-7">
            @if($room->images->count() > 0)
                <div id="roomImagesCarousel" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-inner">
                        @foreach($room->images as $index => $image)
                            @php
                                $imagePath = $image->image_url;
                                if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                                    $imageSrc = $imagePath;
                                } else {
                                    $imageSrc = asset('storage/' . $imagePath);
                                }
                            @endphp
                            <div class="carousel-item {{ $index === 0 ? 'active' : '' }}">
                                <img src="{{ $imageSrc }}" class="d-block w-100" alt="{{ $room->name }}" 
                                     style="height: 400px; object-fit: cover;">
                            </div>
                        @endforeach
                    </div>
                    @if($room->images->count() > 1)
                        <button class="carousel-control-prev" type="button" data-bs-target="#roomImagesCarousel" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#roomImagesCarousel" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    @endif
                </div>
                <div class="row g-2 p-3">
                    @foreach($room->images as $index => $image)
                        @php
                            $imagePath = $image->image_url;
                            if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                                $imageSrc = $imagePath;
                            } else {
                                $imageSrc = asset('storage/' . $imagePath);
                            }
                        @endphp
                        <div class="col-3">
                            <img src="{{ $imageSrc }}" 
                                 class="img-thumbnail {{ $image->is_primary ? 'border-primary' : '' }}"
                                 style="height: 60px; width: 100%; object-fit: cover; cursor: pointer;"
                                 data-bs-target="#roomImagesCarousel" 
                                 data-bs-slide-to="{{ $index }}"
                                 alt="Room image {{ $index + 1 }}">
                        </div>
                    @endforeach
                </div>
            @else
                <div class="text-center py-5 bg-light h-100 d-flex align-items-center justify-content-center">
                    <div>
                        <i class="fas fa-image fa-3x text-muted"></i>
                        <p class="mt-3 text-muted">No images available</p>
                    </div>
                </div>
            @endif
        </div>
        <div class="col-md-5">
            <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2 class="fw-bold mb-0">{{ $room->name }}</h2>
                    <span class="badge rounded-pill {{ $room->status == 'available' ? 'bg-success' : ($room->status == 'booked' ? 'bg-warning' : 'bg-danger') }}">
                        {{ ucfirst($room->status) }}
                    </span>
                </div>

                <div class="mb-4">
                    <div class="row mb-3">
                        <div class="col-5 text-muted">Branch</div>
                        <div class="col-7 fw-semibold">{{ $room->branch->name ?? 'N/A' }}</div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-5 text-muted">Price</div>
                        <div class="col-7 fw-semibold">฿{{ number_format($room->price_per_night, 2) }} per night</div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-5 text-muted">Discount</div>
                        <div class="col-7 fw-semibold">฿{{ number_format($room->discount, 2) }}</div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-5 text-muted">Bed Type</div>
                        <div class="col-7 fw-semibold">{{ $room->bed_type }}</div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-5 text-muted">Max Guests</div>
                        <div class="col-7 fw-semibold">{{ $room->max_guests }} persons</div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-5 text-muted">Total Rooms</div>
                        <div class="col-7 fw-semibold">{{ $room->total_rooms }}</div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-5 text-muted">Room Size</div>
                        <div class="col-7 fw-semibold">{{ $room->size_room }}</div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-5 text-muted">Created</div>
                        <div class="col-7 fw-semibold">{{ \Carbon\Carbon::parse($room->created_at)->format('M d, Y') }}</div>
                    </div>
                </div>

                <hr class="my-4">

                <h5 class="mb-3">Description</h5>
                <p class="mb-0">{!! nl2br(e($room->description)) !!}</p>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <!-- Room Amenities -->
    <div class="col-md-6 mb-4">
        <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white py-3">
                <h5 class="mb-0">Room Amenities</h5>
            </div>
            <div class="card-body p-4">
                @php
                    $amenities = $room->amenities;
                    if (!is_array($amenities)) {
                        $amenities = json_decode($amenities, true) ?? [];
                    }
                    
                    // Split amenities into columns
                    $columnCount = 3;
                    $totalAmenities = count($amenities);
                    $perColumn = ceil($totalAmenities / $columnCount);
                    $columns = array_chunk($amenities, $perColumn);
                @endphp
                
                @if(count($amenities) > 0)
                    <div class="row">
                        @foreach($columns as $column)
                            <div class="col-md-4">
                                @foreach($column as $amenity)
                                    <div class="mb-2">
                                        <i class="text-muted me-2 fas fa-check"></i>
                                        {{ $amenity }}
                                    </div>
                                @endforeach
                            </div>
                        @endforeach
                    </div>
                @else
                    <div class="alert alert-info mb-0">
                        <i class="fas fa-info-circle me-2"></i>
                        No amenities listed for this room.
                    </div>
                @endif
            </div>
        </div>
    </div>

    <!-- Booking Statistics -->
    <div class="col-md-6 mb-4">
        <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white py-3">
                <h5 class="mb-0">Booking Statistics</h5>
            </div>
            <div class="card-body p-4">
                <div class="row g-4 text-center">
                    <div class="col-md-4">
                        <div class="p-3 bg-light rounded-3">
                            <h3 class="fw-bold mb-0">{{ $room->bookings_count ?? 0 }}</h3>
                            <p class="text-muted mb-0 small">Total Bookings</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-3 bg-light rounded-3">
                            <h3 class="fw-bold mb-0">{{ $room->bookings_this_month ?? 0 }}</h3>
                            <p class="text-muted mb-0 small">This Month</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-3 bg-light rounded-3">
                            <h3 class="fw-bold mb-0">{{ $room->occupancy_rate ?? '0%' }}</h3>
                            <p class="text-muted mb-0 small">Occupancy Rate</p>
                        </div>
                    </div>
                </div>
                
                <h5 class="mt-4 mb-3">Recent Bookings</h5>
                @if($room->bookings && $room->bookings->count() > 0)
                    <div class="list-group">
                        @foreach($room->bookings->take(3) as $booking)
                            <div class="list-group-item border-0 px-0 py-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1 fw-semibold">{{ $booking->full_name }}</h6>
                                        <p class="text-muted small mb-0">
                                            {{ \Carbon\Carbon::parse($booking->check_in)->format('M d') }} - 
                                            {{ \Carbon\Carbon::parse($booking->check_out)->format('M d, Y') }}
                                        </p>
                                    </div>
                                    <div>
                                        @if($booking->status == 'confirmed')
                                            <span class="badge bg-success rounded-pill">Confirmed</span>
                                        @elseif($booking->status == 'pending')
                                            <span class="badge bg-warning rounded-pill">Pending</span>
                                        @elseif($booking->status == 'cancelled' || $booking->status == 'canceled')
                                            <span class="badge bg-danger rounded-pill">Cancelled</span>
                                        @else
                                            <span class="badge bg-secondary rounded-pill">{{ ucfirst($booking->status) }}</span>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                    <div class="text-center mt-3">
                        <a href="{{ route('bookings.index', ['room_id' => $room->id]) }}" class="btn btn-sm btn-dark rounded-80">
                            View All Bookings
                        </a>
                    </div>
                @else
                    <div class="alert alert-info mb-0">
                        <i class="fas fa-info-circle me-2"></i>
                        No bookings found for this room.
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

<!-- Delete Room Modal -->
<div class="modal fade" id="deleteRoomModal" tabindex="-1" aria-labelledby="deleteRoomModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="deleteRoomModalLabel">Delete Room</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete this room? This action cannot be undone.</p>
                <p>Room: <strong>{{ $room->name }}</strong></p>
                @if($room->bookings && $room->bookings->count() > 0)
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        This room has {{ $room->bookings->count() }} booking(s). Deleting it may affect existing reservations.
                    </div>
                @endif
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <form action="{{ route('rooms.destroy', $room) }}" method="POST">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="btn btn-danger">Delete</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@section('styles')
<style>
.carousel {
    overflow: hidden;
}

.card {
    border-radius: 12px;
    overflow: hidden;
}

.card-header {
    background-color: white;
    font-weight: 500;
    border-bottom: 1px solid rgba(0,0,0,0.05);
}

.img-thumbnail {
    padding: 0.25rem;
    transition: all 0.2s ease-in-out;
    border-radius: 8px;
    border: 1px solid #eee;
}

.img-thumbnail:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.img-thumbnail.border-primary {
    border-color: #4e73df !important;
    border-width: 2px;
}

.badge {
    font-weight: 500;
    padding: 6px 12px;
}

.badge.rounded-pill {
    font-size: 0.75rem;
}

.fw-semibold {
    font-weight: 600;
}

.btn-group .btn {
    padding: 0.5rem 1rem;
}

.bg-light {
    background-color: #f8f9fc !important;
}

.list-group-item {
    border-bottom: 1px solid rgba(0,0,0,0.05);
}

.list-group-item:last-child {
    border-bottom: 0;
}

.shadow-sm {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
}

h2.fw-bold {
    font-size: 1.75rem;
}

h3.fw-bold {
    font-size: 1.5rem;
}
</style>
@endsection

@section('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Handle thumbnail click to change main image
    const thumbnails = document.querySelectorAll('[data-bs-target="#roomImagesCarousel"]');
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const slideIndex = this.getAttribute('data-bs-slide-to');
            const carousel = new bootstrap.Carousel(document.getElementById('roomImagesCarousel'));
            carousel.to(parseInt(slideIndex));
        });
    });
});
</script>
@endsection