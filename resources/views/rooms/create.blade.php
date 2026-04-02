@extends('layouts.app')

@section('title', 'Add Room - GO Hotel Admin')

@section('page-title', 'Add New Room')
@section('page-subtitle', 'Create a new hotel room')

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

    <form action="{{ route('rooms.store') }}" method="POST" enctype="multipart/form-data" id="createRoomForm">
        @csrf
        <div class="row">
            <!-- Room Information Card -->
            <div class="col-lg-8 mb-4">
                <div class="card shadow-sm rounded-3">
                    <div class="card-body p-4">
                        <h5 class="mb-4">Room Information</h5>
                        <hr>

                        <div class="mb-3">
                            <label for="name" class="form-label">Room Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('name') is-invalid @enderror" id="name"
                                name="name" value="{{ old('name') }}" required>
                            @error('name')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label for="branch_id" class="form-label">Branch <span class="text-danger">*</span></label>
                            <select class="form-select @error('branch_id') is-invalid @enderror" id="branch_id"
                                name="branch_id" required>
                                <option value="">Select Branch</option>
                                @foreach ($branches as $branch)
                                    <option value="{{ $branch->id }}"
                                        {{ old('branch_id') == $branch->id || request('branch_id') == $branch->id ? 'selected' : '' }}>
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
                                rows="4">{{ old('description') }}</textarea>
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
                                            value="{{ old('price_per_night') }}" required>
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
                                            value="{{ old('discount', 0) }}" required>
                                    </div>
                                    @error('discount')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="total_rooms" class="form-label">Total Rooms <span
                                            class="text-danger">*</span></label>
                                    <input type="number" class="form-control @error('total_rooms') is-invalid @enderror"
                                        id="total_rooms" name="total_rooms" value="{{ old('total_rooms', 1) }}" required>
                                    @error('total_rooms')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="bed_type" class="form-label">Bed Type <span
                                            class="text-danger">*</span></label>
                                    <select class="form-select @error('bed_type') is-invalid @enderror" id="bed_type"
                                        name="bed_type" required>
                                        <option value="">-- Select Bed Type --</option>
                                        <option value="GO Twin" {{ old('bed_type') == 'GO Twin' ? 'selected' : '' }}>GO
                                            Twin</option>
                                        <option value="GO Double" {{ old('bed_type') == 'GO Double' ? 'selected' : '' }}>GO
                                            Double</option>
                                    </select>
                                    @error('bed_type')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="size_room" class="form-label">Room Size <span
                                            class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('size_room') is-invalid @enderror"
                                        id="size_room" name="size_room" value="{{ old('size_room') }}" required>
                                    @error('size_room')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="max_guests" class="form-label">Max Guests <span
                                            class="text-danger">*</span></label>
                                    <input type="number" class="form-control @error('max_guests') is-invalid @enderror"
                                        id="max_guests" name="max_guests" value="{{ old('max_guests', 2) }}" required>
                                    @error('max_guests')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="status" class="form-label">Status <span
                                            class="text-danger">*</span></label>
                                    <select class="form-select @error('status') is-invalid @enderror" id="status"
                                        name="status" required>
                                        <option value="available" {{ old('status') == 'available' ? 'selected' : '' }}>
                                            Available</option>
                                        <option value="booked" {{ old('status') == 'booked' ? 'selected' : '' }}>Booked
                                        </option>
                                        <option value="unavailable"
                                            {{ old('status') == 'unavailable' ? 'selected' : '' }}>Unavailable</option>
                                    </select>
                                    @error('status')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <h5 class="mt-4">Room Amenities</h5>
                        <hr>

                        <div class="mb-3">
                            <div class="amenities-container">
                                @php
                                    $amenities = old('amenities', []) ?? [];

                                    $commonAmenities = [
                                        'Air Conditioning',
                                        'Free WiFi',
                                        'TV',
                                        'Refrigerator',
                                        'Shower',
                                        'Bathtub',
                                        'Hair Dryer',
                                        'Safe',
                                        'Desk',
                                        'Coffee Maker',
                                        'Kettle',
                                        'Microwave',
                                        'Balcony',
                                        'Sea View',
                                    ];
                                @endphp

                                <div class="row">
                                    @foreach ($commonAmenities as $amenity)
                                        <div class="col-md-3 col-sm-4 mb-2">
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

                                <div class="mt-3">
                                    <label class="form-label">Additional Amenities</label>
                                    <div class="custom-amenities">
                                        <div class="input-group mb-2 custom-amenity-template" style="display: none;">
                                            <input type="text" class="form-control" name="amenities[]" disabled>
                                            <button type="button" class="btn btn-danger remove-amenity"><i
                                                    class="fas fa-minus"></i></button>
                                        </div>

                                        @if (!empty(old('custom_amenities')))
                                            @foreach (old('custom_amenities') as $customAmenity)
                                                @if (!empty($customAmenity))
                                                    <div class="input-group mb-2">
                                                        <input type="text" class="form-control" name="amenities[]"
                                                            value="{{ $customAmenity }}">
                                                        <button type="button" class="btn btn-danger remove-amenity"><i
                                                                class="fas fa-minus"></i></button>
                                                    </div>
                                                @endif
                                            @endforeach
                                        @endif
                                    </div>

                                    <div class="mt-2">
                                        <button type="button" class="btn btn-sm btn-primary">
                                            <i class="fas fa-plus"></i> Add Amenity
                                        </button>
                                    </div>
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
                        <h5 class="mb-4">Room Images <span class="text-danger">*</span></h5>
                        <div class="text-center">
                            <div class="img-preview position-relative mb-3" style="min-height: 200px; background-color: #f8f9fa; border-radius: 6px; overflow: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                <div class="upload-placeholder">
                                    <button type="button" class="btn btn-outline-secondary mb-2" onclick="document.getElementById('images').click()">
                                        <i class="fas fa-plus me-1"></i> Add Photos
                                    </button>
                                    <p class="text-muted mb-0">Or drag files here</p>
                                </div>
                            </div>
                            <input type="file" class="form-control d-none @error('images.*') is-invalid @enderror" id="images" name="images[]" accept="image/*" multiple required>
                            @error('images.*')
                                <div class="invalid-feedback d-block">{{ $message }}</div>
                            @enderror
                        </div>
                        <div id="preview-container" class="row g-2 mt-2"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card shadow-sm rounded-3 mb-4">
            <div class="card-body p-4">
                <div class="d-flex justify-content-end">
                    <button type="reset" class="btn btn-sm btn-primary me-2"><i class="fi fi-tr-rotate-reverse"></i> Reset</button>
                    <button type="submit" class="btn btn-sm btn-primary">Create Room</button>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection

@section('styles')
    <style>
        .preview-image-container {
            position: relative;
            height: 120px;
            overflow: hidden;
            border-radius: 6px;
            border: 1px solid #dee2e6;
            margin-bottom: 15px;
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
            border-radius: 50%;
            width: 25px;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }

        .form-check-input:checked+.form-check-label {
            font-weight: bold;
            color: #0d6efd;
        }
    </style>
@endsection

@section('scripts')
    <script>
        $(document).ready(function() {
            // Image preview
            $('#images').change(function() {
                const files = this.files;
                const previewContainer = $('#preview-container');

                // Clear previous previews
                previewContainer.empty();

                if (files.length > 0) {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const reader = new FileReader();

                        reader.onload = function(e) {
                            previewContainer.append(`
                            <div class="col-6 col-md-12 col-lg-6">
                                <div class="preview-image-container">
                                    <img src="${e.target.result}" class="preview-image" alt="Room Image Preview">
                                    <div class="remove-preview" data-index="${i}">
                                        <i class="fas fa-times"></i>
                                    </div>
                                </div>
                            </div>
                        `);
                        }

                        reader.readAsDataURL(file);
                    }
                }
            });

            // Handle remove image preview
            $(document).on('click', '.remove-preview', function() {
                const index = $(this).data('index');
                $(this).closest('.col-6').remove();

                // Note: This doesn't actually remove the file from the input
                // To truly remove the file, we would need to create a new FileList
                // which is not directly possible, so server-side validation is still needed
            });

            // Add more amenities functionality
            $('.add-amenity').click(function() {
                const template = $('.custom-amenity-template').clone();
                template.removeClass('custom-amenity-template');
                template.find('input').prop('disabled', false);
                template.show();
                $('.custom-amenities').append(template);
            });

            // Remove amenity
            $(document).on('click', '.remove-amenity', function() {
                $(this).closest('.input-group').remove();
            });
        });
    </script>
@endsection
