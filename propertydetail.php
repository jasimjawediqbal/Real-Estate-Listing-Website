<?php
include '../config/db.php'; // or your DB connection file

if (!isset($_GET['id'])) {
    echo json_encode(["error" => "No property ID provided"]);
    exit;
}

$id = intval($_GET['id']);

$sql = "SELECT * FROM properties WHERE id = $id";
$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) == 0) {
    echo json_encode(["error" => "Property not found"]);
    exit;
}

$property = mysqli_fetch_assoc($result);

echo json_encode(["property" => $property]);
?>
