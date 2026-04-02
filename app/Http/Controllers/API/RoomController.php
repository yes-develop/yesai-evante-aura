<?php
// filepath: /c:/yesweb/app/Http/Controllers/API/RoomController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\Booking;
use Carbon\Carbon;

class RoomController extends Controller
{
    /**
     * Get rooms by branch ID
     */
    public function getRoomsByBranch($branchId)
{
    $rooms = Room::with(['branch', 'images' => function($query) {
            $query->orderBy('is_primary', 'desc');
        }])
        ->where('branch_id', $branchId)
        ->get();
        
    return response()->json($rooms);
}
    
    /**
     * Get available rooms for given dates and branch
     */
    public function getAvailableRooms(Request $request)
    {
        $branchId = $request->branch_id;
        $checkIn = $request->check_in;
        $checkOut = $request->check_out;
        
        if (!$branchId || !$checkIn || !$checkOut) {
            return response()->json(['error' => 'Missing parameters'], 400);
        }
        
        // Format dates if needed
        $checkInDate = Carbon::parse($checkIn)->startOfDay();
        $checkOutDate = Carbon::parse($checkOut)->startOfDay();
        
        // Get all rooms from the branch
        $rooms = Room::where('branch_id', $branchId)->get();
        
        $result = [];
        
        foreach ($rooms as $room) {
            // Count all bookings that overlap with the requested dates
            $bookedCount = Booking::where('room_id', $room->id)
                ->where('status', '!=', 'cancelled')
                ->where(function ($query) use ($checkInDate, $checkOutDate) {
                    $query->where(function ($q) use ($checkInDate, $checkOutDate) {
                        // Check if booking period overlaps with requested period
                        $q->where('check_in', '<', $checkOutDate)
                          ->where('check_out', '>', $checkInDate);
                    });
                })
                ->sum('room_count');
            
            // Calculate how many rooms are still available
            $availableCount = $room->total_rooms - $bookedCount;
            
            $result[] = [
                'id' => $room->id,
                'name' => $room->name,
                'price_per_night' => $room->price_per_night,
                'total_rooms' => $room->total_rooms,
                'booked_count' => $bookedCount,
                'available_count' => max(0, $availableCount),
                'available' => $availableCount > 0 && $room->status == 'available'
            ];
        }
        
        return response()->json([
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'rooms' => $result
        ]);
    }
}