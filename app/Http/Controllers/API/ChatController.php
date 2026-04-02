<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ChatAssignment;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class ChatController extends Controller
{
    /**
     * Assign a chat to a user
     */
    public function assignChat(Request $request)
    {
        $validated = $request->validate([
            'line_uuid' => 'required|string',
            'user_id' => 'required|exists:users,id'
        ]);

        try {
            $user = User::findOrFail($validated['user_id']);

            $assignment = ChatAssignment::firstOrNew([
                'line_uuid' => $validated['line_uuid'],
            ]);

            $assignment->user_id = $user->id;
            $assignment->assigned_member_id = (string) $user->id;
            $assignment->assigned_member = $this->formatUserDisplayName($user);
            $assignment->assigned_at = now();
            $assignment->save();

            $assignment->load('user');

            return response()->json([
                'success' => true,
                'message' => 'Chat assigned successfully',
                'assignment' => $this->formatAssignment($assignment)
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to assign chat: ' . $e->getMessage(), [
                'line_uuid' => $validated['line_uuid'],
                'user_id' => $validated['user_id']
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to assign chat: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get conversations assigned to current user
     */
    public function getMyAssignments()
    {
        $user = Auth::user();

        $assignments = ChatAssignment::with('user')
            ->where('user_id', $user->id)
            ->orderByDesc('assigned_at')
            ->get()
            ->map(fn ($assignment) => $this->formatAssignment($assignment));

        return response()->json($assignments);
    }

    /**
     * Get all chat assignments (public access)
     */
    public function getAllAssignments()
    {
        try {
            // Check if the chat_assignments table exists
            if (!Schema::hasTable('chat_assignments')) {
                return response()->json([]);
            }

            $assignments = ChatAssignment::with('user')
                ->orderByDesc('assigned_at')
                ->get()
                ->map(fn ($assignment) => $this->formatAssignment($assignment));

            return response()->json($assignments);
        } catch (\Exception $e) {
            // Return empty array on error instead of error response
            return response()->json([]);
        }
    }

    /**
     * Get conversations based on user permissions
     */
    public function getConversations(Request $request)
    {
        $user = Auth::user();

        // Since there's no user_type field, we'll assume all authenticated users
        // can see all assignments for now
        $assignments = $this->getAllAssignments();

        return $assignments;
    }

    /**
     * Unassign a chat
     */
    public function unassignChat(Request $request)
    {
        $validated = $request->validate([
            'line_uuid' => 'required|string'
        ]);

        try {
            ChatAssignment::where('line_uuid', $validated['line_uuid'])->delete();

            return response()->json([
                'success' => true,
                'message' => 'Chat unassigned successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unassign chat: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get assignment for a specific chat
     */
    public function getChatAssignment($lineUuid)
    {
        try {
            if (!Schema::hasTable('chat_assignments')) {
                return response()->json([
                    'assigned' => false,
                    'message' => 'Chat assignments table not available'
                ]);
            }

            $assignment = ChatAssignment::with('user')
                ->where('line_uuid', $lineUuid)
                ->first();

            if ($assignment) {
                return response()->json($this->formatAssignment($assignment));
            } else {
                return response()->json([
                    'assigned' => false,
                    'message' => 'No assignment found'
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to get chat assignment: ' . $e->getMessage());
            return response()->json([
                'assigned' => false,
                'message' => 'No assignment found',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function formatAssignment(ChatAssignment $assignment): array
    {
        $data = $assignment->toArray();
        $data['assigned_user_name'] = $this->resolveUserName($assignment);
        $data['assigned'] = true;

        return $data;
    }

    private function resolveUserName(ChatAssignment $assignment): string
    {
        $user = $assignment->user;

        if (!$user) {
            return 'Unassigned';
        }

        $first = trim((string) ($user->first_name ?? ''));
        $last = trim((string) ($user->last_name ?? ''));
        $combined = trim($first . ' ' . $last);

        if ($combined !== '') {
            return $combined;
        }

        $name = trim((string) ($user->name ?? ''));
        if ($name !== '') {
            return $name;
        }

        return (string) ($user->email ?? 'Unknown User');
    }

    private function formatUserDisplayName(User $user): string
    {
        $first = trim((string) ($user->first_name ?? ''));
        $last = trim((string) ($user->last_name ?? ''));
        $combined = trim($first . ' ' . $last);

        if ($combined !== '') {
            return $combined;
        }

        $name = trim((string) ($user->name ?? ''));
        if ($name !== '') {
            return $name;
        }

        return (string) ($user->email ?? 'Unknown User');
    }
}