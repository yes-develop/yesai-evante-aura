<?php

namespace App\Http\Controllers;

use App\Models\Label;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LabelController extends Controller
{
    public function index()
    {
        $labels = Label::all();
        return response()->json($labels);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:labels'
        ]);

        $label = Label::create($request->all());
        return response()->json($label, 201);
    }

    public function update(Request $request, Label $label)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:labels,name,' . $label->id
        ]);

        $label->update($request->all());
        return response()->json($label);
    }

    public function destroy(Label $label)
    {
        $label->delete();
        return response()->json(null, 204);
    }

    public function attachToConversation(Request $request)
    {
        $request->validate([
            'label_id' => 'required|exists:labels,id',
            'conversation_id' => 'required|string'
        ]);

        DB::table('conversation_label')->insert([
            'label_id' => $request->label_id,
            'conversation_id' => $request->conversation_id,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['message' => 'Label attached successfully']);
    }

    public function detachFromConversation(Request $request)
    {
        $request->validate([
            'label_id' => 'required|exists:labels,id',
            'conversation_id' => 'required|string'
        ]);

        DB::table('conversation_label')
            ->where('label_id', $request->label_id)
            ->where('conversation_id', $request->conversation_id)
            ->delete();

        return response()->json(['message' => 'Label detached successfully']);
    }
} 