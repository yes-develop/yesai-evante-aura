<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Branch;
use App\Models\Room;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index()
    {
        return view('reports.index');
    }

    public function occupancy(Request $request)
    {
        $period = $request->input('period', 'month');
        $now = Carbon::now();
        
        // Set date range based on period
        switch ($period) {
            case 'week':
                $startDate = $now->copy()->startOfWeek();
                $endDate = $now->copy()->endOfWeek();
                break;
            case 'month':
                $startDate = $now->copy()->startOfMonth();
                $endDate = $now->copy()->endOfMonth();
                break;
            case 'quarter':
                $startDate = $now->copy()->subMonths(3)->startOfDay();
                $endDate = $now->copy()->endOfDay();
                break;
            case 'year':
                $startDate = $now->copy()->startOfYear();
                $endDate = $now->copy()->endOfYear();
                break;
            default:
                $startDate = $now->copy()->startOfMonth();
                $endDate = $now->copy()->endOfMonth();
        }

        $branches = Branch::all();
        $branchOccupancy = [];

        foreach ($branches as $branch) {
            $rooms = Room::where('branch_id', $branch->id)->get();
            $totalRooms = $rooms->sum('total_rooms');
            $bookedRooms = 0;

            foreach ($rooms as $room) {
                $bookedRooms += Booking::where('room_id', $room->id)
                    ->whereIn('status', ['pending', 'confirmed', 'waiting_payment'])
                    ->whereBetween('check_in', [$startDate, $endDate])
                    ->sum('room_count');
            }

            $occupancyRate = $totalRooms > 0 ? ($bookedRooms / $totalRooms) * 100 : 0;
            
            $branchOccupancy[] = [
                'branch' => $branch->name,
                'totalRooms' => $totalRooms,
                'bookedRooms' => $bookedRooms,
                'occupancyRate' => round($occupancyRate, 2)
            ];
        }

        return view('reports.occupancy', compact('branchOccupancy', 'period', 'startDate', 'endDate'));
    }

    public function revenue(Request $request)
    {
        $period = $request->input('period', 'month');
        $now = Carbon::now();
        
        switch ($period) {
            case 'week':
                $startDate = $now->copy()->startOfWeek();
                $endDate = $now->copy()->endOfWeek();
                $groupBy = 'day';
                $format = 'Y-m-d';
                break;
            case 'month':
                $startDate = $now->copy()->startOfMonth();
                $endDate = $now->copy()->endOfMonth();
                $groupBy = 'day';
                $format = 'Y-m-d';
                break;
            case 'quarter':
                $startDate = $now->copy()->subMonths(3)->startOfDay();
                $endDate = $now->copy()->endOfDay();
                $groupBy = 'week';
                $format = 'Y-\WW';
                break;
            case 'year':
                $startDate = $now->copy()->startOfYear();
                $endDate = $now->copy()->endOfYear();
                $groupBy = 'month';
                $format = 'Y-m';
                break;
            default:
                $startDate = $now->copy()->startOfMonth();
                $endDate = $now->copy()->endOfMonth();
                $groupBy = 'day';
                $format = 'Y-m-d';
        }

        $bookings = Booking::where('status', 'confirmed')
            ->whereBetween('check_in', [$startDate, $endDate])
            ->get();

        $revenueByPeriod = $bookings->groupBy(function ($booking) use ($format) {
            return $booking->check_in->format($format);
        })->map(function ($group) {
            return $group->sum('total_price');
        });

        $revenueByBranch = [];
        $branches = Branch::all();

        foreach ($branches as $branch) {
            $revenue = 0;
            $rooms = Room::where('branch_id', $branch->id)->pluck('id')->toArray();
            
            $revenue = $bookings->whereIn('room_id', $rooms)->sum('total_price');
            
            $revenueByBranch[$branch->name] = $revenue;
        }

        return view('reports.revenue', compact('revenueByPeriod', 'revenueByBranch', 'period', 'startDate', 'endDate'));
    }
}
