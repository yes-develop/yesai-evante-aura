@extends('layouts.app')

@section('title', 'Edit Room - GO Hotel Admin')

@section('page-title', 'Edit Room')
@section('page-subtitle', 'Update room details')

@section('content')
<div class="container-fluid py-4">
    <a href="{{ route('rooms.index') }}" class="btn btn-sm btn-primary" style="margin-bottom: 30px;">
        <i class="fas fa-arrow-left me-1"></i> Back to Rooms
    </a>

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

    <form action="{{ route('rooms.update', $room) }}" method="POST" enctype="multipart/form-data" id="editRoomForm">
        @csrf
        @method('PUT')
        
        <div class="row">
            <!-- Room Information Card -->
            <div class="col-lg-8 mb-4">
                <div class="card shadow-sm rounded-3">
                    <div class="card-body p-4">
                        <h5 class="mb-4">Room Information</h5>

                        <div class="mb-3">
                            <label for="name" class="form-label">Room Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('name') is-invalid @enderror" id="name"
                                name="name" value="{{ old('name', $room->name) }}" required>
                            @error('name')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label for="branch_id" class="form-label">Branch <span class="text-danger">*</span></label>
                            <select class="form-select @error('branch_id') is-invalid @enderror" id="branch_id"
                                name="branch_id" required>
                                <option value="" disabled>Select Branch</option>
                                @foreach ($branches as $branch)
                                    <option value="{{ $branch->id }}"
                                        {{ (old('branch_id', $room->branch_id) == $branch->id) ? 'selected' : '' }}>
                                        {{ $branch->name }}
                                    </option>
                                @endforeach
                            </select>
                            @error('branch_id')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label for="description" class="form-label">Description</label>
                            <textarea class="form-control @error('description') is-invalid @enderror" id="description" name="description"
                                rows="4">{{ old('description', $room->description) }}</textarea>
                            @error('description')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="price_per_night" class="form-label">Price Per Night <span
                                            class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text">฿</span>
                                        <input type="number" step="0.01"
                                            class="form-control @error('price_per_night') is-invalid @enderror"
                                            id="price_per_night" name="price_per_night"
                                            value="{{ old('price_per_night', $room->price_per_night) }}" required>
                                    </div>
                                    @error('price_per_night')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="discount" class="form-label">Discount <span
                                            class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <span class="input-group-text">฿</span>
                                        <input type="number" step="0.01"
                                            class="form-control @error('discount') is-invalid @enderror"
                                            id="discount" name="discount"
                                            value="{{ old('discount', $room->discount) }}" required>
                                    </div>
                                    @error('discount')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="total_rooms" class="form-label">Total Rooms <span
                                            class="text-danger">*</span></label>
                                    <input type="number" class="form-control @error('total_rooms') is-invalid @enderror"
                                        id="total_rooms" name="total_rooms"
                                        value="{{ old('total_rooms', $room->total_rooms) }}" required>
                                    @error('total_rooms')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="bed_type" class="form-label">Bed Type <span
                                            class="text-danger">*</span></label>
                                    <select class="form-select @error('bed_type') is-invalid @enderror" id="bed_type"
                                        name="bed_type" required>
                                        <option value="" disabled>-- Select Bed Type --</option>
                                        <option value="Twin Bed"
                                            {{ (strtolower(old('bed_type', $room->bed_type)) == strtolower('Twin Bed')) ? 'selected' : '' }}>Twin Bed
                                        </option>
                                        <option value="XL King Size Bed"
                                            {{ (strtolower(old('bed_type', $room->bed_type)) == strtolower('XL King Size Bed')) ? 'selected' : '' }}>XL King Size Bed</option>
                                    </select>
                                    @error('bed_type')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="size_room" class="form-label">Room Size <span
                                            class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('size_room') is-invalid @enderror"
                                        id="size_room" name="size_room" value="{{ old('size_room', $room->size_room) }}"
                                        required>
                                    @error('size_room')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="max_guests" class="form-label">Max Guests <span
                                            class="text-danger">*</span></label>
                                    <input type="number" class="form-control @error('max_guests') is-invalid @enderror"
                                        id="max_guests" name="max_guests"
                                        value="{{ old('max_guests', $room->max_guests) }}" required>
                                    @error('max_guests')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="status" class="form-label">Status <span
                                            class="text-danger">*</span></label>
                                    <select class="form-select @error('status') is-invalid @enderror" id="status"
                                        name="status" required>
                                        <option value="" disabled>-- Select Status --</option>
                                        <option value="available"
                                            {{ (old('status', $room->status) == 'available') ? 'selected' : '' }}>Available
                                        </option>
                                        <option value="booked"
                                            {{ (old('status', $room->status) == 'booked') ? 'selected' : '' }}>Booked
                                        </option>
                                        <option value="unavailable"
                                            {{ (old('status', $room->status) == 'unavailable') ? 'selected' : '' }}>
                                            Unavailable</option>
                                    </select>
                                    @error('status')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Room Images Card -->
            <div class="col-lg-4 mb-4">
                <div class="card shadow-sm rounded-3">
                    <div class="card-body p-4">
                        <h5 class="mb-4">Room Images</h5>
                        <div class="text-center">
                            <div class="img-preview position-relative mb-3" style="min-height: 160px; background-color: #f8f9fa; border-radius: 6px; overflow: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                @if($room->images && $room->images->count() > 0)
                                    <img src="{{ asset('storage/' . $room->images->first()->image_url) }}" alt="{{ $room->name }}" class="img-fluid" style="max-height: 160px; object-fit: cover;">
                                @else
                                    <div class="d-flex align-items-center justify-content-center h-100">
                                        <button type="button" class="btn btn-outline-secondary btn-sm" onclick="document.getElementById('images').click()">
                                            <i class="fas fa-plus me-1"></i> Add Photos
                                        </button>
                                    </div>
                                    <p class="text-muted small mt-2">Or drag files here</p>
                                @endif
                            </div>
                            <input type="file" class="form-control d-none @error('images.*') is-invalid @enderror" id="images" name="images[]" accept="image/*" multiple>
                            @error('images.*')
                                <div class="invalid-feedback d-block">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <!-- Existing Images -->
                        @if($room->images && $room->images->count() > 0)
                            <div id="existing-images" class="row g-2 mt-3">
                                @foreach($room->images as $image)
                                <div class="col-6 position-relative">
                                    <img src="{{ asset('storage/' . $image->image_url) }}" class="img-fluid rounded" alt="Room image" style="height: 60px; object-fit: cover; width: 100%;">
                                    <button type="button" class="btn-close position-absolute end-0 top-0 m-1 remove-image" data-image-id="{{ $image->id }}"></button>
                                </div>
                                @endforeach
                            </div>
                        @endif
                        
                        <!-- New Images Preview -->
                        <div id="preview-container" class="row g-2 mt-2"></div>
                    </div>
                </div>
            </div>
            
            <!-- Room Amenities Card -->
            <div class="col-12 mb-4">
                <div class="card shadow-sm rounded-3">
                    <div class="card-body p-4">
                        <h5 class="mb-4">Room Amenities</h5>
                        
                        <div class="mb-4">
                            <label class="text-muted mb-3">Common Amenities</label>
                            <div class="row">
                                @php
                                    $amenities = old('amenities', $room->amenities) ?? [];
                                    if (!is_array($amenities)) {
                                        $amenities = json_decode($amenities, true) ?? [];
                                    }

                                    $commonAmenities = [
                                        'Air conditioning',
                                        'Free WiFi',
                                        'TV',
                                        'Refrigerator',
                                        'Shower',
                                        'Bathtub',
                                        'Hair dryer',
                                        'Safe',
                                        'Desk',
                                        'Coffee maker',
                                        'Kettle',
                                        'Microwave',
                                        'Balcony',
                                        'Sea view',
                                        'City view',
                                        'Garden view',
                                        'Free bottle water',
                                        'Hair conditioning',
                                        'Water heater',
                                        'LCD television',
                                        'Work desk',
                                        'Fridge',
                                        'Body gel or soap',
                                        'Desk chair',
                                        'Cable or satellite television',
                                        'Shampoo',
                                    ];
                                @endphp

                                @foreach ($commonAmenities as $amenity)
                                    <div class="col-md-3 col-sm-6 mb-2">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" name="amenities[]"
                                                value="{{ $amenity }}" id="amenity_{{ Str::slug($amenity) }}"
                                                {{ in_array($amenity, $amenities) ? 'checked' : '' }}>
                                            <label class="form-check-label" for="amenity_{{ Str::slug($amenity) }}">
                                                {{ $amenity }}
                                            </label>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label class="text-muted mb-3">Additional Amenities</label>
                            <div class="additional-amenities">
                                @php
                                    $customAmenities = array_diff($amenities, $commonAmenities);
                                @endphp

                                @foreach ($customAmenities as $customAmenity)
                                    <div class="input-group mb-2 position-relative">
                                        <input type="text" class="form-control rounded" name="amenities[]" value="{{ $customAmenity }}">
                                        <button type="button" class="btn-close position-absolute end-0 top-50 translate-middle-y me-3 remove-amenity"></button>
                                    </div>
                                @endforeach
                            </div>
                            <button type="button" class="btn btn-sm btn-primary add-amenity mt-2">
                                <i class="fas fa-plus me-1"></i> Add amenity
                            </button>
                        </div>
                        
                        <div class="d-flex justify-content-end mt-4">
                            <button type="reset" class="btn btn-sm btn-primary me-2" id="resetBtn"><i class="fas fa-rotate-left me-1"></i> Reset</button>
                            <button type="submit" class="btn btn-sm btn-primary">Update Room</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Hidden inputs for tracking deleted images -->
        <div id="delete-images-container"></div>
    </form>
</div>
@endsection

@section('styles')
    <style>
        .room-image-card {
            border: 1px solid #dee2e6;
            border-radius: 6px;
            overflow: hidden;
        }

        .room-image-container {
            width: 100%;
            height: 120px;
            overflow: hidden;
        }

        .room-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .preview-image-container {
            position: relative;
            height: 120px;
            overflow: hidden;
            border-radius: 6px;
            border: 1px solid #dee2e6;
        }

        .preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .remove-preview {
            position: absolute;
            top: 5px;
            right: 5px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
        
        .form-label {
            font-weight: 500;
        }
        
        .text-muted {
            font-weight: 500;
        }

        .form-text {
            color: #6c757d;
            font-size: 0.875em;
            margin-top: 0.25rem;
        }
    </style>
@endsection

@section('scripts')
<script>
    $(document).ready(function() {
        // Store original form values
        const originalFormValues = $('#editRoomForm').serialize();
        
        // Image preview
        $('#images').change(function() {
            const files = this.files;
            $('#preview-container').empty();

            if (files.length > 0) {
                // If there's no existing image, replace the upload button with the first image
                if (!$('.img-preview img').length) {
                    $('.img-preview').empty();
                }
                
                // Display first image in the preview section
                const firstFile = files[0];
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (!$('.img-preview img').length) {
                        $('.img-preview').html(`<img src="${e.target.result}" class="img-fluid" style="max-height: 160px; width: 100%; object-fit: cover;">`);
                    }
                }
                reader.readAsDataURL(firstFile);
                
                // Display all images in the thumbnails
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const reader = new FileReader();

                    reader.onload = function(e) {
                        $('#preview-container').append(`
                            <div class="col-6 position-relative">
                                <img src="${e.target.result}" class="img-fluid rounded" style="height: 60px; object-fit: cover; width: 100%;">
                                <button type="button" class="btn-close position-absolute end-0 top-0 m-1 remove-preview"></button>
                            </div>
                        `);
                    }

                    reader.readAsDataURL(file);
                }
            }
        });
        
        // Drag and drop for image upload
        const dropzone = $('.img-preview');
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone[0]?.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Highlight drop area when item is dragged over
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone[0]?.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropzone[0]?.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            dropzone.addClass('border border-primary');
        }
        
        function unhighlight() {
            dropzone.removeClass('border border-primary');
        }
        
        // Handle dropped files
        dropzone[0]?.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length) {
                document.getElementById('images').files = dt.files;
                
                // Display first image in preview only if there's no image already
                if (!$('.img-preview img').length) {
                    const file = files[0];
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        $('.img-preview').html(`<img src="${e.target.result}" class="img-fluid" style="max-height: 160px; width: 100%; object-fit: cover;">`);
                    }
                    reader.readAsDataURL(file);
                }
                
                // Display all images in thumbnails
                $('#preview-container').empty();
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        $('#preview-container').append(`
                            <div class="col-6 position-relative">
                                <img src="${e.target.result}" class="img-fluid rounded" style="height: 60px; object-fit: cover; width: 100%;">
                                <button type="button" class="btn-close position-absolute end-0 top-0 m-1 remove-preview"></button>
                            </div>
                        `);
                    }
                    reader.readAsDataURL(file);
                }
            }
        }

        // Add amenity
        $('.add-amenity').click(function() {
            $('.additional-amenities').append(`
                <div class="input-group mb-2 position-relative">
                    <input type="text" class="form-control rounded" name="amenities[]" placeholder="Enter amenity">
                    <button type="button" class="btn-close position-absolute end-0 top-50 translate-middle-y me-3 remove-amenity"></button>
                </div>
            `);
            
            // Initialize remove handlers
            initRemoveHandlers();
        });
        
        // Reset form to original values
        $('#resetBtn').click(function(e) {
            e.preventDefault();
            
            if (confirm('Are you sure you want to reset the form to its original values?')) {
                location.reload();
            }
        });
        
        // Form submission validation
        $('#editRoomForm').on('submit', function(e) {
            let isValid = true;
            const requiredFields = ['name', 'branch_id', 'price_per_night', 'total_rooms', 'bed_type', 'size_room', 'max_guests', 'status'];
            
            requiredFields.forEach(field => {
                const input = $(`#${field}`);
                if (!input.val()) {
                    input.addClass('is-invalid');
                    if (!input.next('.invalid-feedback').length) {
                        input.after(`<div class="invalid-feedback">This field is required.</div>`);
                    }
                    isValid = false;
                } else {
                    input.removeClass('is-invalid');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                alert('Please fill in all required fields.');
                return false;
            }
            
            return true;
        });
        
        // Initialize remove handlers
        function initRemoveHandlers() {
            $('.remove-amenity').off('click').on('click', function() {
                $(this).closest('.input-group').remove();
            });
            
            $('.remove-preview').off('click').on('click', function() {
                $(this).closest('.col-6').remove();
            });
            
            $('.remove-image').off('click').on('click', function() {
                const imageId = $(this).data('image-id');
                const container = $(this).closest('.col-6');
                
                if (confirm('Are you sure you want to remove this image?')) {
                    // Add a hidden input to mark this image for deletion
                    $('#delete-images-container').append(`
                        <input type="hidden" name="delete_images[]" value="${imageId}">
                    `);
                    
                    container.remove();
                    
                    // If we removed the last image, show the upload button
                    if ($('#existing-images .col-6').length === 0 && !$('.img-preview img').length) {
                        $('.img-preview').html(`
                            <div class="d-flex align-items-center justify-content-center h-100">
                                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="document.getElementById('images').click()">
                                    <i class="fas fa-plus me-1"></i> Add Photos
                                </button>
                            </div>
                            <p class="text-muted small mt-2">Or drag files here</p>
                        `);
                    }
                }
            });
        }
        
        // Call on page load
        initRemoveHandlers();
    });
</script>
@endsection
