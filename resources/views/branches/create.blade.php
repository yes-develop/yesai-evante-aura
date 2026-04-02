@extends('layouts.app')

@section('title', 'Add Branch - GO Hotel Admin')

@section('page-title', 'Add New Branch')
@section('page-subtitle', 'Create a new hotel branch location')

@section('content')
<div class="container-fluid py-4">
    <a href="{{ route('branches.index') }}" class="btn btn-sm btn-primary" style="margin-bottom: 30px;">
        <i class="fas fa-arrow-left me-1"></i> Back to Branches
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

    <form action="{{ route('branches.store') }}" method="POST" enctype="multipart/form-data" id="createBranchForm">
        @csrf

        <div class="row">
            <!-- Branch Information Card -->
            <div class="col-lg-8 mb-4">
                <div class="card shadow-sm rounded-3">
                    <div class="card-body p-4">
                        <h5 class="mb-4">Branch Information</h5>
                        
                        <div class="mb-3">
                            <label for="name" class="form-label">Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('name') is-invalid @enderror" id="name" name="name" value="{{ old('name') }}" required>
                            @error('name')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="description" class="form-label">Description</label>
<textarea class="form-control @error('description') is-invalid @enderror" id="description" name="description" rows="4">{{ old('description') }}</textarea>
@error('description')
    <div class="invalid-feedback">{{ $message }}</div>
@enderror
<!-- Description ไม่ required -->
                        </div>
                        
                        <div class="mb-3">
                            <label for="location" class="form-label">Location <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('location') is-invalid @enderror" id="location" name="location" value="{{ old('location') }}" required>
                            @error('location')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="tel" class="form-label">Telephone <span class="text-danger">*</span></label>
                            <input type="text" class="form-control @error('tel') is-invalid @enderror" id="tel" name="tel" value="{{ old('tel') }}" required>
                            @error('tel')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="total_rooms" class="form-label">Total Rooms <span class="text-danger">*</span></label>
                            <input type="number" class="form-control @error('total_rooms') is-invalid @enderror" id="total_rooms" name="total_rooms" value="{{ old('total_rooms', '0') }}" required min="0">
                            @error('total_rooms')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="total_bookings" class="form-label">Total Bookings</label>
                            <input type="text" class="form-control" id="total_bookings" name="total_bookings" value="{{ old('total_bookings', '0') }}" readonly>
                        </div>
                        
                        <div class="mb-3">
                            <label for="map_url" class="form-label">Map URL</label>
                            <input type="url" class="form-control @error('map_url') is-invalid @enderror" id="map_url" name="map_url" value="{{ old('map_url') }}">
                            @error('map_url')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Branch Image Card -->
            <div class="col-lg-4 mb-4">
                <div class="card shadow-sm rounded-3">
                    <div class="card-body p-4">
                        <h5 class="mb-4">Branch Image <span class="text-danger">*</span></h5>
                        <div class="text-center">
                            <div class="img-preview position-relative mb-3" style="min-height: 200px; background-color: #f8f9fa; border-radius: 6px; overflow: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                <div class="upload-placeholder">
                                    <button type="button" class="btn btn-outline-secondary mb-2" onclick="document.getElementById('image').click()">
                                        <i class="fas fa-plus me-1"></i> Add Photo
                                    </button>
                                    <p class="text-muted mb-0">Or drag files here</p>
                                </div>
                            </div>
                            <input type="file" class="form-control d-none @error('image') is-invalid @enderror" id="image" name="image" accept="image/*" required>
                            @error('image')
                                <div class="invalid-feedback d-block">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Nearby Places Card -->
            <div class="col-12 mb-4">
                <div class="card shadow-sm rounded-3">
                    <div class="card-body p-4">
                        <h5 class="mb-4">Nearby Places</h5>
                        
                        <div class="mb-4">
                            <label class="text-muted mb-3">Shopping Malls</label>
                            <div class="nearby-items">
                                @if(old('nearby_shoppingmall'))
                                    @foreach(old('nearby_shoppingmall') as $item)
                                        <div class="input-group mb-2 position-relative">
                                            <input type="text" class="form-control rounded" name="nearby_shoppingmall[]" value="{{ $item }}">
                                            <button type="button" class="btn-close position-absolute end-0 top-50 translate-middle-y me-3 remove-item"></button>
                                        </div>
                                    @endforeach
                                @else
                                    <div class="input-group mb-2 position-relative">
                                        <input type="text" class="form-control rounded" name="nearby_shoppingmall[]">
                                        <button type="button" class="btn-close position-absolute end-0 top-50 translate-middle-y me-3 remove-item"></button>
                                    </div>
                                @endif
                            </div>
                            <button type="button" class="btn btn-sm btn-primary add-item mt-2" data-type="nearby_shoppingmall">
                                <i class="fas fa-plus me-1"></i> Add a location
                            </button>
                        </div>
                        
                        <div class="mb-4">
                            <label class="text-muted mb-3">Attractions</label>
                            <div class="nearby-items">
                                @if(old('nearby_attractions'))
                                    @foreach(old('nearby_attractions') as $item)
                                        <div class="input-group mb-2 position-relative">
                                            <input type="text" class="form-control rounded" name="nearby_attractions[]" value="{{ $item }}">
                                            <button type="button" class="btn-close position-absolute end-0 top-50 translate-middle-y me-3 remove-item"></button>
                                        </div>
                                    @endforeach
                                @else
                                    <div class="input-group mb-2 position-relative">
                                        <input type="text" class="form-control rounded" name="nearby_attractions[]">
                                        <button type="button" class="btn-close position-absolute end-0 top-50 translate-middle-y me-3 remove-item"></button>
                                    </div>
                                @endif
                            </div>
                            <button type="button" class="btn btn-sm btn-primary add-item mt-2" data-type="nearby_attractions">
                                <i class="fas fa-plus me-1"></i> Add a location
                            </button>
                        </div>
                        
                        <div class="mb-4">
                            <label class="text-muted mb-3">Industrial Estates</label>
                            <div class="nearby-items">
                                @if(old('nearby_industrialestates'))
                                    @foreach(old('nearby_industrialestates') as $item)
                                        <div class="input-group mb-2 position-relative">
                                            <input type="text" class="form-control rounded" name="nearby_industrialestates[]" value="{{ $item }}">
                                            <button type="button" class="btn-close position-absolute end-0 top-50 translate-middle-y me-3 remove-item"></button>
                                        </div>
                                    @endforeach
                                @else
                                    <div class="input-group mb-2 position-relative">
                                        <input type="text" class="form-control rounded" name="nearby_industrialestates[]">
                                        <button type="button" class="btn-close position-absolute end-0 top-50 translate-middle-y me-3 remove-item"></button>
                                    </div>
                                @endif
                            </div>
                            <button type="button" class="btn btn-sm btn-primary add-item mt-2" data-type="nearby_industrialestates">
                                <i class="fas fa-plus me-1"></i> Add a location
                            </button>
                        </div>
                        
                        <div class="mb-4">
                            <label class="text-muted mb-3">Government Institutions</label>
                            <div class="nearby-items">
                                @if(old('nearby_governmentinstitutions'))
                                    @foreach(old('nearby_governmentinstitutions') as $item)
                                        <div class="input-group mb-2 position-relative">
                                            <input type="text" class="form-control rounded" name="nearby_governmentinstitutions[]" value="{{ $item }}">
                                            <button type="button" class="btn-close position-absolute end-0 top-50 translate-middle-y me-3 remove-item"></button>
                                        </div>
                                    @endforeach
                                @else
                                    <div class="input-group mb-2 position-relative">
                                        <input type="text" class="form-control rounded" name="nearby_governmentinstitutions[]">
                                        <button type="button" class="btn-close position-absolute end-0 top-50 translate-middle-y me-3 remove-item"></button>
                                    </div>
                                @endif
                            </div>
                            <button type="button" class="btn btn-sm btn-primary add-item mt-2" data-type="nearby_governmentinstitutions">
                                <i class="fas fa-plus me-1"></i> Add a location
                            </button>
                        </div>
                        
                        <div class="d-flex justify-content-end mt-4">
                            <button type="reset" class="btn btn-sm btn-primary me-2"><i class="fi fi-tr-rotate-reverse"></i> Reset</button>
                            <button type="submit" class="btn btn-sm btn-primary">Create Branch</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection

@section('scripts')
<script>
    $(document).ready(function() {
        // Image preview
        $('#image').change(function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    $('.img-preview').html(`
                        <img src="${e.target.result}" class="img-fluid" style="max-height: 200px; width: 100%; object-fit: cover;">
                        <button type="button" class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2 remove-image">
                            <i class="fas fa-times"></i>
                        </button>
                    `);
                }
                reader.readAsDataURL(file);
            }
        });

        // Remove image
        $(document).on('click', '.remove-image', function() {
            $('#image').val('');
            $('.img-preview').html(`
                <div class="upload-placeholder">
                    <button type="button" class="btn btn-outline-secondary mb-2" onclick="document.getElementById('image').click()">
                        <i class="fas fa-plus me-1"></i> Add Photo
                    </button>
                    <p class="text-muted mb-0">Or drag files here</p>
                </div>
            `);
        });
        
        // Drag and drop for image upload
        const dropzone = $('.img-preview');
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone[0].addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Highlight drop area when item is dragged over
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone[0].addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropzone[0].addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            dropzone.addClass('border border-primary');
        }
        
        function unhighlight() {
            dropzone.removeClass('border border-primary');
        }
        
        // Handle dropped files
        dropzone[0].addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    document.getElementById('image').files = dt.files;
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        $('.img-preview').html(`
                            <img src="${e.target.result}" class="img-fluid" style="max-height: 200px; width: 100%; object-fit: cover;">
                            <button type="button" class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2 remove-image">
                                <i class="fas fa-times"></i>
                            </button>
                        `);
                    }
                    reader.readAsDataURL(file);
                } else {
                    alert('Please upload an image file');
                }
            }
        }
        
        // Add more items functionality
        $('.add-item').click(function() {
            const container = $(this).prev('.nearby-items');
            const type = $(this).data('type');
            
            // Ensure we're using the right field name pattern
            let fieldName = type;
            if (!fieldName.startsWith('nearby_')) {
                fieldName = 'nearby_' + fieldName;
            }
            
            const newItem = `
                <div class="input-group mb-2 position-relative">
                    <input type="text" class="form-control rounded" name="${fieldName}[]" placeholder="Enter location">
                    <button type="button" class="btn-close position-absolute end-0 top-50 translate-middle-y me-3 remove-item"></button>
                </div>
            `;
            container.append(newItem);
            
            // Add remove handler
            initRemoveHandlers();
        });
        
        // Initialize remove handlers
        function initRemoveHandlers() {
            $('.remove-item').off('click').on('click', function() {
                $(this).closest('.input-group').remove();
            });
        }
        
        // Call on page load
        initRemoveHandlers();

        // Form validation before submit
        $('#createBranchForm').on('submit', function(e) {
            let isValid = true;
            const requiredFields = ['name', 'location', 'tel', 'total_rooms', 'image']; // ตัด description ออก
            
            requiredFields.forEach(field => {
                const input = $(`#${field}`);
                if (!input.val()) {
                    input.addClass('is-invalid');
                    isValid = false;
                } else {
                    input.removeClass('is-invalid');
                }
            });

            if (!isValid) {
                e.preventDefault();
                alert('Please fill in all required fields and upload a branch image.');
                return false;
            }
        });
    });
</script>
@endsection