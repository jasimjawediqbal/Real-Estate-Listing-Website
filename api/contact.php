<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$conn = mysqli_connect("localhost", "root", "", "prime_properties");

$data = json_decode(file_get_contents('php://input'), true);

// Get values
$interest = $data['interest'] ?? '';
$fullname = trim($data['fullname'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$contactMethods = implode(', ', $data['contactMethods'] ?? []);
$preferredDate = $data['preferredDate'] ?? null;
$message = trim($data['message'] ?? '');

if (!$interest || !$fullname || !$email || !$phone || !$message) {
    http_response_code(400);
    echo json_encode(['error' => 'Please fill all required fields']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO inquiries 
(interest_type, fullname, email, phone, contact_methods, preferred_datetime, message) 
VALUES (?, ?, ?, ?, ?, ?, ?)");

$stmt->bind_param("sssssss", $interest, $fullname, $email, $phone, $contactMethods, $preferredDate, $message);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Inquiry sent successfully']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Database insert failed']);
}

$stmt->close();
$conn->close();
?>
