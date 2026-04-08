<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\BroadcastController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\GoogleCalendarController;
use App\Http\Controllers\AutomationsController;
use App\Http\Controllers\API\AutomationsApiController;
use App\Http\Controllers\ContactController;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Schema\Blueprint;



/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Authentication Routes
Route::get('/login', [App\Http\Controllers\Auth\LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [App\Http\Controllers\Auth\LoginController::class, 'login']);
Route::post('/logout', [App\Http\Controllers\Auth\LoginController::class, 'logout'])->name('logout');
Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

// Label Management Routes (moved outside auth middleware for testing)
Route::post('/message/save_label', function (Request $request) {
    $data = $request->validate([
        'name'  => 'required|string|max:255',
        'color' => 'required|string|max:7',
    ]);

    try {
        if (!Schema::hasTable('labels')) {
            Schema::create('labels', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique();
                $table->string('color', 7);
                $table->timestamps();
            });
        } else {
            if (!Schema::hasColumn('labels', 'created_at')) {
                Schema::table('labels', function (Blueprint $table) {
                    $table->timestamp('created_at')->nullable()->after('color');
                });
            }

            if (!Schema::hasColumn('labels', 'updated_at')) {
                Schema::table('labels', function (Blueprint $table) {
                    $table->timestamp('updated_at')->nullable()->after('created_at');
                });
            }
        }

        $existing = DB::table('labels')->where('name', $data['name'])->first();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Label already exists',
                'existing_label' => [
                    'id' => $existing->id,
                    'name' => $existing->name,
                    'color' => $existing->color
                ],
                'suggestion' => 'Label with this name already exists. You can use the existing label or choose a different name.'
            ], 409);
        }

        $labelId = DB::table('labels')->insertGetId([
            'name'  => $data['name'],
            'color' => $data['color'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Label created successfully',
            'label'   => [
                'id'    => $labelId,
                'name'  => $data['name'],
                'color' => $data['color'],
            ],
        ]);
    } catch (\Throwable $e) {
        \Log::error('Failed to save label', ['error' => $e->getMessage()]);

        return response()->json([
            'success' => false,
            'message' => 'Database error while saving label.',
        ], 500);
    }
});

Route::get('/message/save_label', function () {
    return response()->json([
        'message' => 'This endpoint only accepts POST requests',
        'status' => 'error'
    ]);
});

// Team Members API endpoint
Route::get('/team-members', function () {
    try {
        // Fetch all users who are sales team members or admin
        $teamMembers = User::select('id', 'name', 'email', 'role')
            ->whereIn('role', ['sales', 'admin'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'role' => ucfirst($user->role),
                    'avatar' => '/images/user-default.png',
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
})->name('team.members');

// Chat Assignment Routes (without authentication for easier access)
Route::post('/assign-chat', function (Request $request) {
    $validated = $request->validate([
        'line_uuid' => 'required|string',
        'user_id' => 'required|exists:users,id'
    ]);

    try {
        // Remove existing assignment for this chat
        DB::table('chat_assignments')
            ->where('line_uuid', $validated['line_uuid'])
            ->delete();

        // Create new assignment
        DB::table('chat_assignments')->insert([
            'line_uuid' => $validated['line_uuid'],
            'user_id' => $validated['user_id'],
            'assigned_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Chat assigned successfully'
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to assign chat: ' . $e->getMessage()
        ], 500);
    }
})->name('chat.assign')->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

Route::post('/unassign-chat', function (Request $request) {
    $validated = $request->validate([
        'line_uuid' => 'required|string'
    ]);

    try {
        DB::table('chat_assignments')
            ->where('line_uuid', $validated['line_uuid'])
            ->delete();

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
})->name('chat.unassign')->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

// Get all assignments route
Route::get('/chat-assignments', function () {
    try {
        // Check if the chat_assignments table exists
        if (!Schema::hasTable('chat_assignments')) {
            return response()->json([]);
        }
        
        // Get assignments with user information
        $assignments = DB::table('chat_assignments')
            ->join('users', 'chat_assignments.user_id', '=', 'users.id')
            ->select(
                'chat_assignments.*', 
                'users.name as assigned_user_name',
                'users.role as user_role'
            )
            ->get();

        return response()->json($assignments);
    } catch (\Exception $e) {
        // Return empty array on error instead of error response
        return response()->json([]);
    }
})->name('chat.assignments');

// Get current user information
Route::get('/current-user', function () {
    if (Auth::check()) {
        $user = Auth::user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role
        ]);
    }
    
    return response()->json(['error' => 'Not authenticated'], 401);
})->name('current.user');

// Route for fetching labels
Route::get('/message/get_labels', function () {
    try {
        $labels = DB::table('labels')
            ->select('id', 'name', 'color')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'labels'   => $labels,
        ]);
    } catch (\Throwable $e) {
        \Log::error('Failed to fetch labels', ['error' => $e->getMessage()]);

        return response()->json([
            'success' => false,
            'message' => 'Unable to fetch labels.'
        ], 500);
    }
});
// Route for deleting labels
Route::delete('/message/delete_label/{id}', function ($id) {
    try {
        $deleted = DB::table('labels')->where('id', $id)->delete();

        return response()->json([
            'success' => (bool) $deleted,
            'message' => $deleted ? 'Label deleted' : 'Label not found',
        ], $deleted ? 200 : 404);
    } catch (\Throwable $e) {
        \Log::error('Failed to delete label', ['error' => $e->getMessage()]);

        return response()->json([
            'success' => false,
            'message' => 'Database error while deleting label.',
        ], 500);
    }
})->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

// All protected routes - requires authentication
Route::middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');

    // Branches
    Route::resource('branches', BranchController::class);

    // Rooms
    Route::resource('rooms', RoomController::class);
    Route::get('rooms/by-branch/{branch}', [RoomController::class, 'getByBranch'])->name('rooms.by-branch');
    Route::get('/rooms/available', [App\Http\Controllers\RoomController::class, 'getAvailableRooms']);
    Route::get('/rooms/by-branch/{branchId}', [App\Http\Controllers\RoomController::class, 'getRoomsByBranch']);
    Route::post('rooms/{room}/primary-image', [RoomController::class, 'setPrimaryImage'])
        ->name('rooms.primary-image');
    Route::get('room-images/{image}/delete', [RoomController::class, 'deleteImage'])
        ->name('rooms.images.delete');

    // Bookings
    Route::resource('bookings', BookingController::class);
    Route::patch('/bookings/{booking}/status', [App\Http\Controllers\BookingController::class, 'updateStatus']);
    Route::get('bookings-search', [BookingController::class, 'search'])->name('bookings.search');
    Route::get('bookings-report', [BookingController::class, 'generateReport'])->name('bookings.report');
    Route::get('bookings-export', [BookingController::class, 'export'])->name('bookings.export');
    Route::put('/bookings/{booking}/update-status', [App\Http\Controllers\BookingController::class, 'updateStatus'])
        ->name('bookings.updateStatus');

    // Broadcasts — custom routes MUST come before the resource route
    // because Route::resource creates GET /broadcasts/{id} which would
    // shadow /broadcasts/labels, /broadcasts/send-line etc.

    // Get labels for broadcast targeting (from Google Sheets contacts)
    Route::get('/broadcasts/labels', [BroadcastController::class, 'getLabels'])
        ->name('broadcasts.labels');

    // Send broadcast to in-app message tabs
    Route::post('/broadcasts/send-in-app', [BroadcastController::class, 'sendInApp'])
        ->name('broadcasts.sendInApp')
        ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

    // Send LINE broadcast to all followers or specific labels
    Route::post('/broadcasts/send-line', [BroadcastController::class, 'sendLineBroadcast'])
        ->name('broadcasts.sendLine')
        ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

    // Resource route (index, create, store, show, edit, update, destroy)
    Route::resource('broadcasts', BroadcastController::class);

    // Analytics
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
    Route::get('/analytics/chat', [AnalyticsController::class, 'chatPerformance'])->name('analytics.chat');
    Route::get('/analytics/agent-performance', [AnalyticsController::class, 'agentPerformance'])->name('analytics.agent_performance');
    Route::get('/analytics/sales', [AnalyticsController::class, 'salesPerformance'])->name('analytics.sales');
    Route::get('/analytics/label-usage', [AnalyticsController::class, 'labelUsage'])->name('analytics.label');


    // Routes สำหรับการจัดการ labels
    Route::post('/analytics/labels', [AnalyticsController::class, 'saveLabel'])->name('analytics.saveLabel');
    Route::delete('/analytics/labels/{id}', [AnalyticsController::class, 'deleteLabel'])->name('analytics.deleteLabel');

    // Automations
    Route::get('/automations', [AutomationsController::class, 'index'])->name('automations.index');
    Route::post('/automations', [AutomationsController::class, 'store'])->name('automations.store');
    Route::patch('/automations/{id}/status', [AutomationsController::class, 'updateStatus'])->name('automations.update-status');
    Route::patch('/automations/{id}/mode', [AutomationsController::class, 'updateMode'])->name('automations.update-mode');
    Route::get('/automations/sheet', function() {
        return view('automations.sheet-view');
    })->name('automations.sheet-view');
    
    // เพิ่ม route เพื่อทดสอบว่าปัญหาเกิดจาก URL pattern หรือไม่
    Route::post('/create-automation', [AutomationsController::class, 'store'])->name('automations.create');
    
    // เพิ่ม route ที่ยกเว้น VerifyCsrfToken เพื่อทดสอบ
    Route::post('/save-automation', [AutomationsController::class, 'store'])
        ->name('automations.save')
        ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

    // AI Routes
    Route::prefix('ai')->name('ai.')->group(function () {
        Route::get('/', function () {
            return view('ai.index');
        })->name('index');
        Route::get('/scenario', function () {
            return view('ai.scenario');
        })->name('scenario');
        Route::get('/knowledge', function () {
            return view('ai.knowledge');
        })->name('knowledge');
    });

    // SONA Voice AI Routes
    Route::prefix('sona')->name('sona.')->group(function () {
        // Core routes
        Route::get('/overview', function () {
            return view('sona.overview');
        })->name('overview');

        Route::get('/inbox', [\App\Http\Controllers\SonaController::class, 'inbox'])->name('inbox');
        Route::get('/calls/{id}', [\App\Http\Controllers\SonaController::class, 'show'])->name('calls.show');

        // AI Agent routes
        Route::get('/agent-settings', function () {
            return view('sona.agent-settings');
        })->name('agent_settings');
        Route::post('/agent-settings', [\App\Http\Controllers\SonaController::class, 'saveAgentSettings'])->name('agent_settings.save');

        Route::get('/call-flow', [\App\Http\Controllers\SonaController::class, 'callFlow'])->name('callFlow');

        // Performance routes
        Route::get('/analytics', [\App\Http\Controllers\SonaController::class, 'analytics'])->name('analytics');
    });

    // Messages and Contacts Group
    Route::prefix('messages')->group(function () {
        Route::get('/', [MessageController::class, 'index'])->name('messages.index');
        
        // Redirect old contacts URL pattern to new one
        Route::get('/contacts', function() {
            return redirect()->route('contacts.index');
        });
    });

    // Contacts Routes
    Route::prefix('contacts')->name('contacts.')->group(function () {
        Route::get('/', [ContactController::class, 'index'])->name('index');
        Route::get('/{contact}/edit', [ContactController::class, 'edit'])->name('edit');
        Route::delete('/{contact}', [ContactController::class, 'destroy'])->name('destroy');
    });

    // RBCA Permissions Management
    Route::get('/permissions', function () {
        $users = \App\Models\User::all();
        return view('permissions.index', compact('users'));
    })->name('permissions.index');

    Route::get('/permissions/{user}/edit', function ($userId) {
        $user = \App\Models\User::findOrFail($userId);
        $allPermissions = [
            'dashboard',
            'branches',
            'rooms',
            'bookings',
            'broadcasts',
            'analytics',
            'automations',
            'ai',
            'messages',
            'contacts'
        ];
        // สมมติใช้ json field 'permissions' ใน users table ถ้ายังไม่มีให้เพิ่ม migration
        return view('permissions.edit', compact('user', 'allPermissions'));
    })->name('user.permissions.edit');

    Route::put('/permissions/{user}', function (Request $request, $userId) {
        $user = \App\Models\User::findOrFail($userId);
        $user->role = $request->input('role');
        $user->permissions = $request->input('permissions', []); // สมมติเป็น array
        $user->save();
        return redirect()->route('permissions.index')->with('success', 'Role and permissions updated successfully!');
    })->name('user.permissions.update');
    
    Route::delete('/permissions/{user}', function ($userId) {
        $user = \App\Models\User::findOrFail($userId);
        $user->delete();
        return redirect()->route('permissions.index')->with('success', 'User deleted successfully!');
    })->name('user.permissions.destroy');

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile/update', [ProfileController::class, 'update'])->name('profile.update');

});

// Test route for automations API controller
Route::get('/test-automations-api', [AutomationsApiController::class, 'index']);

// Removed duplicate API routes - these are properly handled in api.php

// Test route - you may want to protect this too
Route::middleware(['auth'])->get('/test-data', function () {
    $bookings = \App\Models\Booking::all();
    $branches = \App\Models\Branch::all();
    $rooms = \App\Models\Room::all();
    
    return [
        'bookings_count' => count($bookings),
        'branches_count' => count($branches),
        'rooms_count' => count($rooms),
        'first_booking' => $bookings->first(),
        'first_branch' => $branches->first(),
        'first_room' => $rooms->first(),
    ];
});

// Route for fetching rooms by branch - MOVED TO api.php

// Google Calendar routes
Route::middleware(['web'])->group(function () {
    Route::get('/calendar/connect', [GoogleCalendarController::class, 'connect'])
        ->name('calendar.connect');
    Route::get('/calendar/callback', [GoogleCalendarController::class, 'callback'])
        ->name('calendar.callback')
        ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
    Route::get('/calendar/events', [GoogleCalendarController::class, 'events'])
        ->name('calendar.events');
    Route::post('/calendar/disconnect', [GoogleCalendarController::class, 'disconnect'])
        ->name('calendar.disconnect')
        ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
});

Route::get('/create-user', function () {
    return view('createuser'); // อ้างถึง createuser.blade.php
});

Route::post('/store-user', function (Request $request) {
    $name = $request->input('name');
    $email = $request->input('email');
    $password = Hash::make($request->input('password'));
    $role = $request->input('role');

    User::create([
        'name' => $name,
        'email' => $email,
        'password' => $password,
        'role' => $role,
    ]);

    return 'User created successfully!';
});

// Upload profile image for user
Route::post('/upload-profile-image', function (Request $request) {
    $request->validate([
        'user_id' => 'required|exists:users,id',
        'profile_image' => 'required|image|mimes:jpeg,png|max:2048',
    ]);

    $user = \App\Models\User::findOrFail($request->user_id);
    $file = $request->file('profile_image');
    $path = $file->store('profile_images', 'public');
    $user->profile_image = $path;
    $user->save();

    return back()->with('success', 'Profile image uploaded successfully!');
});

// File upload for chat - uploads to Google Cloud Storage
Route::post('/upload-file', function (Request $request) {
    try {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'line_uuid' => 'required|string'
        ]);

        $file = $request->file('file');
        $lineUuid = $request->input('line_uuid');

        // Generate safe filename
        $filename = time() . '_' . $file->getClientOriginalName();
        $filename = preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);

        // Build destination path in GCS
        $datePath = date('Y/m/d');
        $dir = trim(env('GCS_PATH_PREFIX', ''), '/');
        $gcsPath = ($dir ? ($dir . '/') : '') . 'chat_files/' . $lineUuid . '/' . $datePath;

        // Store to GCS using direct client (workaround for Flysystem adapter issue)
        \Illuminate\Support\Facades\Log::info('Attempting GCS upload', [
            'gcsPath' => $gcsPath,
            'filename' => $filename,
            'fileSize' => $file->getSize(),
            'mimeType' => $file->getMimeType()
        ]);
        
        try {
            // Use direct Google Cloud Storage client
            $storage = new \Google\Cloud\Storage\StorageClient([
                'projectId' => config('filesystems.disks.gcs.project_id'),
                'keyFilePath' => config('filesystems.disks.gcs.key_file')
            ]);
            
            $bucket = $storage->bucket(config('filesystems.disks.gcs.bucket'));
            $objectPath = $gcsPath . '/' . $filename;
            
            // Upload file
            $object = $bucket->upload(
                fopen($file->getPathname(), 'r'),
                [
                    'name' => $objectPath,
                    'metadata' => [
                        'contentType' => $file->getMimeType(),
                        'originalName' => $file->getClientOriginalName()
                    ]
                ]
            );
            
            // Note: ACL cannot be set when uniform bucket-level access is enabled
            // Files will be public based on bucket-level IAM policies
            
            $storedPath = $objectPath;
            
            \Illuminate\Support\Facades\Log::info('GCS upload successful', [
                'storedPath' => $storedPath
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('GCS upload exception', [
                'gcsPath' => $gcsPath,
                'filename' => $filename,
                'lineUuid' => $lineUuid,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw new \Exception('Failed to upload to Google Cloud Storage: ' . $e->getMessage());
        }

        // Visibility is now handled in the direct upload above

        // Build public URL
        $publicBase = rtrim(env('GCS_PUBLIC_URL', ''), '/');
        $fileUrl = $publicBase ? ($publicBase . '/' . ltrim($storedPath, '/')) : null;
        if (!$fileUrl) {
            // Default to standard GCS public URL pattern
            $bucket = config('filesystems.disks.gcs.bucket');
            if ($bucket) {
                $fileUrl = "https://storage.googleapis.com/{$bucket}/" . ltrim($storedPath, '/');
            }
        }
        if (!$fileUrl) {
            // Fallback: attempt Storage URL if configured
            try { $fileUrl = Storage::disk('gcs')->url($storedPath); } catch (\Throwable $e) {}
        }
        if (!$fileUrl) {
            // Last resort: return stored path; client may still use it
            $fileUrl = $storedPath;
        }
        
        \Illuminate\Support\Facades\Log::info('File URL generated', [
            'storedPath' => $storedPath,
            'fileUrl' => $fileUrl,
            'publicBase' => $publicBase,
            'bucket' => config('filesystems.disks.gcs.bucket')
        ]);

        // Get file info
        $fileInfo = [
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'type' => $file->getMimeType(),
            'uploaded_at' => now()->toIso8601String(),
            'line_uuid' => $lineUuid
        ];

        $fileId = uniqid('file_');

        $fileRecord = [
            'id' => $fileId,
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'line_uuid' => $lineUuid,
            'uploaded_at' => time(),
            'gcs_path' => $storedPath,
            'url' => $fileUrl,
        ];

        return response()->json([
            'success' => true,
            'file_id' => $fileId,
            'file_url' => $fileUrl,
            'file_info' => $fileRecord,
            'message' => 'File uploaded successfully'
        ]);
        
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('File upload error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Upload failed: ' . $e->getMessage()
        ], 500);
    }
})->withoutMiddleware([
    \App\Http\Middleware\VerifyCsrfToken::class,
    \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class
]);



Route::middleware(['auth'])->group(function () {
    // ... existing routes ...
    
    // Permissions routes
    Route::resource('permissions', PermissionController::class)->names([
        'index' => 'permissions.index',
        'create' => 'permissions.create', 
        'store' => 'permissions.store',
        'show' => 'permissions.show',
        'edit' => 'permissions.resource.edit',
        'update' => 'permissions.resource.update',
        'destroy' => 'permissions.resource.destroy'
    ]);
});

// API route moved to api.php - /api/get-unread-chat

// API route moved to api.php - /api/trigger-unread-webhook

// API route moved to api.php - /api/clear-unread


// API route moved to api.php - /api/line-profile/{userId}

// API route moved to api.php - /api/line-conversations

// API route moved to api.php - /api/line-image/{messageId}


// JavaScript Configuration endpoint
Route::get('/js-config', function() {
    return response()->json([
        'n8n_webhook_url' => env('N8N_WEBHOOK_URL', ''),
        // Add other frontend config variables here as needed
    ]);
});

// API route moved to api.php - /api/customer/save
// API route moved to api.php - /api/customer/{lineUuid}
// API route moved to api.php - /api/customer/add-note

// NOTE: LINE webhook now handled by /webhook.php (standalone file)
// This avoids Laravel CSRF issues and provides better performance

// API route moved to api.php - /api/check-message-updates

Route::get('/role-permissions/{role}/edit', [RolePermissionController::class, 'edit'])->name('role_permissions.edit');
Route::post('/role-permissions/{role}/update', [RolePermissionController::class, 'update'])->name('role_permissions.update');

// SSE endpoints removed - using WebSocket (Reverb) instead
