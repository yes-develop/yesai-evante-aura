<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Automation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AutomationsApiController extends Controller
{
    /**
     * Get all automations.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // ปรับให้ดึงข้อมูลทั้งหมดโดยไม่ใช้ Auth::id()
        $automations = Automation::all();
        
        return response()->json([
            'success' => true,
            'data' => $automations
        ]);
    }
    
    /**
     * Get a specific automation by ID.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $automation = Automation::findOrFail($id);
            
            // ไม่ตรวจสอบเจ้าของ เพื่อการทดสอบ
            
            return response()->json([
                'success' => true,
                'data' => $automation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Automation not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }
    
    /**
     * Create a new automation.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|in:Automatic message,Team Collaboration,Chatbots,Chat Management',
            'mode' => 'nullable|string|in:AI,Manual',
            'integration' => 'nullable|string|max:255',
            'response_time' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // กำหนดค่าเริ่มต้นสำหรับการทดสอบ
        $automation = new Automation([
            'user_id' => 1, // ใช้ ID 1 สำหรับการทดสอบ
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'mode' => $request->mode ?? 'AI',
            'integration' => $request->integration,
            'created_by' => 'Test User', // ชื่อผู้ใช้ทดสอบ
            'status' => 'active',
            'response_time' => $request->response_time,
        ]);

        $automation->save();

        return response()->json([
            'success' => true,
            'data' => $automation
        ], 201);
    }
    
    /**
     * Update the status of an automation (active/inactive).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $automation = Automation::findOrFail($id);
            
            // ไม่ตรวจสอบเจ้าของ เพื่อการทดสอบ
            
            // Validate the request
            $validator = Validator::make($request->all(), [
                'status' => 'required|string|in:active,inactive',
            ]);
            
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            
            // Update the status
            $automation->status = $request->status;
            $automation->save(); // this will automatically update the 'updated_at' timestamp
            
            return response()->json([
                'success' => true, 
                'data' => $automation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 404);
        }
    }
    
    /**
     * Update the mode of an automation (AI/Manual).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateMode(Request $request, $id)
    {
        try {
            $automation = Automation::findOrFail($id);
            
            // ไม่ตรวจสอบเจ้าของ เพื่อการทดสอบ
            
            // Validate the request
            $validator = Validator::make($request->all(), [
                'mode' => 'required|string|in:AI,Manual',
            ]);
            
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            
            // Update the mode
            $automation->mode = $request->mode;
            $automation->save(); // this will automatically update the 'updated_at' timestamp
            
            return response()->json([
                'success' => true, 
                'data' => $automation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update mode',
                'error' => $e->getMessage()
            ], 404);
        }
    }
    
    /**
     * Update an existing automation.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $automation = Automation::findOrFail($id);
            
            // ไม่ตรวจสอบเจ้าของ เพื่อการทดสอบ
            
            // Validate the request
            $validator = Validator::make($request->all(), [
                'name' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'type' => 'nullable|string|in:Automatic message,Team Collaboration,Chatbots,Chat Management',
                'mode' => 'nullable|string|in:AI,Manual',
                'integration' => 'nullable|string|max:255',
                'response_time' => 'nullable|integer',
                'status' => 'nullable|string|in:active,inactive',
            ]);
            
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            
            // Update only the fields that are provided
            if ($request->has('name')) $automation->name = $request->name;
            if ($request->has('description')) $automation->description = $request->description;
            if ($request->has('type')) $automation->type = $request->type;
            if ($request->has('mode')) $automation->mode = $request->mode;
            if ($request->has('integration')) $automation->integration = $request->integration;
            if ($request->has('response_time')) $automation->response_time = $request->response_time;
            if ($request->has('status')) $automation->status = $request->status;
            
            $automation->save();
            
            return response()->json([
                'success' => true,
                'data' => $automation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update automation',
                'error' => $e->getMessage()
            ], 404);
        }
    }
    
    /**
     * Delete an automation.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $automation = Automation::findOrFail($id);
            
            // ไม่ตรวจสอบเจ้าของ เพื่อการทดสอบ
            
            $automation->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Automation deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete automation',
                'error' => $e->getMessage()
            ], 404);
        }
    }
} 