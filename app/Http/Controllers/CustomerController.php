<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CustomerInfo;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    public function saveCustomerInfo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'line_uuid' => 'required|string',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'labels' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $customerInfo = CustomerInfo::updateOrCreate(
                ['line_uuid' => $request->line_uuid],
                [
                    'name' => $request->name,
                    'phone' => $request->phone,
                    'email' => $request->email,
                    'labels' => $request->labels,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Customer information saved successfully',
                'data' => $customerInfo
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save customer information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getCustomerInfo($lineUuid)
    {
        try {
            $customerInfo = CustomerInfo::where('line_uuid', $lineUuid)->first();

            if (!$customerInfo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer not found',
                    'data' => null
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Customer information retrieved successfully',
                'data' => $customerInfo
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve customer information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function addCustomerNote(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'line_uuid' => 'required|string',
            'note' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $customerInfo = CustomerInfo::firstOrCreate(
                ['line_uuid' => $request->line_uuid],
                ['name' => '', 'phone' => '', 'email' => '']
            );

            $notes = $customerInfo->notes ?? [];
            $notes[] = [
                'id' => uniqid(),
                'text' => $request->note,
                'created_at' => now()->toISOString()
            ];

            $customerInfo->update(['notes' => $notes]);

            return response()->json([
                'success' => true,
                'message' => 'Note added successfully',
                'data' => $customerInfo
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add note',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateCustomerNote(Request $request)
    {
        try {
            $lineUuid = $request->input('lineUuid');
            $noteId = $request->input('noteId');
            $newText = $request->input('newText');

            if (!$lineUuid || !$noteId || !$newText) {
                return response()->json([
                    'success' => false,
                    'message' => 'lineUuid, noteId and newText are required'
                ], 400);
            }

            $customer = CustomerInfo::where('line_uuid', $lineUuid)->first();
            
            if (!$customer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer not found'
                ], 404);
            }

            $notes = $customer->notes ?? [];
            
            // Find and update the note
            $noteFound = false;
            foreach ($notes as &$note) {
                if (isset($note['id']) && $note['id'] == $noteId) {
                    $note['text'] = $newText;
                    $note['updated_at'] = now()->toDateTimeString();
                    $noteFound = true;
                    break;
                }
            }

            if (!$noteFound) {
                return response()->json([
                    'success' => false,
                    'message' => 'Note not found'
                ], 404);
            }

            $customer->notes = $notes;
            $customer->save();

            return response()->json([
                'success' => true,
                'message' => 'Note updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update note',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteCustomerNote(Request $request)
    {
        try {
            $lineUuid = $request->input('lineUuid');
            $noteId = $request->input('noteId');

            if (!$lineUuid || !$noteId) {
                return response()->json([
                    'success' => false,
                    'message' => 'lineUuid and noteId are required'
                ], 400);
            }

            $customer = CustomerInfo::where('line_uuid', $lineUuid)->first();
            
            if (!$customer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer not found'
                ], 404);
            }

            $notes = $customer->notes ?? [];
            
            // Find and remove the note
            $noteFound = false;
            $filteredNotes = [];
            foreach ($notes as $note) {
                if (isset($note['id']) && $note['id'] == $noteId) {
                    $noteFound = true;
                    continue; // Skip this note (delete it)
                }
                $filteredNotes[] = $note;
            }

            if (!$noteFound) {
                return response()->json([
                    'success' => false,
                    'message' => 'Note not found'
                ], 404);
            }

            $customer->notes = $filteredNotes;
            $customer->save();

            return response()->json([
                'success' => true,
                'message' => 'Note deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete note',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}