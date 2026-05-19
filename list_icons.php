<?php
header('Content-Type: application/json; charset=utf-8');

$configPath = __DIR__ . '/config.json';
$config = file_exists($configPath) ? json_decode(file_get_contents($configPath), true) : [];
$allowedExtensions = $config['allowedExtensions'] ?? ['png', 'jpg', 'jpeg', 'webp'];

$rootDirectory = realpath(__DIR__ . '/icons');
if ($rootDirectory === false) {
    mkdir(__DIR__ . '/icons', 0755, true);
    $rootDirectory = realpath(__DIR__ . '/icons');
}

$requestedDirectory = $_GET['directory'] ?? '';
$requestedDirectory = trim($requestedDirectory, "/\\");
$requestedDirectory = preg_replace('/[^a-zA-Z0-9._-]/', '', $requestedDirectory);

$currentDirectory = $rootDirectory;
if ($requestedDirectory !== '') {
    $candidate = realpath($rootDirectory . DIRECTORY_SEPARATOR . $requestedDirectory);
    if ($candidate !== false && str_starts_with($candidate, $rootDirectory) && is_dir($candidate)) {
        $currentDirectory = $candidate;
    }
}

$items = array_diff(scandir($currentDirectory), ['..', '.']);
$files = [];
$directories = [];

foreach ($items as $item) {
    $fullPath = $currentDirectory . DIRECTORY_SEPARATOR . $item;

    if (is_dir($fullPath)) {
        $directories[] = $item;
        continue;
    }

    if (is_file($fullPath)) {
        $extension = strtolower(pathinfo($item, PATHINFO_EXTENSION));
        if (in_array($extension, $allowedExtensions, true)) {
            $files[] = $item;
        }
    }
}

sort($files, SORT_NATURAL | SORT_FLAG_CASE);
sort($directories, SORT_NATURAL | SORT_FLAG_CASE);

echo json_encode([
    'files' => array_values($files),
    'directories' => array_values($directories)
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
