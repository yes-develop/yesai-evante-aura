@extends('layouts.app')

@section('title', 'Booking Details - GO Hotel Admin')

@section('page-title', 'Booking Details')
@section('page-subtitle', 'View booking information')

@section('content')
<div class="container-fluid py-4">
    <a href="{{ route('bookings.index') }}" class="btn btn-sm btn-dark rounded-80 mb-4">
        <i class="fas fa-arrow-left me-1"></i> Back to Bookings
    </a>

    <!-- Action Buttons -->
    <div class="float-end">
        <a href="{{ route('bookings.edit', $booking) }}" class="btn btn-sm btn-dark rounded-80 me-2">
            <i class="fas fa-edit me-1"></i> Edit Booking
        </a>
        <button type="button" class="btn btn-sm btn-danger rounded-80" data-bs-toggle="modal" data-bs-target="#deleteBookingModal">
            <i class="fas fa-trash me-1"></i> Cancel Booking
        </button>
    </div>
    <div class="clearfix"></div>

    <div class="row gx-4">
        <div class="col-md-8">
            <div class="row">
                <!-- Guest & Booking Info Panel -->
                <div class="col-12">
                    <div class="card mb-4">
                        <div class="card-body p-4">
                            <!-- Status Badge and Booking ID -->
                            <div class="badge-container mb-3">
                                @if ($booking->status == 'confirmed')
                                <span class="badge-status confirmed">Confirmed</span>
                                @elseif($booking->status == 'pending')
                                <span class="badge-status pending">Pending</span>
                                @elseif($booking->status == 'canceled' || $booking->status == 'cancelled')
                                <span class="badge-status cancelled">Cancelled</span>
                                @elseif($booking->status == 'waiting_payment')
                                <span class="badge-status awaiting">Awaiting Payment</span>
                                @elseif($booking->status == 'completed')
                                <span class="badge-status completed">Completed</span>
                                @else
                                <span class="badge-status">{{ ucfirst($booking->status ?? 'Unknown') }}</span>
                                @endif
                            </div>

                            <h4 class="booking-id mb-4">Booking #{{ $booking->id }}</h4>
                            <div class="row">
                                <!-- Guest Information -->
                                <div class="col-md-6">
                                    <h6 class="section-title">Guest Information</h6>
                                    <div class="info-grid">
                                        <div class="info-row">
                                            <div class="info-label">Name:</div>
                                            <div class="info-value">{{ $booking->full_name }}</div>
                                        </div>
                                        <div class="info-row">
                                            <div class="info-label">Phone:</div>
                                            <div class="info-value">{{ $booking->phone }}</div>
                                        </div>
                                        @if (!empty($booking->email))
                                        <div class="info-row">
                                            <div class="info-label">Email:</div>
                                            <div class="info-value">{{ $booking->email }}</div>
                                        </div>
                                        @endif
                                        @if (!empty($booking->user_line_id))
                                        <div class="info-row">
                                            <div class="info-label">LINE ID:</div>
                                            <div class="info-value">{{ $booking->user_line_id }}</div>
                                        </div>
                                        @endif
                                    </div>
                                </div>

                                <!-- Booking Details -->
                                <div class="col-md-6">
                                    <h6 class="section-title">Booking Details</h6>
                                    <div class="info-grid">
                                        <div class="info-row">
                                            <div class="info-label">Check-in:</div>
                                            <div class="info-value">{{ \Carbon\Carbon::parse($booking->check_in)->format('D, M d, Y') }}</div>
                                        </div>
                                        <div class="info-row">
                                            <div class="info-label">Check-out:</div>
                                            <div class="info-value">{{ \Carbon\Carbon::parse($booking->check_out)->format('D, M d, Y') }}</div>
                                        </div>
                                        <div class="info-row">
                                            <div class="info-label">Number of Rooms:</div>
                                            <div class="info-value">{{ $booking->room_count }}</div>
                                        </div>
                                        <div class="info-row">
                                            <div class="info-label">Booking Date:</div>
                                            <div class="info-value">{{ \Carbon\Carbon::parse($booking->created_at)->format('M d, Y H:i') }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Stay Summary Panel -->
                <div class="col-12">
                    <div class="card mb-4">
                        <div class="card-body p-4">
                            <h6 class="section-title">Stay Summary</h6>

                            @php
                            $checkIn = \Carbon\Carbon::parse($booking->check_in);
                            $checkOut = \Carbon\Carbon::parse($booking->check_out);
                            $nights = $checkIn->diffInDays($checkOut);
                            $pricePerNight = $booking->room->price_per_night ?? 0;
                            $roomCount = $booking->room_count ?? 1;
                            $totalPrice = $pricePerNight * $nights * $roomCount;
                            @endphp

                            <div class="row">
                                <div class="col-md-7">
                                    <div class="info-row">
                                        <div class="info-label">Duration:</div>
                                        <div class="info-value">{{ $nights }} {{ Str::plural('night', $nights) }}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">Room Count:</div>
                                        <div class="info-value">{{ $roomCount }} {{ Str::plural('room', $roomCount) }}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">Room Price:</div>
                                        <div class="info-value">₿{{ number_format($pricePerNight, 2) }} per night</div>
                                    </div>
                                </div>
                                <div class="col-md-5 d-flex flex-column align-items-end justify-content-center">
                                    <div class="price-label">Price for {{ $nights }} {{ Str::plural('night', $nights) }}</div>
                                    <div class="total-price">₿{{ number_format($totalPrice, 2) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actions Required -->
                @if ($booking->status == 'pending' || $booking->status == 'waiting_payment')
                <div class="col-12">
                    <div class="card mb-4 actions-card">
                        <div class="card-body p-4">
                            <h6 class="section-title">Actions Required</h6>
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <p class="action-message">
                                        This booking is pending confirmation.
                                    </p>
                                </div>
                                <div class="action-buttons">
                                    <form action="{{ url('/bookings/' . $booking->id . '/status') }}" method="POST" class="d-inline">
                                        @csrf
                                        @method('PATCH')
                                        <input type="hidden" name="status" value="confirmed">
                                        <button type="submit" class="btn btn-sm btn-success rounded-80">
                                            Confirm Booking
                                        </button>
                                    </form>

                                    @if ($booking->status != 'waiting_payment')
                                    <form action="{{ route('bookings.updateStatus', $booking) }}" method="POST" class="d-inline ms-2">
                                        @csrf
                                        @method('PUT')
                                        <input type="hidden" name="status" value="waiting_payment">
                                        <button type="submit" class="btn btn-sm btn-info rounded-80">
                                            Mark as Awaiting Payment
                                        </button>
                                    </form>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                @endif
            </div>
        </div>

        <!-- Room Information -->
        <div class="col-md-4">
            <div class="card">
                <div class="card-body p-4">
                    <h6 class="section-title">Room Information</h6>

                    @if ($booking->room)
                    <div class="room-image-container mb-4">
                        @if ($booking->room->images && $booking->room->images->count() > 0)
                        @php
                        $primaryImage = $booking->room->images->where('is_primary', true)->first() ?? $booking->room->images->first();
                        $imagePath = $primaryImage->image_url;
                        if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                        $imageSrc = $imagePath;
                        } else {
                        $imageSrc = asset('storage/' . $imagePath);
                        }
                        @endphp
                        <img src="{{ $imageSrc }}" alt="{{ $booking->room->name }}" class="room-image">
                        @else
                        <div class="no-image-placeholder">
                            <i class="fas fa-bed"></i>
                        </div>
                        @endif
                    </div>

                    <div class="room-status-badge mb-2">
                        <span class="badge-available">Available</span>
                    </div>

                    <h5 class="room-title">{{ $booking->room->name }}</h5>
                    <div class="branch-name mb-4">{{ $booking->room->branch->name ?? 'N/A' }}</div>

                    <div class="info-row">
                        <div class="info-label">Price</div>
                        <div class="info-value">₿{{ number_format($booking->room->price_per_night, 2) }} per night</div>
                    </div>

                    <div class="info-row">
                        <div class="info-label">Bed Type</div>
                        <div class="info-value">{{ $booking->room->bed_type }}</div>
                    </div>

                    <div class="info-row">
                        <div class="info-label">Max Guests</div>
                        <div class="info-value">{{ $booking->room->max_guests }} persons</div>
                    </div>

                    <div class="mt-4 text-center">
                        <a href="{{ route('rooms.show', $booking->room) }}" class="btn btn-sm btn-outline-dark rounded-80">
                            View Room Details
                        </a>
                    </div>
                    @else
                    <div class="alert alert-warning mb-0">
                        Room information not available
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Delete/Cancel Booking Modal -->
<div class="modal fade" id="deleteBookingModal" tabindex="-1" aria-labelledby="deleteBookingModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="deleteBookingModalLabel">Cancel Booking</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to cancel this booking?</p>
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i> This action will mark the booking as cancelled.
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-sm btn-dark rounded-80" data-bs-dismiss="modal">Close</button>
                <form action="{{ route('bookings.destroy', $booking) }}" method="POST">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="btn btn-sm btn-danger rounded-80">Cancel Booking</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection

@section('styles')
<style>
    /* Card styling */
    .card {
        border: none;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        margin-bottom: 24px;
        background-color: #ffffff;
    }

    /* Badge styling */
    .badge-container {
        margin-top: 10px;
    }

    .badge-status {
        display: inline-block;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
    }

    .badge-status.pending {
        background-color: #FEF9C3;
        color: #B45309;
    }

    .badge-status.confirmed {
        background-color: #DCFCE7;
        color: #166534;
    }

    .badge-status.cancelled {
        background-color: #FEE2E2;
        color: #B91C1C;
    }

    .badge-status.awaiting {
        background-color: #DBEAFE;
        color: #1E40AF;
    }

    .badge-status.completed {
        background-color: #E0E7FF;
        color: #3730A3;
    }

    .badge-available {
        display: inline-block;
        padding: 4px 10px;
        background-color: #DCFCE7;
        color: #166534;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
    }

    /* Section headers */
    .section-title {
        color: #64748B;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 16px;
        position: relative;
    }

    /* Booking ID */
    .booking-id {
        font-size: 20px;
        font-weight: 700;
        color: #111827;
    }

    /* Information items */
    .info-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .info-row {
        display: flex;
        margin-bottom: 12px;
    }

    .info-label {
        color: #64748B;
        width: 120px;
        font-size: 14px;
        flex-shrink: 0;
    }

    .info-value {
        color: #111827;
        font-size: 14px;
        flex-grow: 1;
    }

    /* Room image */
    .room-image-container {
        height: 200px;
        width: 100%;
        border-radius: 10px;
        overflow: hidden;
        background-color: #F1F5F9;
    }

    .room-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .no-image-placeholder {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #F1F5F9;
        color: #94A3B8;
    }

    .no-image-placeholder i {
        font-size: 40px;
    }

    /* Room details */
    .room-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 5px;
        color: #111827;
    }

    .branch-name {
        color: #64748B;
        font-size: 14px;
        margin-bottom: 20px;
    }

    /* Price section */
    .price-label {
        color: #64748B;
        font-size: 14px;
        margin-bottom: 4px;
        text-align: right;
    }

    .total-price {
        font-size: 24px;
        font-weight: 700;
        color: #111827;
    }

    /* Actions card */
    .actions-card {
        background-color: #F8FAFC;
    }

    .action-message {
        margin-bottom: 0;
        color: #334155;
        font-size: 14px;
    }

    /* Buttons */
    .btn {
        font-weight: 500;
        padding: 8px 20px;
    }

    .rounded-80 {
        border-radius: 50px;
    }

    .btn-dark {
        background-color: #111827;
        border-color: #111827;
    }

    .btn-outline-dark {
        color: #111827;
        border-color: #CBD5E1;
    }

    /* Action buttons container */
    .action-button-container {
        margin-top: 20px;
        margin-bottom: 40px;
    }

    /* Modal */
    .modal-content {
        border: none;
        border-radius: 10px;
    }

    .modal-header,
    .modal-footer {
        border: none;
    }

    /* Row spacing */
    .gx-4 {
        --bs-gutter-x: 24px;
    }

    /* Container padding */
    .container-fluid {
        padding-left: 24px;
        padding-right: 24px;
    }
</style>
@endsection