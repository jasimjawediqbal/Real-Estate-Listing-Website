<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$conn = new mysqli("localhost", "root", "", "prime_properties");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$google_id = $data['sub'] ?? '';
$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$picture = $data['picture'] ?? '';

if (!$email || !$name || !$google_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid Google data']);
    exit;
}

// Check if user exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email=?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    // Update Google ID and picture
    $update = $conn->prepare("UPDATE users SET google_id=?, profile_pic=? WHERE email=?");
    $update->bind_param("sss", $google_id, $picture, $email);
    $update->execute();

    echo json_encode(['success' => true, 'user' => ['name' => $name]]);
} else {
    // Insert new Google user
    $insert = $conn->prepare("INSERT INTO users (name, email, google_id, profile_pic) VALUES (?, ?, ?, ?)");
    $insert->bind_param("ssss", $name, $email, $google_id, $picture);
    $insert->execute();

    echo json_encode(['success' => true, 'user' => ['name' => $name]]);
}

$stmt->close();
$conn->close();
?>
