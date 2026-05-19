<?php
session_start();

$config = require __DIR__ . '/auth_config.php';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (
        hash_equals($config['username'], $username) &&
        password_verify($password, $config['password_hash'])
    ) {
        $_SESSION['authenticated'] = true;
        header('Location: icons.html');
        exit;
    }

    $error = 'Invalid credentials';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Login</title>
<style>
body{
font-family:Inter,system-ui,sans-serif;
display:grid;
place-items:center;
min-height:100vh;
background:#0f172a;
margin:0;
color:white;
}
.card{
width:min(420px,calc(100% - 32px));
background:#111827;
padding:32px;
border-radius:28px;
box-shadow:0 20px 80px rgba(0,0,0,.35);
}
input{
width:100%;
padding:14px;
border-radius:14px;
border:1px solid #334155;
background:#1e293b;
color:white;
margin-top:8px;
margin-bottom:18px;
box-sizing:border-box;
}
button{
width:100%;
padding:14px;
border:0;
border-radius:14px;
background:#2563eb;
color:white;
font-weight:700;
cursor:pointer;
}
.error{
background:#7f1d1d;
padding:12px;
border-radius:12px;
margin-bottom:18px;
}
</style>
</head>
<body>
<div class="card">
<h1>Upload Login</h1>

<?php if ($error): ?>
<div class="error"><?php echo htmlspecialchars($error); ?></div>
<?php endif; ?>

<form method="POST">
<label>Username</label>
<input type="text" name="username" required>

<label>Password</label>
<input type="password" name="password" required>

<button type="submit">Login</button>
</form>
</div>
</body>
</html>
