<div>
    <h2 class="mb-4">Dashboard</h2>

    @if(session()->has('message'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('message') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    @if(isset($error))
    <div class="alert alert-warning">
        <p><strong>ข้อมูลอาจยังไม่พร้อม:</strong> {{ $error }}</p>
        <p>โปรดตรวจสอบว่าคุณได้นำเข้าข้อมูลตามตารางที่กำหนดแล้ว</p>
    </div>
    @endif

    <!-- Stats Cards -->
    <div class="row">
        <div class="col-md-4 mb-4">
            <div class="card border-0 shadow">
                <div class="card-body">
                    <h5 class="card-title">Total Bookings</h5>
                    <h2 class="mt-3 mb-0">{{ $bookingsCount }}</h2>
                    <p class="text-muted">Active reservations</p>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-4">
            <div class="card border-0 shadow">
                <div class="card-body">
                    <h5 class="card-title">Available Rooms</h5>
                    <h2 class="mt-3 mb-0">{{ $roomsCount }}</h2>
                    <p class="text-muted">Across all branches</p>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-4">
            <div class="card border-0 shadow">
                <div class="card-body">
                    <h5 class="card-title">Hotel Branches</h5>
                    <h2 class="mt-3 mb-0">{{ $branchesCount }}</h2>
                    <p class="text-muted">Locations nationwide</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Search, Filters and Add New Button -->
    <div class="row mb-4">
        <div class="col-md-8">
            <div class="input-group">
                <input wire:model.debounce.300ms="searchTerm" type="text" class="form-control" placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, ห้อง หรือสาขา...">
                <select wire:model="statusFilter" class="form-select" style="max-width: 150px;">
                    <option value="">- สถานะทั้งหมด -</option>
                    <option value="pending">รอดำเนินการ</option>
                    <option value="waiting_payment">รอชำระเงิน</option>
                    <option value="confirmed">ยืนยันแล้ว</option>
                    <option value="canceled">ยกเลิก</option>
                </select>
                <input wire:model="dateFilter" type="date" class="form-control" style="max-width: 200px;">
            </div>
        </div>
        <div class="col-md-4 text-end">
            <button wire:click="openBookingForm" class="btn btn-primary">
                <i class="fas fa-plus-circle me-2"></i> เพิ่มการจอง
            </button>
        </div>
    </div>

    <!-- Recent Bookings -->
    <div class="card border-0 shadow">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">รายการจองล่าสุด</h5>
            <button wire:click="$refresh" class="btn btn-sm btn-outline-secondary">
                <i class="fas fa-sync-alt"></i>
            </button>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>ชื่อผู้จอง</th>
                            <th>ห้องและสาขา</th>
                            <th>เช็คอิน</th>
                            <th>เช็คเอาท์</th>
                            <th>สถานะ</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($latestBookings as $booking)
                            <tr>
                                <td>{{ $booking->id }}</td>
                                <td>
                                    {{ $booking->full_name }}
                                    @if($booking->phone)
                                        <br><small class="text-muted">{{ $booking->phone }}</small>
                                    @endif
                                </td>
                                <td>
                                    {{ $booking->room_name ?? 'Room #'.$booking->room_id }}
                                    <br><small class="text-muted">{{ $booking->branch_name ?? '' }}</small>
                                </td>
                                <td>{{ date('d/m/Y', strtotime($booking->check_in)) }}</td>
                                <td>{{ date('d/m/Y', strtotime($booking->check_out)) }}</td>
                                <td>
                                    @if($booking->status == 'pending')
                                        <span class="badge bg-warning text-dark">รอดำเนินการ</span>
                                    @elseif($booking->status == 'waiting_payment')
                                        <span class="badge bg-info">รอชำระเงิน</span>
                                    @elseif($booking->status == 'confirmed')
                                        <span class="badge bg-success">ยืนยันแล้ว</span>
                                    @elseif($booking->status == 'canceled')
                                        <span class="badge bg-danger">ยกเลิก</span>
                                    @else
                                        <span class="badge bg-secondary">{{ $booking->status }}</span>
                                    @endif
                                </td>
                                <td>
                                    <div class="dropdown">
                                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                            จัดการ
                                        </button>
                                        <ul class="dropdown-menu">
                                            <li><a class="dropdown-item" href="#" wire:click.prevent="editBooking({{ $booking->id }})">แก้ไข</a></li>
                                            <li><a class="dropdown-item" href="#" wire:click.prevent="deleteBooking({{ $booking->id }})">ลบ</a></li>
                                            <li><hr class="dropdown-divider"></li>
                                            <li><a class="dropdown-item" href="#" wire:click.prevent="updateStatus({{ $booking->id }}, 'pending')">รอดำเนินการ</a></li>
                                            <li><a class="dropdown-item" href="#" wire:click.prevent="updateStatus({{ $booking->id }}, 'waiting_payment')">รอชำระเงิน</a></li>
                                            <li><a class="dropdown-item" href="#" wire:click.prevent="updateStatus({{ $booking->id }}, 'confirmed')">ยืนยันแล้ว</a></li>
                                            <li><a class="dropdown-item" href="#" wire:click.prevent="updateStatus({{ $booking->id }}, 'canceled')">ยกเลิก</a></li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center">ไม่พบข้อมูลการจอง</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Booking Form Modal -->
    @if($isFormOpen)
    <div class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ $isEditMode ? 'แก้ไขการจอง' : 'เพิ่มการจองใหม่' }}</h5>
                    <button type="button" class="btn-close" wire:click="closeForm"></button>
                </div>
                <div class="modal-body">
                    <form wire:submit.prevent="saveBooking">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="roomId" class="form-label">ห้อง <span class="text-danger">*</span></label>
                                <select wire:model="roomId" id="roomId" class="form-select @error('roomId') is-invalid @enderror" required>
                                    <option value="">-- เลือกห้อง --</option>
                                    @foreach($rooms as $room)
                                        <option value="{{ $room->id }}">{{ $room->name }} ({{ $room->branch->name ?? 'Unknown Branch' }})</option>
                                    @endforeach
                                </select>
                                @error('roomId') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>
                            <div class="col-md-6">
                                <label for="roomCount" class="form-label">จำนวนห้อง <span class="text-danger">*</span></label>
                                <input wire:model="roomCount" type="number" class="form-control @error('roomCount') is-invalid @enderror" id="roomCount" min="1" required>
                                @error('roomCount') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="checkInDate" class="form-label">วันที่เช็คอิน <span class="text-danger">*</span></label>
                                <input wire:model="checkInDate" type="date" class="form-control @error('checkInDate') is-invalid @enderror" id="checkInDate" required>
                                @error('checkInDate') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>
                            <div class="col-md-6">
                                <label for="checkOutDate" class="form-label">วันที่เช็คเอาท์ <span class="text-danger">*</span></label>
                                <input wire:model="checkOutDate" type="date" class="form-control @error('checkOutDate') is-invalid @enderror" id="checkOutDate" required>
                                @error('checkOutDate') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="fullName" class="form-label">ชื่อผู้จอง <span class="text-danger">*</span></label>
                                <input wire:model="fullName" type="text" class="form-control @error('fullName') is-invalid @enderror" id="fullName" required>
                                @error('fullName') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>
                            <div class="col-md-6">
                                <label for="phone" class="form-label">เบอร์โทรศัพท์</label>
                                <input wire:model="phone" type="text" class="form-control @error('phone') is-invalid @enderror" id="phone">
                                @error('phone') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="userLineId" class="form-label">LINE ID <span class="text-danger">*</span></label>
                                <input wire:model="userLineId" type="text" class="form-control @error('userLineId') is-invalid @enderror" id="userLineId" required>
                                @error('userLineId') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>
                            <div class="col-md-6">
                                <label for="status" class="form-label">สถานะ <span class="text-danger">*</span></label>
                                <select wire:model="status" id="status" class="form-select @error('status') is-invalid @enderror" required>
                                    <option value="pending">รอดำเนินการ</option>
                                    <option value="waiting_payment">รอชำระเงิน</option>
                                    <option value="confirmed">ยืนยันแล้ว</option>
                                    <option value="canceled">ยกเลิก</option>
                                </select>
                                @error('status') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>
                        </div>

                        <div class="d-flex justify-content-end mt-4">
                            <button type="button" class="btn btn-secondary me-2" wire:click="closeForm">ยกเลิก</button>
                            <button type="submit" class="btn btn-primary">บันทึก</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    @endif
</div>
