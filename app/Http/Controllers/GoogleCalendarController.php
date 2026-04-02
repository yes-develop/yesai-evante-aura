<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Google\Client as GoogleClient;
use Google\Service\Calendar as GoogleCalendar;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GoogleCalendarController extends Controller
{
    private $client;

    public function __construct()
    {
        try {
            $this->client = new GoogleClient();
            $this->client->setApplicationName('GO Hotel Calendar');
            $this->client->setClientId(config('services.google.client_id'));
            $this->client->setClientSecret(config('services.google.client_secret'));
            $this->client->setRedirectUri(config('services.google.redirect_uri'));
            $this->client->addScope(GoogleCalendar::CALENDAR);
            $this->client->setAccessType('offline');
            $this->client->setPrompt('consent');
            $this->client->setIncludeGrantedScopes(true);
        } catch (Exception $e) {
            Log::error('Google Client initialization error: ' . $e->getMessage());
        }
    }

    public function connect(Request $request)
    {
        try {
            if (!$this->client) {
                throw new Exception('Google Client not initialized');
            }

            $redirect = $request->query('redirect');
            if ($redirect && Str::startsWith($redirect, '/')) {
                session(['google_calendar_redirect' => $redirect]);
            } elseif (!session()->has('google_calendar_redirect')) {
                session(['google_calendar_redirect' => '/messages']);
            }

            $authUrl = $this->client->createAuthUrl();
            return response()->json(['url' => $authUrl]);
        } catch (Exception $e) {
            Log::error('Google Calendar connect error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function callback(Request $request)
    {
        try {
            if (!$this->client) {
                throw new Exception('Google Client not initialized');
            }

            if ($request->has('code')) {
                $token = $this->client->fetchAccessTokenWithAuthCode($request->code);
                
                if (!isset($token['error'])) {
                    session(['google_calendar_token' => $token]);

                    if ($request->expectsJson()) {
                        return response()->json(['success' => true]);
                    }

                    session()->flash('google_calendar_connected', true);
                    $redirectPath = session()->pull('google_calendar_redirect', '/messages');

                    return redirect()->to($this->resolveRedirectUrl($redirectPath));
                }

                throw new Exception($token['error'] ?? 'Unknown error during token fetch');
            }

            throw new Exception('No authorization code present');
        } catch (Exception $e) {
            Log::error('Google Calendar callback error: ' . $e->getMessage());

            if ($request->expectsJson()) {
                return response()->json(['error' => $e->getMessage()], 400);
            }

            $redirectPath = session()->pull('google_calendar_redirect', '/messages');

            return redirect()->to($this->resolveRedirectUrl($redirectPath))
                ->with('google_calendar_error', $e->getMessage());
        }
    }

    public function events()
    {
        try {
            if (!$this->client) {
                throw new Exception('Google Client not initialized');
            }

            $token = session('google_calendar_token');
            
            if (!$token) {
                throw new Exception('Not authenticated');
            }

            $this->client->setAccessToken($token);
            
            if ($this->client->isAccessTokenExpired()) {
                if ($this->client->getRefreshToken()) {
                    $this->client->fetchAccessTokenWithRefreshToken($this->client->getRefreshToken());
                    session(['google_calendar_token' => $this->client->getAccessToken()]);
                } else {
                    throw new Exception('Token expired and no refresh token available');
                }
            }

            $service = new GoogleCalendar($this->client);
            
            $calendarId = 'primary';
            $optParams = [
                'maxResults' => 10,
                'orderBy' => 'startTime',
                'singleEvents' => true,
                'timeMin' => date('c'),
            ];
            
            $results = $service->events->listEvents($calendarId, $optParams);
            $events = [];
            
            foreach ($results->getItems() as $event) {
                $events[] = [
                    'id' => $event->id,
                    'summary' => $event->getSummary(),
                    'start' => [
                        'dateTime' => $event->start->dateTime ?? null,
                        'date' => $event->start->date ?? null,
                        'timeZone' => $event->start->timeZone ?? null,
                    ],
                    'end' => [
                        'dateTime' => $event->end->dateTime ?? null,
                        'date' => $event->end->date ?? null,
                        'timeZone' => $event->end->timeZone ?? null,
                    ],
                    'location' => $event->getLocation(),
                    'hangoutLink' => $event->getHangoutLink(),
                    'status' => $event->status,
                    'description' => $event->getDescription(),
                ];
            }
            
            return response()->json(['events' => $events]);
        } catch (Exception $e) {
            Log::error('Google Calendar events error: ' . $e->getMessage());

            $status = 500;
            if ($e->getCode() >= 400 && $e->getCode() < 600) {
                $status = $e->getCode();
            } elseif ($e->getMessage() === 'Not authenticated') {
                $status = 401;
            }

            return response()->json(['error' => $e->getMessage()], $status);
        }
    }

    public function disconnect(Request $request)
    {
        try {
            session()->forget([
                'google_calendar_token',
                'google_calendar_redirect'
            ]);

            if ($request->expectsJson()) {
                return response()->json(['success' => true]);
            }

            return redirect()->back()->with('google_calendar_disconnected', true);
        } catch (Exception $e) {
            Log::error('Google Calendar disconnect error: ' . $e->getMessage());

            if ($request->expectsJson()) {
                return response()->json(['error' => $e->getMessage()], 500);
            }

            return redirect()->back()->with('google_calendar_error', $e->getMessage());
        }
    }

    private function resolveRedirectUrl(string $redirectPath): string
    {
        if (!Str::startsWith($redirectPath, '/')) {
            $redirectPath = '/messages';
        }

        $parsed = parse_url($redirectPath);
        $path = $parsed['path'] ?? '/messages';

        $query = [];
        if (!empty($parsed['query'])) {
            parse_str($parsed['query'], $query);
        }
        $query['google_calendar'] = 'connected';
        $queryString = http_build_query($query);

        $url = url($path);
        if ($queryString) {
            $url .= '?' . $queryString;
        }

        if (!empty($parsed['fragment'])) {
            $url .= '#' . $parsed['fragment'];
        }

        return $url;
    }
}