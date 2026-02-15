<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$conn = mysqli_connect("localhost", "root", "", "prime_properties");

if (!$conn) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// Extract and sanitize values
$propertyId = isset($data['property_id']) ? intval($data['property_id']) : null; // Allow NULL
$interest = isset($data['interest']) ? mysqli_real_escape_string($conn, $data['interest']) : '';
$fullname = isset($data['fullname']) ? mysqli_real_escape_string($conn, trim($data['fullname'])) : '';
$email = isset($data['email']) ? mysqli_real_escape_string($conn, trim($data['email'])) : '';
$phone = isset($data['phone']) ? mysqli_real_escape_string($conn, trim($data['phone'])) : '';
$contactMethods = isset($data['contactMethods']) && is_array($data['contactMethods']) 
    ? mysqli_real_escape_string($conn, implode(', ', $data['contactMethods'])) 
    : '';
$preferredDate = isset($data['preferredDate']) && !empty($data['preferredDate']) 
    ? mysqli_real_escape_string($conn, $data['preferredDate']) 
    : null;
$message = isset($data['message']) ? mysqli_real_escape_string($conn, trim($data['message'])) : '';

// Validate required fields (property_id is now optional)
if (!$interest || !$fullname || !$email || !$phone || !$message) {
    http_response_code(400);
    echo json_encode(['error' => 'Please fill all required fields']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email format']);
    exit;
}

// Prepare statement - use 'i' for integer which allows NULL
$stmt = $conn->prepare("INSERT INTO inquiries 
    (property_id, interest_type, fullname, email, phone, contact_methods, preferred_datetime, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Database prepare failed: ' . $conn->error]);
    exit;
}

$stmt->bind_param("isssssss", 
    $propertyId,  // Can be NULL now
    $interest, 
    $fullname, 
    $email, 
    $phone, 
    $contactMethods, 
    $preferredDate, 
    $message
);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true, 
        'message' => 'Inquiry sent successfully',
        'inquiry_id' => $stmt->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Database insert failed: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>