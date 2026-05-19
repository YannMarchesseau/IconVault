<?php
require_once __DIR__ . '/auth.php';
requireAuthentication();

header('Content-Type: application/json; charset=utf-8');

$configPath = __DIR__ . '/config.json';
$config = file_exists($configPath) ? json_decode(file_get_contents($configPath), true) : [];

if (($config['allowUpload'] ?? true) !== true) {
    http_response_code(403);
    echo json_encode([['status' => 'error', 'message' => 'Upload désactivé dans config.json.']]);
    exit;
}

$allowedExtensions = $config['allowedExtensions'] ?? ['png', 'jpg', 'jpeg', 'webp'];
$maxUploadSizeMB = $config['maxUploadSizeMB'] ?? 5;
$maxUploadSizeBytes = $maxUploadSizeMB * 1024 * 1024;

$mediaFolders = $config['mediaFolders'] ?? [
    'icons' => [
        'path' => 'icons/'
    ]
];
$defaultMediaFolder = $config['defaultMediaFolder'] ?? array_key_first($mediaFolders);

$requestedMediaFolder = $_POST['mediaFolder'] ?? $defaultMediaFolder;
$requestedMediaFolder = preg_replace('/[^a-zA-Z0-9._-]/', '', $requestedMediaFolder);

if (!isset($mediaFolders[$requestedMediaFolder])) {
    $requestedMediaFolder = $defaultMediaFolder;
}

$mediaPath = $mediaFolders[$requestedMediaFolder]['path'] ?? 'icons/';
$mediaPath = trim($mediaPath, "/\\");
$mediaPath = preg_replace('/[^a-zA-Z0-9._\/-]/', '', $mediaPath);

$requestedDirectory = $_POST['directory'] ?? '';
$requestedDirectory = trim($requestedDirectory, "/\\");
$requestedDirectory = preg_replace('/[^a-zA-Z0-9._-]/', '', $requestedDirectory);

$rootDirectoryPath = __DIR__ . DIRECTORY_SEPARATOR . $mediaPath;

if (!is_dir($rootDirectoryPath)) {
    mkdir($rootDirectoryPath, 0755, true);
}

$rootDirectory = realpath($rootDirectoryPath);

if ($rootDirectory === false) {
    http_response_code(500);
    echo json_encode([['status' => 'error', 'message' => 'Impossible d’accéder au dossier média.']]);
    exit;
}

$targetDir = $rootDirectory;

if ($requestedDirectory !== '') {
    $candidate = realpath($rootDirectory . DIRECTORY_SEPARATOR . $requestedDirectory);

    if ($candidate !== false && str_starts_with($candidate, $rootDirectory) && is_dir($candidate)) {
        $targetDir = $candidate;
    }
}

$allowedMimeTypes = [
    'png' => ['image/png'],
    'jpg' => ['image/jpeg'],
    'jpeg' => ['image/jpeg'],
    'webp' => ['image/webp']
];

$response = [];

if (empty($_FILES['file'])) {
    echo json_encode([['status' => 'error', 'message' => 'Aucun fichier reçu.']]);
    exit;
}

foreach ($_FILES['file']['name'] as $key => $originalName) {
    $safeName = preg_replace('/[^a-zA-Z0-9._-]/', '', basename($originalName));
    $extension = strtolower(pathinfo($safeName, PATHINFO_EXTENSION));
    $tmpName = $_FILES['file']['tmp_name'][$key] ?? '';
    $size = $_FILES['file']['size'][$key] ?? 0;

    if ($safeName === '' || !in_array($extension, $allowedExtensions, true)) {
        $response[] = ['name' => $originalName, 'status' => 'error', 'message' => 'Extension non autorisée.'];
        continue;
    }

    if ($size > $maxUploadSizeBytes) {
        $response[] = ['name' => $safeName, 'status' => 'error', 'message' => 'Fichier trop volumineux.'];
        continue;
    }

    $mimeType = mime_content_type($tmpName);

    if (!isset($allowedMimeTypes[$extension]) || !in_array($mimeType, $allowedMimeTypes[$extension], true)) {
        $response[] = ['name' => $safeName, 'status' => 'error', 'message' => 'Type MIME invalide.'];
        continue;
    }

    $targetFile = $targetDir . DIRECTORY_SEPARATOR . $safeName;
    $fileInfo = pathinfo($targetFile);
    $counter = 1;

    while (file_exists($targetFile)) {
        $targetFile = $fileInfo['dirname'] . DIRECTORY_SEPARATOR . $fileInfo['filename'] . '_' . $counter . '.' . $fileInfo['extension'];
        $counter++;
    }

    if (move_uploaded_file($tmpName, $targetFile)) {
        $response[] = [
            'name' => basename($targetFile),
            'mediaFolder' => $requestedMediaFolder,
            'directory' => $requestedDirectory,
            'status' => 'success',
            'message' => 'Fichier téléversé.'
        ];
    } else {
        $response[] = ['name' => $safeName, 'status' => 'error', 'message' => 'Erreur lors du téléversement.'];
    }
}

echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
