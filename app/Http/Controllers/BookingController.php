<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use App\Models\Branch;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $bookings = Booking::with(['room.branch'])->orderBy('created_at', 'desc')->get();
        return view('bookings.index', compact('bookings'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $rooms = Room::where('status', 'available')->with('branch')->get();
        $branches = Branch::all();
        return view('bookings.create', compact('rooms', 'branches'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'room_id' => 'required|exists:rooms,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'room_count' => 'required|integer|min:1',
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Calculate total price
        $room = Room::findOrFail($request->room_id);
        $checkIn = Carbon::parse($request->check_in);
        $checkOut = Carbon::parse($request->check_out);
        $days = $checkOut->diffInDays($checkIn);
        $totalPrice = $room->price_per_night * $days * $request->room_count;

        // Check room availability
        $existingBookings = Booking::where('room_id', $request->room_id)
            ->where('status', '!=', 'canceled')
            ->where(function($query) use ($request) {
                $query->whereBetween('check_in', [$request->check_in, $request->check_out])
                    ->orWhereBetween('check_out', [$request->check_in, $request->check_out])
                    ->orWhere(function($query) use ($request) {
                        $query->where('check_in', '<=', $request->check_in)
                            ->where('check_out', '>=', $request->check_out);
                    });
            })
            ->get();
        
        $bookedRooms = $existingBookings->sum('room_count');
        $availableRooms = $room->total_rooms - $bookedRooms;

        if ($availableRooms < $request->room_count) {
            return redirect()->back()
                ->with('error', 'Not enough rooms available for the selected dates.')
                ->withInput();
        }

        // Create booking
        $booking = new Booking();
        $booking->room_id = $request->room_id;
        $booking->check_in = $request->check_in;
        $booking->check_out = $request->check_out;
        $booking->room_count = $request->room_count;
        $booking->full_name = $request->full_name;
        $booking->phone = $request->phone;
        $booking->email = $request->email;
        $booking->notes = $request->notes;
        $booking->status = 'pending';
        $booking->total_price = $totalPrice;
        $booking->user_line_id = $request->user_line_id ?? 'web-' . uniqid();
        $booking->save();

        return redirect()->route('bookings.show', $booking->id)
            ->with('success', 'Booking created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Booking $booking)
    {
        $booking->load(['room.branch']);
        return view('bookings.show', compact('booking'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Booking $booking)
{
    $branches = Branch::all();
    
    // Get all rooms from the same branch as the booking's room
    $branch_id = $booking->room ? $booking->room->branch_id : null;
    
    // Get all rooms (not just available ones) for initial display
    $rooms = Room::where(function($query) use ($branch_id) {
        if ($branch_id) {
            $query->where('branch_id', $branch_id);
        }
    })->get();
    
    return view('bookings.edit', compact('booking', 'branches', 'rooms'));
}

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Booking $booking)
    {
        $validator = Validator::make($request->all(), [
            'room_id' => 'required|exists:rooms,id',
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
            'room_count' => 'required|integer|min:1',
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'status' => 'required|in:pending,waiting_payment,confirmed,canceled',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Calculate total price
        $room = Room::findOrFail($request->room_id);
        $checkIn = Carbon::parse($request->check_in);
        $checkOut = Carbon::parse($request->check_out);
        $days = $checkOut->diffInDays($checkIn);
        $totalPrice = $room->price_per_night * $days * $request->room_count;

        // Check room availability if room or dates changed
        if ($booking->room_id != $request->room_id || 
            $booking->check_in != $request->check_in || 
            $booking->check_out != $request->check_out) {
            
            $existingBookings = Booking::where('room_id', $request->room_id)
                ->where('id', '!=', $booking->id)
                ->where('status', '!=', 'canceled')
                ->where(function($query) use ($request) {
                    $query->whereBetween('check_in', [$request->check_in, $request->check_out])
                        ->orWhereBetween('check_out', [$request->check_in, $request->check_out])
                        ->orWhere(function($query) use ($request) {
                            $query->where('check_in', '<=', $request->check_in)
                                ->where('check_out', '>=', $request->check_out);
                        });
                })
                ->get();
            
            $bookedRooms = $existingBookings->sum('room_count');
            $availableRooms = $room->total_rooms - $bookedRooms;

            if ($availableRooms < $request->room_count) {
                return redirect()->back()
                    ->with('error', 'Not enough rooms available for the selected dates.')
                    ->withInput();
            }
        }

        // Update booking
        $booking->room_id = $request->room_id;
        $booking->check_in = $request->check_in;
        $booking->check_out = $request->check_out;
        $booking->room_count = $request->room_count;
        $booking->full_name = $request->full_name;
        $booking->phone = $request->phone;
        $booking->email = $request->email;
        $booking->notes = $request->notes;
        $booking->status = $request->status;
        $booking->total_price= $totalPrice;
        $booking->save();

        return redirect()->route('bookings.show', $booking->id)
            ->with('success', 'Booking updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Booking $booking)
    {
        // Instead of deleting, just mark as canceled
        $booking->status = 'canceled';
        $booking->save();

        return redirect()->route('bookings.index')
            ->with('success', 'Booking canceled successfully.');
    }

    /**
     * Update booking status.
     */
    public function updateStatus(Request $request, Booking $booking)
{
    $validator = Validator::make($request->all(), [
        'status' => 'required|in:pending,waiting_payment,confirmed,canceled,completed',
    ]);

    if ($validator->fails()) {
        return redirect()->back()->with('error', $validator->errors()->first());
    }

    // Direct database update without timestamps to avoid the updated_at column error
    DB::table('bookings')
        ->where('id', $booking->id)
        ->update(['status' => $request->status]);
    
    // Refresh the booking from database
    $booking = Booking::find($booking->id);

    return redirect()->route('bookings.index')
        ->with('success', 'Booking status updated to ' . ucfirst($request->status));
}

    /** 
     * Search bookings.
     */
    public function search(Request $request)
    {
        $query = Booking::query();

        if ($request->filled('keyword')) {
            $keyword = $request->keyword;
            $query->where(function($q) use ($keyword) {
                $q->where('full_name', 'like', "%{$keyword}%")
                  ->orWhere('phone', 'like', "%{$keyword}%")
                  ->orWhere('email', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->where('check_in', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('check_out', '<=', $request->date_to);
        }

        $bookings = $query->with('room.branch')->orderBy('created_at', 'desc')->paginate(10);
        
        return view('bookings.index', compact('bookings'));
    }

    /**
     * Generate booking report.
     */
    public function generateReport(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));
        
        $bookings = Booking::whereBetween('created_at', [$startDate, $endDate])
                          ->with('room.branch')
                          ->get();
        
        $totalRevenue = $bookings->where('status', 'confirmed')->sum('total_price');
        $pendingRevenue = $bookings->where('status', 'pending')->sum('total_price');
        $canceledBookings = $bookings->where('status', 'canceled')->count();
        
        $branchStats = [];
        $bookingsByBranch = $bookings->groupBy('room.branch_id');
        
        foreach ($bookingsByBranch as $branchId => $branchBookings) {
            $branch = Branch::find($branchId);
            if ($branch) {
                $branchStats[] = [
                    'branch' => $branch->name,
                    'bookings_count' => $branchBookings->count(),
                    'confirmed_revenue' => $branchBookings->where('status', 'confirmed')->sum('total_price'),
                    'pending_revenue' => $branchBookings->where('status', 'pending')->sum('total_price'),
                    'canceled' => $branchBookings->where('status', 'canceled')->count(),
                ];
            }
        }

        return view('bookings.report', compact(
            'bookings', 
            'startDate', 
            'endDate', 
            'totalRevenue', 
            'pendingRevenue', 
            'canceledBookings', 
            'branchStats'
        ));
    }

    /**
     * Export bookings to CSV.
     */
    public function export(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));
        
        $bookings = Booking::whereBetween('created_at', [$startDate, $endDate])
                          ->with('room.branch')
                          ->get();
                          
        $fileName = 'bookings_' . date('Y-m-d') . '.csv';
        
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];
        
        $columns = ['ID', 'Guest Name', 'Phone', 'Email', 'Room', 'Branch', 'Check In', 'Check Out', 'Rooms', 'Total Price', 'Status', 'Created At'];
        
        $callback = function() use($bookings, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            
            foreach ($bookings as $booking) {
                $row = [
                    $booking->id,
                    $booking->full_name,
                    $booking->phone,
                    $booking->email,
                    $booking->room ? $booking->room->name : 'N/A',
                    $booking->room && $booking->room->branch ? $booking->room->branch->name : 'N/A',
                    $booking->check_in,
                    $booking->check_out,
                    $booking->room_count,
                    $booking->total_price,
                    $booking->status,
                    $booking->created_at
                ];
                
                fputcsv($file, $row);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
}