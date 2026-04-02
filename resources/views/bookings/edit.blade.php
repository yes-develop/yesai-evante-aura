@extends('layouts.app')

@section('title', 'Edit Booking - GO Hotel Admin')

@section('page-title', 'Edit Booking')
@section('page-subtitle', 'Update booking details')

@section('content')
<div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <!-- ปุ่ม Back -->
        <a href="{{ route('bookings.index') }}" class="btn btn-sm btn-dark rounded-80 mb-2 mb-md-0">
            <i class="fas fa-arrow-left me-1"></i> Back to Bookings
        </a>

        <!-- ปุ่ม Cancel & Update -->
        <div class="d-flex align-items-center">
            <button type="button" class="btn btn-sm btn-dark rounded-80 me-2"
                onclick="window.location.href='{{ route('bookings.index') }}'">Cancel</button>
            <button type="submit" class="btn btn-sm btn-dark rounded-80">Update Booking</button>
        </div>
    </div>
</div>


    @if ($errors->any())
    <div class="alert alert-danger mb-4">
        <strong>Please check the following errors:</strong>
        <ul class="mb-0 mt-2">
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
    @endif

    <form action="{{ route('bookings.update', $booking) }}" method="POST" id="editBookingForm">
        @csrf
        @method('PUT')
        
        <div class="row gx-4">
            <!-- Guest Information -->
            <div class="col-lg-6 mb-4">
                <div class="card">
                    <div class="card-body p-4">
                        <h6 class="section-title mb-4">Guest Information</h6>
                        
                        <div class="mb-3">
                            <label for="full_name" class="form-label">Guest Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('full_name') is-invalid @enderror" id="full_name" name="full_name" value="{{ old('full_name', $booking->full_name) }}" required>
                            @error('full_name')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="phone" class="form-label">Phone <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('phone') is-invalid @enderror" id="phone" name="phone" value="{{ old('phone', $booking->phone) }}" required>
                            @error('phone')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control @error('email') is-invalid @enderror" id="email" name="email" value="{{ old('email', $booking->email) }}">
                            @error('email')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="user_line_id" class="form-label">LINE ID</label>
                            <input type="text" class="form-control @error('user_line_id') is-invalid @enderror" id="user_line_id" name="user_line_id" value="{{ old('user_line_id', $booking->user_line_id) }}">
                            @error('user_line_id')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="notes" class="form-label">Additional Notes</label>
                            <textarea class="form-control @error('notes') is-invalid @enderror" id="notes" name="notes" rows="3">{{ old('notes', $booking->notes) }}</textarea>
                            @error('notes')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Booking Details -->
            <div class="col-lg-6 mb-4">
                <div class="card">
                    <div class="card-body p-4">
                        <h6 class="section-title mb-4">Booking Details</h6>
                        
                        <div class="mb-3">
                            <label for="branch_id" class="form-label">Branch <span class="text-danger">*</span></label>
                            <select class="form-select @error('branch_id') is-invalid @enderror" id="branch_id" name="branch_id">
                                <option value="">Select Branch</option>
                                @foreach($branches as $branch)
                                    <option value="{{ $branch->id }}" {{ (old('branch_id') == $branch->id || ($booking->room && $booking->room->branch_id == $branch->id)) ? 'selected' : '' }}>
                                        {{ $branch->name }}
                                    </option>
                                @endforeach
                            </select>
                            @error('branch_id')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="room_id" class="form-label">Room <span class="text-danger">*</span></label>
                            <select class="form-select @error('room_id') is-invalid @enderror" id="room_id" name="room_id" required>
                                <option value="">Select Room</option>
                            </select>
                            @error('room_id')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="check_in" class="form-label">Check-in Date <span class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <input type="date" class="form-control @error('check_in') is-invalid @enderror" id="check_in" name="check_in" value="{{ old('check_in', $booking->check_in) }}" min="{{ date('Y-m-d') }}" required>
                                        <span class="input-group-text bg-white border"><i class="far fa-calendar"></i></span>
                                    </div>
                                    @error('check_in')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="check_out" class="form-label">Check-out Date <span class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <input type="date" class="form-control @error('check_out') is-invalid @enderror" id="check_out" name="check_out" value="{{ old('check_out', $booking->check_out) }}" min="{{ date('Y-m-d', strtotime('+1 day')) }}" required>
                                        <span class="input-group-text bg-white border"><i class="far fa-calendar"></i></span>
                                    </div>
                                    @error('check_out')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="room_count" class="form-label">Number of Rooms <span class="text-danger">*</span></label>
                            <input type="number" class="form-control @error('room_count') is-invalid @enderror" id="room_count" name="room_count" value="{{ old('room_count', $booking->room_count) }}" min="1" required>
                            @error('room_count')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="status" class="form-label">Status <span class="text-danger">*</span></label>
                            <select class="form-select @error('status') is-invalid @enderror" id="status" name="status" required>
                                <option value="pending" {{ old('status', $booking->status) == 'pending' ? 'selected' : '' }}>Pending</option>
                                <option value="waiting_payment" {{ old('status', $booking->status) == 'waiting_payment' ? 'selected' : '' }}>Awaiting Payment</option>
                                <option value="confirmed" {{ old('status', $booking->status) == 'confirmed' ? 'selected' : '' }}>Confirmed</option>
                                <option value="canceled" {{ old('status', $booking->status) == 'canceled' ? 'selected' : '' }}>Cancelled</option>
                            </select>
                            @error('status')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <!-- Booking Summary -->
                        <div class="booking-summary-card mt-4">
                            <h6 class="section-title mb-4">Booking Summary</h6>
                            
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="room-image-container mb-3">
                                        @if($booking->room && $booking->room->images && $booking->room->images->isNotEmpty())
                                            @php
                                                $imagePath = $booking->room->images->first()->image_url;
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
                                </div>
                                <div class="col-md-8">
                                    <h6 id="room-name" class="mb-1">{{ $booking->room->name ?? 'Select a room' }}</h6>
                                    <p id="room-branch" class="mb-3 small text-muted">{{ $booking->room->branch->name ?? 'Select branch' }}</p>
                                    
                                    <div class="summary-info">
                                        <div class="info-row">
                                            <i class="fi fi-sr-bed me-2"></i>
                                            <span id="number-of-nights">{{ $booking->check_in && $booking->check_out ? \Carbon\Carbon::parse($booking->check_in)->diffInDays(\Carbon\Carbon::parse($booking->check_out)) : '-' }}</span> nights
                                        </div>
                                        <div class="info-row">
                                            <i class="fi fi-sr-door-open me-2"></i>
                                            <span id="number-of-rooms">{{ $booking->room_count }}</span> rooms
                                        </div>
                                        <div class="info-row">
                                            <i class="fi fi-rr-moon-stars me-2"></i>
                                            <span id="price-per-night">฿{{ number_format($booking->room->price_per_night ?? 0, 2) }}</span> per night
                                        </div>
                                    </div>
                                    
                                    <div class="total-row mt-3 pt-2 border-top">
                                        <strong>Total: <span id="total-price">฿{{ number_format($booking->total_price ?? 0, 2) }}</span></strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        
    </form>
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

    .card-body {
        padding: 1.5rem;
    }

    /* Form controls */
    .form-control, .form-select {
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        padding: 0.6rem 0.75rem;
        font-size: 0.95rem;
        color: #333;
    }

    .form-control:focus, .form-select:focus {
        background-color: #fff;
        border-color: #ced4da;
        box-shadow: 0 0 0 0.2rem rgba(206, 212, 218, 0.25);
    }

    /* Section headers */
    .section-title {
        color: #64748B;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 16px;
        position: relative;
    }

    /* Form label */
    .form-label {
        font-weight: 500;
        font-size: 14px;
        color: #64748B;
        margin-bottom: 0.5rem;
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

    /* Room image */
    .room-image-container {
        height: 100px;
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
        font-size: 28px;
    }

    /* Booking summary */
    .booking-summary-card {
        background-color: #F8FAFC;
        border-radius: 10px;
        padding: 1.5rem;
    }

    .summary-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .info-row {
        font-size: 14px;
        color: #64748B;
    }

    .total-row {
        font-size: 15px;
        color: #111827;
        text-align: right;
    }

    /* Row spacing */
    .gx-4 {
        --bs-gutter-x: 24px;
    }

    /* Container spacing */
    .container-fluid {
        padding-left: 24px;
        padding-right: 24px;
    }

    /* Calendar icon in date fields */
    .input-group-text {
        background-color: transparent;
    }
</style>
@endsection

@section('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    const availableRooms = [];
    const selectedRoom = {
        id: {{ $booking->room_id ?: 'null' }},
        price_per_night: {{ $booking->room ? $booking->room->price_per_night : 0 }}
    };
    
    function updateBookingSummary() {
        const checkIn = document.getElementById('check_in').value;
        const checkOut = document.getElementById('check_out').value;
        const roomCount = document.getElementById('room_count').value;
        
        if (checkIn && checkOut && selectedRoom.id) {
            const startDate = new Date(checkIn);
            const endDate = new Date(checkOut);
            const nightCount = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
            
            document.getElementById('number-of-nights').textContent = nightCount;
            document.getElementById('number-of-rooms').textContent = roomCount;
            document.getElementById('price-per-night').textContent = '฿' + parseFloat(selectedRoom.price_per_night).toFixed(2);
            
            const totalPrice = selectedRoom.price_per_night * nightCount * roomCount;
            document.getElementById('total-price').textContent = '฿' + totalPrice.toFixed(2);
        }
    }
    
    function fetchAvailableRooms() {
        const branchId = document.getElementById('branch_id').value;
        const checkIn = document.getElementById('check_in').value;
        const checkOut = document.getElementById('check_out').value;
        
        if (branchId && checkIn && checkOut) {
            document.getElementById('room_id').disabled = true;
            
            const roomSelect = document.getElementById('room_id');
            roomSelect.innerHTML = '<option value="">Select Room</option>';
            
            const bookingId = {{ $booking->id }};
            fetch('/api/rooms/available?branch_id=' + branchId + '&check_in=' + checkIn + '&check_out=' + checkOut + '&booking_id=' + bookingId)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('room_id').disabled = false;
                    
                    if (data.rooms && data.rooms.length > 0) {
                        data.rooms.forEach(room => {
                            const option = document.createElement('option');
                            option.value = room.id;
                            option.textContent = room.name + ' - ฿' + parseFloat(room.price_per_night).toFixed(2) + ' per night';
                            option.selected = room.id === {{ $booking->room_id ?: 'null' }};
                            roomSelect.appendChild(option);
                        });
                        
                        const currentRoomId = {{ $booking->room_id ?: 'null' }};
                        if (currentRoomId) {
                            const room = data.rooms.find(r => r.id === currentRoomId);
                            if (room) {
                                updateRoomDetails(room);
                            }
                        }
                    }
                })
                .catch(() => {
                    document.getElementById('room_id').disabled = false;
                });
        }
    }
    
    function updateRoomDetails(room) {
        document.getElementById('room-name').textContent = room.name;
        document.getElementById('room-branch').textContent = room.branch ? room.branch.name : '';
        
        const imageContainer = document.querySelector('.room-image-container');
        if (room.images && room.images.length > 0) {
            const primaryImage = room.images.find(img => img.is_primary) || room.images[0];
            const imageSrc = primaryImage.image_url.startsWith('http') 
                ? primaryImage.image_url 
                : '/storage/' + primaryImage.image_url;
            
            imageContainer.innerHTML = '<img src="' + imageSrc + '" alt="' + room.name + '" class="room-image">';
        } else {
            imageContainer.innerHTML = 
                '<div class="no-image-placeholder">' +
                '<i class="fas fa-bed"></i>' +
                '</div>';
        }
        
        selectedRoom.id = room.id;
        selectedRoom.price_per_night = room.price_per_night;
        updateBookingSummary();
    }
    
    // Event Listeners
    document.getElementById('room_id').addEventListener('change', function() {
        const roomId = this.value;
        if (roomId) {
            fetch('/api/rooms/' + roomId)
                .then(response => response.json())
                .then(room => {
                    updateRoomDetails(room);
                });
        }
    });
    
    ['check_in', 'check_out', 'room_count'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateBookingSummary);
    });
    
    document.getElementById('branch_id').addEventListener('change', fetchAvailableRooms);
    
    document.getElementById('check_in').addEventListener('change', function() {
        const checkInDate = this.value;
        if (checkInDate) {
            const nextDay = new Date(checkInDate);
            nextDay.setDate(nextDay.getDate() + 1);
            const nextDayFormatted = nextDay.toISOString().split('T')[0];
            document.getElementById('check_out').min = nextDayFormatted;
            
            if (document.getElementById('check_out').value <= checkInDate) {
                document.getElementById('check_out').value = nextDayFormatted;
            }
        }
        fetchAvailableRooms();
    });
    
    // Initial load
    if (document.getElementById('branch_id').value) {
        fetchAvailableRooms();
    }
});
</script>
@endsection