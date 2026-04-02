<!DOCTYPE html>
<html>
<head>
    <title>Create User</title>
</head>
<body>
    <h2>Create New User</h2>
    <form action="/store-user" method="POST">
        @csrf
        <input type="text" name="name" placeholder="Name" required><br>
        <input type="email" name="email" placeholder="Email" required><br>
        <input type="password" name="password" placeholder="Password" required><br>
        <select name="role">
            <option value="admin">Admin</option>
            <option value="sales">Sales</option>
        </select><br>
        <button type="submit">Create</button>
    </form>

    <hr>
    <h2>Upload Profile Image</h2>
    <form action="/upload-profile-image" method="POST" enctype="multipart/form-data">
        @csrf
        <label for="user_id">Select User:</label>
        <select name="user_id" id="user_id">
            @foreach(\App\Models\User::all() as $user)
                <option value="{{ $user->id }}">{{ $user->name }} ({{ $user->email }})</option>
            @endforeach
        </select><br>
        <input type="file" name="profile_image" accept="image/png, image/jpeg" required><br>
        <button type="submit">Upload Image</button>
    </form>
</body>
</html>
