<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Branch;
use App\Models\RoomImage;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;


class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Get rooms with relationships and order by ID in descending order (newest first)
        $rooms = Room::with(['branch', 'images'])
                    ->orderBy('id', 'desc')
                    ->get();
        
        return view('rooms.index', compact('rooms'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $branches = Branch::all();
        return view('rooms.create', compact('branches'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'branch_id' => 'required|exists:branches,id',
            'description' => 'nullable|string',
            'price_per_night' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'total_rooms' => 'required|integer|min:1',
            'bed_type' => 'required|string',
            'size_room' => 'required|string',
            'max_guests' => 'required|integer|min:1',
            'status' => 'required|in:available,booked,unavailable',
            'amenities' => 'nullable|array',
            'room_images.*' => 'nullable|image|max:2048'
        ]);
        
        // Create room
        $room = new Room();
        $room->name = $request->name;
        $room->branch_id = $request->branch_id;
        $room->description = $request->description;
        $room->price_per_night = $request->price_per_night;
        $room->discount = $request->discount;
        $room->total_rooms = $request->total_rooms;
        $room->bed_type = $request->bed_type;
        $room->size_room = $request->size_room;
        $room->max_guests = $request->max_guests;
        $room->status = $request->status;
        $room->amenities = json_encode($request->amenities ?? []);
        
        // Save the room
        $room->save();
        
        // Handle room images
        if ($request->hasFile('room_images')) {
            foreach ($request->file('room_images') as $index => $image) {
                $path = $image->store('rooms', 'public');
                
                $room->images()->create([
                    'image_url' => $path, // ต้องบันทึกเฉพาะ path ไม่ใช่ URL เต็ม
                    'is_primary' => $index === 0 ? 1 : 0,
                ]);
            }
        }
        
        return redirect()->route('rooms.index')
                        ->with('success', 'Room created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Room $room)
    {
        // Load room relationships
        $room->load(['branch', 'images', 'bookings']);

        // Get booking statistics
        $bookingsCount = $room->bookings()->count();
        $room->bookings_count = $bookingsCount;

        // Bookings this month
        $bookingsThisMonth = $room->bookings()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $room->bookings_this_month = $bookingsThisMonth;

        // Upcoming bookings
        $upcomingBookings = $room->bookings()
            ->where('check_in', '>=', now())
            ->orderBy('check_in')
            ->limit(5)
            ->get();
        $room->upcoming_bookings = $upcomingBookings;

        // Calculate occupancy rate
        if ($bookingsCount > 0) {
            // Calculate total nights booked
            $totalNights = $room->bookings()->sum(DB::raw('DATEDIFF(check_out, check_in)'));

            // Calculate total available nights since creation
            $daysActive = max(1, now()->diffInDays($room->created_at));
            $totalAvailableNights = $daysActive * $room->total_rooms;

            // Calculate percentage
            $occupancyRate = min(100, round(($totalNights / $totalAvailableNights) * 100));
            $room->occupancy_rate = $occupancyRate . '%';

            // Calculate revenue
            $revenue = $room->bookings()->sum(DB::raw('DATEDIFF(check_out, check_in) * ' . $room->price_per_night));
            $room->total_revenue = number_format($revenue, 2);
        } else {
            $room->occupancy_rate = '0%';
            $room->total_revenue = '0.00';
        }

        return view('rooms.show', compact('room'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Room $room)
    {
        $branches = Branch::all();
        $room->load('images');
        return view('rooms.edit', compact('room', 'branches'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Room $room)
    {
        // Validate
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'branch_id' => 'required|exists:branches,id',
            'description' => 'nullable|string',
            'price_per_night' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'total_rooms' => 'required|integer|min:1',
            'bed_type' => 'required|string',
            'size_room' => 'required|string',
            'max_guests' => 'required|integer|min:1',
            'status' => 'required|in:available,booked,unavailable',
            'amenities' => 'nullable|array',
            'images.*' => 'nullable|image|max:2048',
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'exists:room_images,id'
        ]);
        
        // Update room
        $room->name = $request->name;
        $room->branch_id = $request->branch_id;
        $room->description = $request->description;
        $room->price_per_night = $request->price_per_night;
        $room->discount = $request->discount;
        $room->total_rooms = $request->total_rooms;
        $room->bed_type = $request->bed_type;
        $room->size_room = $request->size_room;
        $room->max_guests = $request->max_guests;
        $room->status = $request->status;
        $room->amenities = json_encode($request->amenities ?? []);
        
        // Save the room
        $room->save();
        
        // Remove images if requested
        if ($request->has('remove_images')) {
            foreach ($request->remove_images as $imageId) {
                $image = RoomImage::find($imageId);
                if ($image) {
                    // Delete file from storage
                    if ($image->image_url && !filter_var($image->image_url, FILTER_VALIDATE_URL)) {
                        Storage::disk('public')->delete($image->image_url);
                    }
                    
                    // Delete record from database
                    $image->delete();
                }
            }
        }
        
        // Add new images
        if ($request->hasFile('images')) {
            $hasPrimary = $room->images()->where('is_primary', 1)->exists();
            
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('rooms', 'public');
                
                $room->images()->create([
                    'image_url' => $path,
                    'is_primary' => (!$hasPrimary && $index === 0) ? 1 : 0,
                ]);
                
                // Set the flag if we just added a primary image
                if (!$hasPrimary && $index === 0) {
                    $hasPrimary = true;
                }
            }
        }
        
        return redirect()->route('rooms.show', $room)
                        ->with('success', 'Room updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Room $room)
    {
        try {
            // Check if the room has associated bookings
            $bookingsCount = $room->bookings()->count();
            if ($bookingsCount > 0) {
                return redirect()->back()->with('error', "Cannot delete room. There are {$bookingsCount} bookings associated with this room.");
            }

            // Begin transaction
            DB::beginTransaction();

            // Delete all associated images
            foreach ($room->images as $image) {
                Storage::delete('public/' . $image->image_url);
                $image->delete();
            }

            // Delete the room
            $room->delete();

            DB::commit();

            return redirect()->route('rooms.index')->with('success', 'Room deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error deleting room: ' . $e->getMessage());
        }
    }

    /**
     * Get rooms by branch.
     */
    public function getByBranch(Branch $branch)
    {
        $rooms = Room::where('branch_id', $branch->id)->with('images')->get();
        return view('rooms.branch', compact('branch', 'rooms'));
    }

    /**
     * Update room status.
     */
    public function updateStatus(Request $request, Room $room)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:available,booked,unavailable',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        try {
            $room->status = $request->status;
            $room->save();

            return response()->json([
                'success' => true,
                'message' => 'Room status updated successfully',
                'status' => $room->status
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error updating status: ' . $e->getMessage()], 500);
        }
    }

    public function getRoomsByBranch($branchId)
    {
        try {
            $rooms = Room::where('branch_id', $branchId)
                ->with(['branch', 'images'])
                ->get()
                ->map(function ($room) {
                    // Get the primary image URL if it exists
                    $imageUrl = $room->images->where('is_primary', 1)->first()->image_url ?? null;
                    if ($imageUrl && !filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                        $imageUrl = asset('storage/' . $imageUrl);
                    }

                    return [
                        'id' => $room->id,
                        'name' => $room->name,
                        'price_per_night' => $room->price_per_night,
                        'status' => $room->status,
                        'image_url' => $imageUrl,
                        'branch_name' => $room->branch->name
                    ];
                });

            return response()->json($rooms);
        } catch (\Exception $e) {
            Log::error('Error in getRoomsByBranch: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get available rooms for a date range.
     */
    public function getAvailableRooms(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
            'branch_id' => 'required|exists:branches,id',
            'booking_id' => 'nullable|integer'  // Optional, to exclude current booking when editing
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
                'rooms' => [],
                'count' => 0
            ], 422);
        }

        $checkIn = $request->check_in;
        $checkOut = $request->check_out;
        $branchId = $request->branch_id;
        $bookingId = $request->booking_id; // Used to exclude the current booking when editing

        try {
            // Debug info
            Log::info("Fetching available rooms", [
                'branch_id' => $branchId,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'booking_id' => $bookingId
            ]);

            // Get all rooms from the selected branch
            $rooms = Room::with(['branch', 'images'])
                ->where('branch_id', $branchId)
                ->get();

            $availableRooms = [];

            foreach ($rooms as $room) {
                // For each room, check existing bookings during the requested period
                $bookedCount = DB::table('bookings')
                    ->where('room_id', $room->id)
                    ->where('status', '!=', 'canceled') // Don't count canceled bookings
                    ->where(function ($query) use ($bookingId) {
                        // Exclude the current booking if we're editing
                        if ($bookingId) {
                            $query->where('id', '!=', $bookingId);
                        }
                    })
                    ->where(function ($query) use ($checkIn, $checkOut) {
                        // Check for date overlap
                        $query->where(function ($q) use ($checkIn, $checkOut) {
                            $q->where('check_in', '>=', $checkIn)
                                ->where('check_in', '<', $checkOut);
                        })->orWhere(function ($q) use ($checkIn, $checkOut) {
                            $q->where('check_out', '>', $checkIn)
                                ->where('check_out', '<=', $checkOut);
                        })->orWhere(function ($q) use ($checkIn, $checkOut) {
                            $q->where('check_in', '<=', $checkIn)
                                ->where('check_out', '>=', $checkOut);
                        });
                    })
                    ->sum('room_count');

                // Calculate available rooms
                $availableCount = $room->total_rooms - $bookedCount;

                // Always include the room with available count
                $room->available_count = $availableCount > 0 ? $availableCount : 0;
                $availableRooms[] = $room;
            }

            Log::info("Available rooms found", ['count' => count($availableRooms)]);

            return response()->json([
                'success' => true,
                'rooms' => $availableRooms,
                'count' => count($availableRooms)
            ]);
        } catch (\Exception $e) {
            Log::error("Error fetching rooms: " . $e->getMessage(), ['exception' => $e]);

            return response()->json([
                'success' => false,
                'error' => 'Error fetching available rooms: ' . $e->getMessage(),
                'rooms' => [],
                'count' => 0
            ], 500);
        }
    }

    /**
     * Export rooms data to CSV.
     */
    public function export()
    {
        $rooms = Room::with(['branch', 'images'])->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="rooms_export_' . date('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($rooms) {
            $file = fopen('php://output', 'w');

            // Add CSV headers
            fputcsv($file, [
                'ID',
                'Name',
                'Branch',
                'Price',
                'Max Guests',
                'Bed Type',
                'Room Size',
                'Status',
                'Total Rooms',
                'Created At'
            ]);

            // Add data rows
            foreach ($rooms as $room) {
                fputcsv($file, [
                    $room->id,
                    $room->name,
                    $room->branch->name ?? 'N/A',
                    $room->price_per_night,
                    $room->max_guests,
                    $room->bed_type,
                    $room->size_room,
                    $room->status,
                    $room->total_rooms,
                    $room->created_at->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Sanitize file name to prevent issues with special characters
     */
    private function sanitizeFileName($fileName)
    {
        // Remove any character that is not a-z, A-Z, 0-9, underscore, dot, or dash
        $fileName = preg_replace('/[^\w\.-]/', '_', $fileName);

        // Remove multiple consecutive underscores
        $fileName = preg_replace('/_+/', '_', $fileName);

        return $fileName;
    }
}
