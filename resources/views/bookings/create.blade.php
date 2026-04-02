@extends('layouts.app')

@section('title', 'Create Booking - GO Hotel Admin')

@section('page-title', 'Create New Booking')
@section('page-subtitle', 'Add a new booking reservation')

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
    <div class="alert alert-danger mb-4 mt-3">
        <strong>Please check the following errors:</strong>
        <ul class="mb-0 mt-2">
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
    @endif

    <form action="{{ route('bookings.store') }}" method="POST" id="createBookingForm" class="mt-3">
        @csrf
        <div class="row">
            <!-- Guest Information Card -->
            <div class="col-lg-6 mb-4">
                <div class="card shadow-sm">
                    <div class="card-body p-4">
                        <h5 class="fw-bold mb-4">Guest Information</h5>
                        
                        <div class="mb-3">
                            <label for="full_name" class="form-label">Guest Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('full_name') is-invalid @enderror" id="full_name" name="full_name" value="{{ old('full_name') }}" required>
                            @error('full_name')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="phone" class="form-label">Phone <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('phone') is-invalid @enderror" id="phone" name="phone" value="{{ old('phone') }}" required>
                            @error('phone')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control @error('email') is-invalid @enderror" id="email" name="email" value="{{ old('email') }}">
                            @error('email')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="user_line_id" class="form-label">LINE ID</label>
                            <input type="text" class="form-control @error('user_line_id') is-invalid @enderror" id="user_line_id" name="user_line_id" value="{{ old('user_line_id') }}">
                            @error('user_line_id')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="notes" class="form-label">Additional Notes</label>
                            <textarea class="form-control @error('notes') is-invalid @enderror" id="notes" name="notes" rows="3">{{ old('notes') }}</textarea>
                            @error('notes')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Booking Details Card -->
            <div class="col-lg-6 mb-4">
                <div class="card shadow-sm">
                    <div class="card-body p-4">
                        <h5 class="fw-bold mb-4">Booking Details</h5>
                        
                        <div class="mb-3">
                            <label for="branch_id" class="form-label">Branch <span class="text-danger">*</span></label>
                            <select class="form-select @error('branch_id') is-invalid @enderror" id="branch_id" name="branch_id" required>
                                <option value="">Select Branch</option>
                                @foreach($branches as $branch)
                                    <option value="{{ $branch->id }}" {{ old('branch_id') == $branch->id ? 'selected' : '' }}>{{ $branch->name }}</option>
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
                            <div id="room-loading" class="mt-2 d-none">
                                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading available rooms...
                            </div>
                            <div class="mt-2 small">
                                <span class="status-indicator status-available"></span> Available
                                <span class="status-indicator status-unavailable ms-3"></span> Unavailable
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="check_in" class="form-label">Check-in Date <span class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <input type="date" class="form-control @error('check_in') is-invalid @enderror" id="check_in" name="check_in" value="{{ old('check_in', date('Y-m-d')) }}" min="{{ date('Y-m-d') }}" required>
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
                                        <input type="date" class="form-control @error('check_out') is-invalid @enderror" id="check_out" name="check_out" value="{{ old('check_out', date('Y-m-d', strtotime('+1 day'))) }}" min="{{ date('Y-m-d', strtotime('+1 day')) }}" required>
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
                            <input type="number" class="form-control @error('room_count') is-invalid @enderror" id="room_count" name="room_count" value="{{ old('room_count', 1) }}" min="1" required>
                            @error('room_count')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="status" class="form-label">Status <span class="text-danger">*</span></label>
                            <select class="form-select @error('status') is-invalid @enderror" id="status" name="status" required>
                                <option value="pending" {{ old('status') == 'pending' ? 'selected' : '' }}>Pending</option>
                                <option value="waiting_payment" {{ old('status') == 'waiting_payment' ? 'selected' : '' }}>Awaiting Payment</option>
                                <option value="confirmed" {{ old('status') == 'confirmed' ? 'selected' : '' }}>Confirmed</option>
                            </select>
                            @error('status')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- Booking Summary Card -->
                <div class="card shadow-sm mt-4">
                    <div class="card-body p-4">
                        <h5 class="fw-bold mb-4">Booking Summary</h5>
                        <div id="no-selection">
                            <p class="text-muted mb-0">Please select room and dates to see details.</p>
                        </div>
                        
                        <div id="room-details" class="d-none">
                            <ul class="list-unstyled mb-0">
                                <li class="mb-2">
                                    <span class="text-muted">Room:</span> <span id="room-name"></span>
                                </li>
                                <li class="mb-2">
                                    <span class="text-muted">Branch:</span> <span id="room-branch"></span>
                                </li>
                                <li class="mb-2">
                                    <i class="fi fi-sr-bed"></i> <span id="number-of-nights">-</span> nights
                                </li>
                                <li class="mb-2">
                                    <i class="fi fi-sr-door-open"></i> <span id="number-of-rooms">-</span> rooms
                                </li>
                                <li class="mb-2">
                                    <i class="fi fi-rr-moon-stars"></i> <span id="price-per-night">-</span> per night
                                </li>
                                <li class="mt-3 pt-2 border-top fw-bold">
                                    Total: <span id="total-price">-</span>
                                </li>
                            </ul>
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
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05) !important;
    }

    /* Form styling */
    .form-label {
        font-weight: 500;
        font-size: 0.9rem;
        color: #444;
        margin-bottom: 0.5rem;
    }

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

    /* Status indicators */
    .status-indicator {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 5px;
    }
    
    .status-available {
        background-color: #28a745;
    }
    
    .status-unavailable {
        background-color: #dc3545;
    }

    /* Buttons */
    .btn {
        padding: 0.5rem 1.5rem;
        border-radius: 6px;
        font-weight: 500;
        font-size: 0.9rem;
    }

    .btn-dark {
        background-color: #212529;
    }

    .btn-outline-secondary {
        color: #6c757d;
        border-color: #6c757d;
    }

    /* Headers */
    h5 {
        color: #212529;
        font-size: 1.1rem;
        position: relative;
    }

    /* Text colors */
    .text-primary {
        color: #0d6efd !important;
    }

    /* Summary section */
    #room-details li {
        font-size: 0.95rem;
        line-height: 1.6;
    }

    /* Required field indicator */
    .text-danger {
        color: #dc3545 !important;
    }

    /* Media queries */
    @media (max-width: 768px) {
        .card-body {
            padding: 1.25rem;
        }
    }
</style>
@endsection

@section('scripts')
<script>
    $(document).ready(function() {
        let availableRooms = [];
        
        // Default dates
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        
        // Format dates
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        // Set default dates
        $('#check_in').val(formatDate(today));
        $('#check_out').val(formatDate(tomorrow));
        
        // Reset room selection when branch changes
        function resetRoomSelection() {
            $('#room_id').empty().append('<option value="">Select Room</option>');
            $('#room_id').prop('disabled', true);
            $('#room-details').addClass('d-none');
            $('#no-selection').removeClass('d-none');
            availableRooms = [];
        }

        // Fetch rooms when branch is selected
        $('#branch_id').change(function() {
            resetRoomSelection();
            const branchId = $(this).val();
            
            if (!branchId) {
                return;
            }
            
            fetchRooms(branchId);
        });
        
        // Fetch rooms from API
        function fetchRooms(branchId) {
            $('#room-loading').removeClass('d-none');
            
            $.ajax({
                url: `{{ route('api.rooms.by-branch', '') }}/${branchId}`,
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    $('#room-loading').addClass('d-none');
                    $('#room_id').prop('disabled', false);
                    
                    if (response && response.length > 0) {
                        availableRooms = response;
                        updateRoomOptions(response);
                    } else {
                        $('#room_id').html('<option value="">No rooms available</option>');
                        $('#room_id').prop('disabled', true);
                    }
                },
                error: function(xhr, status, error) {
                    $('#room-loading').addClass('d-none');
                    $('#room_id').html('<option value="">Error loading rooms</option>');
                    $('#room_id').prop('disabled', true);
                    console.error('Error fetching rooms:', error);
                }
            });
        }

        // Update room options in dropdown
        function updateRoomOptions(rooms) {
            const $roomSelect = $('#room_id');
            $roomSelect.empty().append('<option value="">Select Room</option>');
            
            rooms.forEach((room, index) => {
                const isAvailable = room.status === 'available';
                
                const option = new Option(
                    `${room.name} - ฿${parseFloat(room.price_per_night).toFixed(2)}`,
                    room.id
                );
                
                $(option).attr({
                    'data-index': index,
                    'disabled': !isAvailable
                }).data('room', room);
                
                $roomSelect.append(option);
            });
        }
        
        // Show room details when selected
        $('#room_id').change(function() {
            const selectedOption = $(this).find(':selected');
            const roomIndex = selectedOption.data('index');
            
            if (roomIndex !== undefined && availableRooms[roomIndex]) {
                const room = availableRooms[roomIndex];
                updateRoomDetails(room);
            } else {
                $('#room-details').addClass('d-none');
                $('#no-selection').removeClass('d-none');
            }
        });

        // Update the booking summary details
        function updateRoomDetails(room) {
            $('#no-selection').addClass('d-none');
            $('#room-details').removeClass('d-none');
            
            $('#room-name').text(room.name);
            $('#room-branch').text($('#branch_id option:selected').text());
            $('#price-per-night').text(`฿${parseFloat(room.price_per_night).toFixed(2)}`);
            
            const checkIn = new Date($('#check_in').val());
            const checkOut = new Date($('#check_out').val());
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            
            $('#number-of-nights').text(nights);
            $('#number-of-rooms').text($('#room_count').val());
            
            const total = nights * parseFloat(room.price_per_night) * parseInt($('#room_count').val());
            $('#total-price').text(`฿${total.toFixed(2)}`);
        }
        
        // Update booking summary when these values change
        $('#check_in, #check_out, #room_count').change(function() {
            const selectedOption = $('#room_id').find(':selected');
            const roomIndex = selectedOption.data('index');
            
            if (roomIndex !== undefined && availableRooms[roomIndex]) {
                const room = availableRooms[roomIndex];
                updateRoomDetails(room);
            }
        });
        
        // Initialize rooms if branch is selected
        const initialBranchId = $('#branch_id').val();
        if (initialBranchId) {
            fetchRooms(initialBranchId);
        }
    });
</script>
@endsection