<?php

namespace App\Http\Livewire\Auth;

use Livewire\Component;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class Login extends Component
{
    public $email = '';
    public $password = '';
    public $remember = false;

    protected $rules = [
        'email' => 'required|email',
        'password' => 'required',
    ];

    public function login()
    {
        $this->validate();
        
        if (Auth::attempt(['email' => $this->email, 'password' => $this->password], $this->remember)) {
            session()->regenerate();
            return redirect()->intended(route('dashboard'));
        } else {
            $this->addError('email', trans('auth.failed'));
        }
    }

    public function render()
    {
        // แก้ไขตรงนี้ให้ใช้ layout ที่ถูกต้อง
        return view('livewire.auth.login')
            ->layout('layouts.guest');
    }
}
