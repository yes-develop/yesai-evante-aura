<?php

namespace App\Http\Controllers;

use App\Models\Automation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AutomationsController extends Controller
{
    /**
     * Display the automations index page.
     *
     * @return \Illuminate\View\View
     */
    public function index()
    {
        // Get all automations for the current user
        $automations = Automation::where('user_id', Auth::id())->get();
        
        return view('automations.index', compact('automations'));
    }

    /**
     * Display the flow builder page.
     *
     * @return \Illuminate\View\View
     */ 
    /**
     * Store a newly created automation.
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

        // Create the automation
        $automation = new Automation([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'mode' => $request->mode ?? 'AI',
            'integration' => $request->integration,
            'created_by' => Auth::user()->name,
            'status' => 'active',
            'response_time' => $request->response_time,
        ]);

        $automation->save();

        return response()->json($automation, 201);
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
        $automation = Automation::findOrFail($id);
        
        // Check if the user owns this automation
        if ($automation->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
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
            'automation' => $automation
        ]);
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
        $automation = Automation::findOrFail($id);
        
        // Check if the user owns this automation
        if ($automation->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
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
            'automation' => $automation
        ]);
    }
} 