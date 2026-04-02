<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\Booking;
use App\Models\Room;
use App\Models\Branch;
use Illuminate\Support\Facades\DB;

class Dashboard extends Component
{
    // Form properties for Booking Management
    public $isFormOpen = false;
    public $isEditMode = false;
    public $bookingId = null;
    public $roomId;
    public $checkInDate;
    public $checkOutDate;
    public $roomCount = 1;
    public $userLineId;
    public $fullName;
    public $phone;
    public $status = 'pending';
    
    // Search and filter properties
    public $searchTerm = '';
    public $statusFilter = '';
    public $dateFilter = '';
    
    // Rules for validation
    protected $rules = [
        'roomId' => 'required|exists:rooms,id',
        'checkInDate' => 'required|date|after_or_equal:today',
        'checkOutDate' => 'required|date|after:checkInDate',
        'roomCount' => 'required|integer|min:1',
        'userLineId' => 'required|string|max:34',
        'fullName' => 'required|string|max:255',
        'phone' => 'nullable|string|max:20',
        'status' => 'required|in:pending,waiting_payment,confirmed,canceled',
    ];
    
    // Initialize component with booking data
    public function mount()
    {
        $this->checkInDate = date('Y-m-d');
        $this->checkOutDate = date('Y-m-d', strtotime('+1 day'));
    }
    
    // Load rooms for room selector
    public function getRoomsProperty()
    {
        return Room::orderBy('branch_id')->orderBy('name')->get();
    }
    
    // Open create booking form
    public function openBookingForm()
    {
        $this->isFormOpen = true;
        $this->isEditMode = false;
        $this->reset(['bookingId', 'roomId', 'userLineId', 'fullName', 'phone', 'status']);
        $this->checkInDate = date('Y-m-d');
        $this->checkOutDate = date('Y-m-d', strtotime('+1 day'));
        $this->roomCount = 1;
    }
    
    // Open edit booking form
    public function editBooking($id)
    {
        $this->isFormOpen = true;
        $this->isEditMode = true;
        $this->bookingId = $id;
        
        $booking = DB::table('bookings')->where('id', $id)->first();
        if ($booking) {
            $this->roomId = $booking->room_id;
            $this->checkInDate = $booking->check_in;
            $this->checkOutDate = $booking->check_out;
            $this->roomCount = $booking->room_count;
            $this->userLineId = $booking->user_line_id;
            $this->fullName = $booking->full_name;
            $this->phone = $booking->phone;
            $this->status = $booking->status;
        }
    }
    
    // Close the booking form
    public function closeForm()
    {
        $this->isFormOpen = false;
    }
    
    // Save booking data (create or update)
    public function saveBooking()
    {
        $this->validate();
        
        $bookingData = [
            'room_id' => $this->roomId,
            'check_in' => $this->checkInDate,
            'check_out' => $this->checkOutDate,
            'room_count' => $this->roomCount,
            'user_line_id' => $this->userLineId,
            'full_name' => $this->fullName,
            'phone' => $this->phone,
            'status' => $this->status,
        ];
        
        if ($this->isEditMode) {
            DB::table('bookings')->where('id', $this->bookingId)->update($bookingData);
            session()->flash('message', 'จองห้องพักอัพเดทเรียบร้อยแล้ว');
        } else {
            DB::table('bookings')->insert(array_merge($bookingData, [
                'created_at' => now()
            ]));
            session()->flash('message', 'จองห้องพักสำเร็จ');
        }
        
        $this->isFormOpen = false;
        $this->reset(['bookingId', 'roomId', 'userLineId', 'fullName', 'phone', 'status']);
    }
    
    // Delete booking
    public function deleteBooking($id)
    {
        if (confirm('คุณต้องการลบการจองนี้ใช่หรือไม่?')) {
            DB::table('bookings')->where('id', $id)->delete();
            session()->flash('message', 'ลบการจองเรียบร้อยแล้ว');
        }
    }
    
    // Change booking status
    public function updateStatus($id, $newStatus)
    {
        DB::table('bookings')->where('id', $id)->update(['status' => $newStatus]);
        session()->flash('message', 'เปลี่ยนสถานะการจองเรียบร้อยแล้ว');
    }
    
    // Main render method
    public function render()
    {
        try {
            // Count data for stats cards
            $bookingsCount = DB::table('bookings')->count();
            $roomsCount = DB::table('rooms')->count();
            $branchesCount = DB::table('branches')->count();
            
            // Get bookings with search and filters
            $bookingsQuery = DB::table('bookings')
                ->join('rooms', 'bookings.room_id', '=', 'rooms.id')
                ->join('branches', 'rooms.branch_id', '=', 'branches.id')
                ->select(
                    'bookings.*', 
                    'rooms.name as room_name',
                    'branches.name as branch_name'
                );
            
            // Apply search filter
            if (!empty($this->searchTerm)) {
                $searchTerm = '%' . $this->searchTerm . '%';
                $bookingsQuery->where(function($query) use ($searchTerm) {
                    $query->where('bookings.full_name', 'like', $searchTerm)
                          ->orWhere('bookings.phone', 'like', $searchTerm)
                          ->orWhere('rooms.name', 'like', $searchTerm)
                          ->orWhere('branches.name', 'like', $searchTerm);
                });
            }
            
            // Apply status filter
            if (!empty($this->statusFilter)) {
                $bookingsQuery->where('bookings.status', $this->statusFilter);
            }
            
            // Apply date filter
            if (!empty($this->dateFilter)) {
                $date = $this->dateFilter;
                $bookingsQuery->where(function($query) use ($date) {
                    $query->where('check_in', '<=', $date)
                          ->where('check_out', '>=', $date);
                });
            }
            
            $latestBookings = $bookingsQuery->orderBy('bookings.created_at', 'desc')
                                           ->take(30)
                                           ->get();

            return view('livewire.dashboard', [
                'bookingsCount' => $bookingsCount,
                'roomsCount' => $roomsCount,
                'branchesCount' => $branchesCount,
                'latestBookings' => $latestBookings,
                'rooms' => $this->rooms,
            ])->layout('components.layouts.app');
            
        } catch (\Exception $e) {
            // In case of error (e.g., tables don't exist yet)
            return view('livewire.dashboard', [
                'bookingsCount' => 0,
                'roomsCount' => 0,
                'branchesCount' => 0,
                'latestBookings' => [],
                'rooms' => [],
                'error' => $e->getMessage()
            ])->layout('components.layouts.app');
        }
    }
}
