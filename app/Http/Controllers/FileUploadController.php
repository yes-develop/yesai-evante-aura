<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadController extends Controller
{
    public function upload(Request $request)
    {
        try {
            // Validate request
            $request->validate([
                'file' => 'required|file|max:10240', // Max 10MB
                'lineUuid' => 'required|string'
            ]);

            $file = $request->file('file');
            $lineUuid = $request->input('lineUuid');

            // Generate unique filename
            $filename = Str::uuid() . '_' . $file->getClientOriginalName();
            
            // Create directory structure by date
            $datePath = date('Y/m/d');
            $path = "uploads/{$lineUuid}/{$datePath}";
            
            // Store file
            $filePath = Storage::disk('public')->putFileAs($path, $file, $filename);
            
            if (!$filePath) {
                throw new \Exception('Failed to store file');
            }

            // Generate public URL
            $fileUrl = Storage::disk('public')->url($filePath);

            // Return success response
            return response()->json([
                'success' => true,
                'fileUrl' => $fileUrl,
                'fileName' => $file->getClientOriginalName(),
                'fileSize' => $file->getSize(),
                'mimeType' => $file->getMimeType()
            ]);

        } catch (\Exception $e) {
            // Return error response
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
} 