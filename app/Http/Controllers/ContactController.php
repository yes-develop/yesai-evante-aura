<?php

namespace App\Http\Controllers;

use App\Services\EvanteApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    private array $requiredColumns = [
        'lineuuid',
        'status',
        'sequence',
        'profile name',
        'messagechannel',
        'label',
        'profile image',
        'unreadchat',
        'color',
        'phone',
        'email',
        'note',
        'create date',
    ];

    public function __construct(private readonly EvanteApiService $evanteApi)
    {
    }

    public function index()
    {
        try {
            $result = $this->evanteApi->getContacts();

            if (!($result['success'] ?? false)) {
                throw new \Exception($result['error'] ?? 'Failed to fetch contacts from Evante API');
            }

            $rawContacts = $result['data'] ?? [];

            $contacts = array_map(function (array $item): array {
                return [
                    'lineuuid'       => $item['lineUuid'] ?? $item['lineuuid'] ?? '',
                    'status'         => $item['status'] ?? '',
                    'sequence'       => $item['chatSequence'] ?? $item['sequence'] ?? '',
                    'profile name'   => $item['displayName'] ?? $item['profileName'] ?? $item['profile_name'] ?? '',
                    'messagechannel' => $item['messageChannel'] ?? $item['messagechannel'] ?? '',
                    'label'          => $item['label'] ?? '',
                    'profile image'  => $item['profileImage'] ?? $item['profile_image'] ?? '',
                    'unreadchat'     => $item['unreadChat'] ?? $item['unreadchat'] ?? '',
                    'color'          => $item['color'] ?? '',
                    'phone'          => $item['phone'] ?? '',
                    'email'          => $item['email'] ?? '',
                    'note'           => $item['note'] ?? '',
                    'create date'    => $item['createdAt'] ?? $item['create_date'] ?? '',
                    'id'             => md5($item['lineUuid'] ?? $item['lineuuid'] ?? uniqid()),
                ];
            }, $rawContacts);

            return view('message.contacts', [
                'contacts' => $contacts,
                'headers'  => $this->requiredColumns,
            ]);
        } catch (\Exception $e) {
            Log::error('ContactController Error: ' . $e->getMessage());
            return back()->with('error', 'Error fetching contacts: ' . $e->getMessage());
        }
    }
}
