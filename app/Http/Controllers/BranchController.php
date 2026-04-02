<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class BranchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $branches = Branch::orderBy('name')->get();
        return view('branches.index', compact('branches'));
    }

    public function create()
    {
        return view('branches.create');
    }

    public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255|unique:branches,name',
        'description' => 'nullable|string',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        'location' => 'required',
        'map_url' => 'nullable|url',
        'tel' => 'nullable|string|max:20',
        'nearby_shoppingmall' => 'nullable|array',
        'nearby_attractions' => 'nullable|array',
        'nearby_industrialestates' => 'nullable|array',
        'nearby_governmentinstitutions' => 'nullable|array',
    ]);

    if ($validator->fails()) {
        return redirect()->back()->withErrors($validator)->withInput();
    }

    $branch = new Branch();
    $branch->name = $request->name;
    $branch->description = $request->description;
    $branch->location = $request->location;
    $branch->tel = $request->tel;
    $branch->map_url = $request->map_url;

    // Handle image upload
    if ($request->hasFile('image') && $request->file('image')->isValid()) {
        $image = $request->file('image');
        $imageName = time() . '_' . $image->getClientOriginalName();
        
        // Store in the 'branches' subdirectory of 'public' disk
        $path = $image->storeAs('branches', $imageName, 'public');
        $branch->image = $path; // Save the path relative to the storage/app/public directory
    }

    // ปรับปรุงให้เก็บเป็น array โดยลบค่าที่ว่างออกด้วย array_filter
    $branch->nearby_shoppingmall = array_values(array_filter($request->nearby_shoppingmall ?? []));
    $branch->nearby_attractions = array_values(array_filter($request->nearby_attractions ?? []));
    $branch->nearby_industrialestates = array_values(array_filter($request->nearby_industrialestates ?? []));
    $branch->nearby_governmentinstitutions = array_values(array_filter($request->nearby_governmentinstitutions ?? []));

    $branch->save();

    return redirect()->route('branches.show', $branch)
        ->with('success', 'Branch created successfully.');
}

public function show(Branch $branch)
{
    // นับจำนวนการจองทั้งหมดที่เกี่ยวข้องกับสาขานี้
    $bookingsCount = \App\Models\Booking::whereHas('room', function($query) use ($branch) {
        $query->where('branch_id', $branch->id);
    })->count();
    
    return view('branches.show', compact('branch', 'bookingsCount'));
}

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Branch $branch)
    {
        return view('branches.edit', compact('branch'));
    }

    /**
     * Display the specified resource.
     */
    public function update(Request $request, Branch $branch)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|unique:branches,name,' . $branch->id,
        'description' => 'nullable|string',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        'location' => 'required',
        'map_url' => 'nullable|url',
        'tel' => 'nullable|string|max:20',
        'nearby_shoppingmall' => 'nullable|array',
        'nearby_attractions' => 'nullable|array',
        'nearby_industrialestates' => 'nullable|array',
        'nearby_governmentinstitutions' => 'nullable|array',
    ]);

    if ($validator->fails()) {
        return redirect()->back()->withErrors($validator)->withInput();
    }

    $branch->name = $request->name;
    $branch->description = $request->description;
    $branch->location = $request->location;
    $branch->tel = $request->tel;
    $branch->map_url = $request->map_url;

    // Handle image upload or removal
    if ($request->hasFile('image') && $request->file('image')->isValid()) {
        // Delete old image if it's a local file (not a URL)
        if ($branch->image && !filter_var($branch->image, FILTER_VALIDATE_URL) && Storage::disk('public')->exists($branch->image)) {
            Storage::disk('public')->delete($branch->image);
        }

        $image = $request->file('image');
        $imageName = time() . '_' . $image->getClientOriginalName();
        
        // Store in the 'branches' subdirectory of 'public' disk
        $path = $image->storeAs('branches', $imageName, 'public');
        $branch->image = $path;
    }

    // ปรับปรุงให้เก็บเป็น array โดยลบค่าที่ว่างออกด้วย array_filter
    $branch->nearby_shoppingmall = array_values(array_filter($request->nearby_shoppingmall ?? []));
    $branch->nearby_attractions = array_values(array_filter($request->nearby_attractions ?? []));
    $branch->nearby_industrialestates = array_values(array_filter($request->nearby_industrialestates ?? []));
    $branch->nearby_governmentinstitutions = array_values(array_filter($request->nearby_governmentinstitutions ?? []));

    $branch->save();

    return redirect()->route('branches.show', $branch)
        ->with('success', 'Branch updated successfully.');
}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Branch $branch)
    {
        // Check if branch has rooms
        if ($branch->rooms()->count() > 0) {
            return redirect()->route('branches.index')->with('error', 'Cannot delete branch with rooms. Please delete rooms first.');
        }

        // Delete image if exists
        if ($branch->image) {
            Storage::delete('public/' . $branch->image);
        }

        $branch->delete();

        return redirect()->route('branches.index')->with('success', 'Branch deleted successfully');
    }
}
