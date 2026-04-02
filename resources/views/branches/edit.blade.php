@extends('layouts.app')

@section('title', 'Edit Branch - GO Hotel Admin')

@section('page-title', 'Edit Branch')
@section('page-subtitle', 'Update branch details')

@section('content')
<div class="container-fluid py-4">
    <a href="{{ route('branches.index') }}" class="btn btn-sm btn-primary" style="margin-bottom: 30px;">
        <i class="fas fa-arrow-left me-1"></i> Back to Branches
    </a>

    <form action="{{ route('branches.update', $branch) }}" method="POST" enctype="multipart/form-data">
        @csrf
        @method('PUT')

        <div class="row">
            <!-- Branch Information Card -->
            <div class="col-lg-8 mb-4">
                <div class="card shadow-sm rounded-3">
                    <div class="card-body p-4">
                        <h5 class="mb-4">Branch Information</h5>
                        
                        <div class="mb-3">
                            <label for="name" class="form-label">Name</label>
                            <input type="text" class="form-control @error('name') is-invalid @enderror" id="name" name="name" value="{{ old('name', $branch->name) }}" required>
                            @error('name')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="description" class="form-label">Description</label>
                            <textarea class="form-control @error('description') is-invalid @enderror" id="description" name="description" rows="4">{{ old('description', $branch->description) }}</textarea>
                            @error('description')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="location" class="form-label">Location</label>
                            <input type="text" class="form-control @error('location') is-invalid @enderror" id="location" name="location" value="{{ old('location', $branch->location) }}">
                            @error('location')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="tel" class="form-label">Telephone</label>
                            <input type="text" class="form-control @error('tel') is-invalid @enderror" id="tel" name="tel" value="{{ old('tel', $branch->tel) }}">
                            @error('tel')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>
                        
                        <div class="mb-3">
                            <label for="total_rooms" class="form-label">Total Rooms</label>
                            <input type="text" class="form-control" id="total_rooms" name="total_rooms" value="{{ old('total_rooms', $branch->total_rooms ?? '0') }}">
                        </div>
                        
                        <div class="mb-3">
                            <label for="total_bookings" class="form-label">Total Bookings</label>
                            <input type="text" class="form-control" id="total_bookings" name="total_bookings" value="{{ old('total_bookings', $branch->total_bookings ?? '0') }}" readonly>
                        </div>
                        
                        <div class="mb-3">
                            <label for="map_url" class="form-label">Map URL</label>
                            <input type="url" class="form-control @error('map_url') is-invalid @enderror" id="map_url" name="map_url" value="{{ old('map_url', $branch->map_url) }}">
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
                        <h5 class="mb-4">Branch Image</h5>
                        <div class="text-center mb-3">
                            <div class="img-preview position-relative mb-3" style="min-height: 160px; background-color: #f8f9fa; border-radius: 6px; overflow: hidden;">
                                @if($branch->image)
                                    <img src="{{ \App\Helpers\ImageHelper::getImageUrl($branch->image) }}" alt="{{ $branch->name }}" class="img-fluid" style="max-height: 160px; object-fit: cover;">
                                @else
                                    <div class="d-flex align-items-center justify-content-center h-100">
                                        <button type="button" class="btn btn-outline-secondary btn-sm" onclick="document.getElementById('image').click()">
                                            <i class="fas fa-plus me-1"></i> Add Photo
                                        </button>
                                    </div>
                                    <p class="text-muted small mt-2">Or drag files here</p>
                                @endif
                            </div>
                            <input type="file" class="form-control d-none @error('image') is-invalid @enderror" id="image" name="image">
                            @error('image')
                                <div class="invalid-feedback">{{ $message }}</div>
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
                                @if(is_array($branch->nearby_shoppingmall) && count($branch->nearby_shoppingmall) > 0)
                                    @foreach($branch->nearby_shoppingmall as $item)
                                        <div class="input-group mb-2 position-relative">
                                            <input type="text" class="form-control rounded" name="nearby_shoppingmall[]" value="{{ $item }}">
                                            <button type="button" class="btn-close position-absolute end-0 top-50 translate-middle-y me-3 remove-item"></button>
                                        </div>
                                    @endforeach
                                @endif
                            </div>
                            <button type="button" class="btn btn-sm btn-primary add-item mt-2" data-type="nearby_shoppingmall">
                                <i class="fas fa-plus me-1"></i> Add a location
                            </button>
                        </div>
                        
                        <div class="mb-4">
                            <label class="text-muted mb-3">Attractions</label>
                            <div class="nearby-items">
                                @forelse($branch->nearby_attractions ?? [] as $item)
                                    <div class="input-group mb-2 position-relative">
                                        <input type="text" class="form-control rounded" name="nearby_attractions[]" value="{{ $item }}">
                                        <button type="button" class="btn-close position-absolute end-0 top-50 translate-middle-y me-3 remove-item"></button>
                                    </div>
                                @empty
                                @endforelse
                            </div>
                            <button type="button" class="btn btn-sm btn-primary add-item mt-2" data-type="nearby_attractions">
                                <i class="fas fa-plus me-1"></i> Add a location
                            </button>
                        </div>
                        
                        <div class="mb-4">
                            <label class="text-muted mb-3">Industrial Estates</label>
                            <div class="nearby-items">
                                @forelse($branch->nearby_industrialestates ?? [] as $item)
                                    <div class="input-group mb-2 position-relative">
                                        <input type="text" class="form-control rounded" name="nearby_industrialestates[]" value="{{ $item }}">
                                        <button type="button" class="btn-close position-absolute end-0 top-50 translate-middle-y me-3 remove-item"></button>
                                    </div>
                                @empty
                                @endforelse
                            </div>
                            <button type="button" class="btn btn-sm btn-primary add-item mt-2" data-type="nearby_industrialestates">
                                <i class="fas fa-plus me-1"></i> Add a location
                            </button>
                        </div>
                        
                        <div class="mb-4">
                            <label class="text-muted mb-3">Government Institutions</label>
                            <div class="nearby-items">
                                @forelse($branch->nearby_governmentinstitutions ?? [] as $item)
                                    <div class="input-group mb-2 position-relative">
                                        <input type="text" class="form-control rounded" name="nearby_governmentinstitutions[]" value="{{ $item }}">
                                        <button type="button" class="btn-close position-absolute end-0 top-50 translate-middle-y me-3 remove-item"></button>
                                    </div>
                                @empty
                                @endforelse
                            </div>
                            <button type="button" class="btn btn-sm btn-primary add-item mt-2" data-type="nearby_governmentinstitutions">
                                <i class="fas fa-plus me-1"></i> Add a location
                            </button>
                        </div>
                        
                        <div class="d-flex justify-content-end mt-4">
                            <button type="reset" class="btn btn-sm btn-primary"><i class="fi fi-tr-rotate-reverse"></i> Reset</button>
                            <button type="submit" class="btn btn-sm btn-primary">Update Branch</button>
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
                    $('.img-preview').html(`<img src="${e.target.result}" class="img-fluid" style="max-height: 160px; width: 100%; object-fit: cover;">`);
                }
                reader.readAsDataURL(file);
            }
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
                document.getElementById('image').files = dt.files;
                const reader = new FileReader();
                reader.onload = function(e) {
                    $('.img-preview').html(`<img src="${e.target.result}" class="img-fluid" style="max-height: 160px; width: 100%; object-fit: cover;">`);
                }
                reader.readAsDataURL(file);
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
    });
</script>
@endsection
