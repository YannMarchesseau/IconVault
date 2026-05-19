<?php
session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Strict',
    // Set to true when the site is served exclusively over HTTPS.
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'
]);

session_start();

function isAuthenticated(): bool
{
    return !empty($_SESSION['authenticated']);
}

function requireAuthentication(): void
{
    if (!isAuthenticated()) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            ['status' => 'error', 'message' => 'Authentication required.']
        ]);
        exit;
    }
}
