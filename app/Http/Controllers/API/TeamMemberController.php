<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class TeamMemberController extends Controller
{
    /**
     * Get all team members for assignment dropdown
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            // Fetch all users who are sales team members or all users if no role filter
            $teamMembers = User::select('id', 'name', 'email', 'role')
                ->whereIn('role', ['sales', 'admin']) // Include both sales and admin users
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => (string) $user->id, // Convert to string to match JavaScript expectations
                        'name' => $user->name,
                        'role' => ucfirst($user->role), // Capitalize role (Sales, Admin)
                        'avatar' => '', // Default avatar
                        'email' => $user->email
                    ];
                });

            return response()->json($teamMembers);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch team members',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}