<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

if (!isset($_GET['id'])) {
    respond(['error' => 'No property ID provided'], 400);
}

$id = (int)$_GET['id'];
if ($id <= 0) {
    respond(['error' => 'Invalid property ID'], 400);
}

$conn = mysqli_connect('localhost', 'root', '', 'prime_properties');
if (!$conn) {
    respond(['error' => 'Database connection failed'], 500);
}

mysqli_set_charset($conn, 'utf8mb4');

$stmt = $conn->prepare('SELECT * FROM properties WHERE id = ? LIMIT 1');
$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();
$property = $result ? $result->fetch_assoc() : null;

$stmt->close();
$conn->close();

if (!$property) {
    respond(['error' => 'Property not found'], 404);
}

respond(['property' => $property]);
?>
