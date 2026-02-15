<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

const GOOGLE_CLIENT_ID = '619721643105-lrh7n9l1rk52feknk2qhivosm8nqlc2m.apps.googleusercontent.com';

function respond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

function fetchJson(string $url): ?array
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2
        ]);
        $raw = curl_exec($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($raw === false || $httpCode !== 200) {
            return null;
        }
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 15
            ]
        ]);

        $raw = @file_get_contents($url, false, $context);
        if ($raw === false) {
            return null;
        }
    }

    $json = json_decode($raw, true);
    return is_array($json) ? $json : null;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['error' => 'Method not allowed']);
}

$data = json_decode(file_get_contents('php://input'), true);
$credential = trim((string)($data['credential'] ?? ''));

if ($credential === '') {
    respond(400, ['error' => 'Missing Google credential token']);
}

$tokenInfoUrl = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential);
$tokenInfo = fetchJson($tokenInfoUrl);

if (!$tokenInfo || isset($tokenInfo['error_description'])) {
    respond(401, ['error' => 'Invalid or expired Google token']);
}

$audience = (string)($tokenInfo['aud'] ?? '');
$emailVerified = $tokenInfo['email_verified'] ?? '';
$googleId = trim((string)($tokenInfo['sub'] ?? ''));
$name = trim((string)($tokenInfo['name'] ?? 'Google User'));
$email = trim((string)($tokenInfo['email'] ?? ''));
$picture = trim((string)($tokenInfo['picture'] ?? ''));

if ($audience !== GOOGLE_CLIENT_ID) {
    respond(401, ['error' => 'Google token audience mismatch']);
}

if (!in_array($emailVerified, ['true', true, 1, '1'], true)) {
    respond(401, ['error' => 'Google email is not verified']);
}

if ($googleId === '' || $email === '') {
    respond(400, ['error' => 'Google profile data is incomplete']);
}

$conn = new mysqli('localhost', 'root', '', 'prime_properties');
if ($conn->connect_error) {
    respond(500, ['error' => 'Database connection failed']);
}

$stmt = $conn->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
$existingUser = null;
if ($stmt->num_rows > 0) {
    $stmt->bind_result($existingId);
    $stmt->fetch();
    $existingUser = ['id' => $existingId];
}
$stmt->close();

if ($existingUser) {
    $userId = (int)$existingUser['id'];
    $update = $conn->prepare('UPDATE users SET name = ?, google_id = ?, profile_pic = ? WHERE id = ?');
    $update->bind_param('sssi', $name, $googleId, $picture, $userId);

    if (!$update->execute()) {
        $update->close();
        $conn->close();
        respond(500, ['error' => 'Failed to update Google user']);
    }

    $update->close();
} else {
    $emptyPassword = '';
    $insert = $conn->prepare('INSERT INTO users (name, email, password, google_id, profile_pic) VALUES (?, ?, ?, ?, ?)');
    $insert->bind_param('sssss', $name, $email, $emptyPassword, $googleId, $picture);

    if (!$insert->execute()) {
        $insert->close();
        $conn->close();
        respond(500, ['error' => 'Failed to create Google user']);
    }

    $userId = (int)$insert->insert_id;
    $insert->close();
}

$conn->close();
respond(200, [
    'success' => true,
    'user' => [
        'id' => $userId,
        'name' => $name,
        'email' => $email
    ]
]);
?>
