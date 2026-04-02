<!-- filepath: /c:/yesweb/resources/views/auth/login.blade.php -->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Login - Yesweb Design Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('css/admin_dashboard.css?time=') }}<?php echo time(); ?>">
    <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;600&display=swap" rel="stylesheet">
    <link rel="icon" href="{{ asset('/images/logo.png') }}" type="image/x-icon">

    <style>
        body {
            margin: 0;
            font-family: 'Prompt', 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
            min-height: 100vh;
            overflow: hidden;
        }

        .container-fluid {
            padding: 0;
            display: flex;
            height: 100vh;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
            background: rgba(255, 255, 255, 0.95);
        }

        .left-section {
            flex: 1;
            position: relative;
            display: flex;
            align-items: stretch;
            min-height: 100vh;
            overflow: hidden;
        }

        .login-bg {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: blur(0px) brightness(0.85);
            z-index: 1;
            pointer-events: none;
            /* ป้องกันวิดีโอบังคลิกขององค์ประกอบอื่น */
        }

        .left-section .bg-overlay {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.08);
            z-index: 2;
        }


        .stat-card {
            background: #fff;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            aspect-ratio: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            overflow: hidden;
            position: relative;
            background-size: cover;
            background-position: center;
        }

        .stat-card.orange {
            background: linear-gradient(135deg, rgba(255, 87, 51, 0.95), rgba(255, 87, 51, 0.8));
            color: white;
        }

        .stat-card.green {
            background: linear-gradient(135deg, rgba(46, 204, 113, 0.95), rgba(46, 204, 113, 0.8));
            color: white;
        }

        .stat-card.image {
            position: relative;
        }

        .stat-card.image::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1));
            border-radius: 12px;
        }

        .stat-card.image-1 {
            background-image: url('/images/GOHotelbranch.png');
        }

        .stat-card.image-2 {
            background-image: url('/images/GOHotelroom.png');
        }

        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stat-text {
            font-size: 1rem;
            opacity: 0.9;
            line-height: 1.4;
        }

        .right-section {
            width: 50%;
            background: rgba(255, 255, 255, 0.98);
            padding: 2.5rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            border-radius: 0 24px 24px 0;
            box-shadow: none;
        }

        .login-header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .login-header img {
            width: 65px;
            max-width: 100%;
            margin-bottom: 1rem;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }

        .login-header h1 {
            color: #000000ff;
            font-weight: 500;
            font-size: 1.7rem;
        }

        .login-header p {
            color: #b3b3b3ff;
            font-size: 1.1rem;
        }

        .login-form {
            padding-left: 8rem;
            padding-right: 8rem;
        }

        .form-control {
            border-radius: 12px;
            font-size: 1.05rem;
            margin-bottom: 1.2rem;
            border: 1.5px solid #e0e0e0;
            padding: 0.9rem 1.2rem;
        }

        .form-control:focus {
            border-color: #4a90e2;
            box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }

        .btn-login {
            width: 100%;
            background-color: #eaee00ff;
            color: #000000ff;
            padding: 0.7rem 0rem;
            border-radius: 12px;
            font-weight: 500;
            font-size: 0.9rem;
            box-shadow: 0 2px 8px rgba(67, 206, 162, 0.12);
            transition: background 0.2s, transform 0.2s;
        }
        
        .btn-login:hover {
            background-color: #fbff00ff;
        }

        .form-check-label,
        .form-check-input {
            font-size: 1rem;
        }

        .form-check-input:checked {
            background-color: #0052cc;
            border-color: #0052cc;
        }

        a {
            color: #0052cc;
            text-decoration: none;
            font-size: 0.9rem;
        }

        a:hover {
            color: #0047b3;
        }

        .alert {
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }

        @media (max-width: 1200px) {
            body {
                overflow: auto;
            }

            .container-fluid {
                flex-direction: column;
                height: auto;
                min-height: 100vh;
            }

            .left-section {
                min-height: 200px;
                height: 200px;
                flex: none;
            }

            .right-section {
                width: 100%;
                border-radius: 24px 24px 0 0;
                margin-top: -24px;
                z-index: 3;
                padding: 2rem 1.5rem;
            }

            .login-header h1 {
                font-size: 1.3rem;
            }

            .login-header p {
                font-size: 0.95rem;
            }
        }

        @media (max-width: 480px) {
            .left-section {
                min-height: 150px;
                height: 150px;
            }

            .right-section {
                padding: 1.5rem 1rem;
            }

            .login-form {
                padding-left: 0;
                padding-right: 0;
            }

            .login-header img {
                width: 50px;
            }

            .login-header h1 {
                font-size: 1.15rem;
            }
        }
    </style>
</head>

<body>
    <div class="container-fluid">
        <div class="left-section">
            <video class="login-bg" autoplay muted loop playsinline>
                <source src="/images/aibg.mp4" type="video/mp4">
            </video>
            <div class="bg-overlay"></div>
        </div>


        <div class="right-section">
            <div class="login-header">
                <img src="/images/logo.png" alt="GO Hotel Logo">
                <h1>Sign in to Yes Web Design</h1>
                <p>Welcome back! Please enter your login details.</p>
            </div>

            @if(session('success'))
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                {{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            @endif

            @if(session('error'))
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                {{ session('error') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            @endif

            <form method="POST" action="{{ route('login') }}">
                @csrf

                <div class="login-form">
                    <div class="form-group">
                        <input type="email" class="form-control @error('email') is-invalid @enderror"
                            id="email" name="email" value="{{ old('email') }}"
                            placeholder="Email Address" required autofocus>
                        @error('email')
                        <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div>
                        <input type="password" class="form-control @error('password') is-invalid @enderror"
                            id="password" name="password" placeholder="Password" required>
                        @error('password')
                        <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="remember" id="remember"
                                {{ old('remember') ? 'checked' : '' }}>
                            <label class="form-check-label" for="remember" style="color: #b1b1b1ff;">Remember me</label>
                        </div>
                        @if (Route::has('password.request'))
                        <a href="{{ route('password.request') }}">Forgot password?</a>
                        @endif
                    </div>

                    <button type="submit" class="btn btn-login">Sign in</button>
                </div>

            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    </body>

</html>