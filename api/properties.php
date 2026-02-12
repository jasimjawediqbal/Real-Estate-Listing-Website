<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

function respond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function normalizeMainImagePath($rawPath) {
    if (!is_string($rawPath) || $rawPath === '') {
        return 'assets/images/image1.jpg';
    }

    $normalized = str_replace('\\', '/', $rawPath);
    $normalized = preg_replace('/assets\/images\/images(\d+)\.jpg/i', 'assets/images/image$1.jpg', $normalized);
    $normalized = preg_replace('/assets\/images\/house(\d+)\.jpg/i', 'assets/images/image$1.jpg', $normalized);
    $normalized = preg_replace('/^images(\d+)\.jpg$/i', 'assets/images/image$1.jpg', $normalized);
    $normalized = preg_replace('/^house(\d+)\.jpg$/i', 'assets/images/image$1.jpg', $normalized);

    $assetDir = realpath(__DIR__ . '/../assets/images');
    if ($assetDir === false) {
        return $normalized;
    }

    $assetFiles = glob($assetDir . DIRECTORY_SEPARATOR . 'image*.jpg');
    $assetCount = is_array($assetFiles) ? count($assetFiles) : 0;

    if (preg_match('/assets\/images\/image(\d+)\.jpg$/i', $normalized, $matches) && $assetCount > 0) {
        $imageNumber = (int)$matches[1];
        if ($imageNumber > $assetCount || $imageNumber < 1) {
            $wrapped = (($imageNumber - 1) % $assetCount + $assetCount) % $assetCount + 1;
            $normalized = 'assets/images/image' . $wrapped . '.jpg';
        }
    }

    $fullPath = realpath(__DIR__ . '/../' . $normalized);
    if ($fullPath === false || strpos($fullPath, $assetDir) !== 0 || !is_file($fullPath)) {
        return 'assets/images/image1.jpg';
    }

    return $normalized;
}

if (!function_exists('mysqli_connect')) {
    respond(['error' => 'MySQLi extension not available on the server'], 500);
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conn = mysqli_connect("localhost", "root", "", "prime_properties");
    mysqli_set_charset($conn, 'utf8mb4');
} catch (Throwable $e) {
    respond(['error' => 'Database connection failed'], 500);
}

$type = isset($_GET['type']) ? $_GET['type'] : '';
$city = isset($_GET['city']) ? $_GET['city'] : '';
$priceRange = isset($_GET['priceRange']) ? $_GET['priceRange'] : '';
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
if ($page < 1) $page = 1;

$limit = 12;
$offset = ($page - 1) * $limit;

$whereClauses = [];

if (!empty($type)) {
    $safeType = mysqli_real_escape_string($conn, $type);
    $whereClauses[] = "property_type = '$safeType'";
}

if (!empty($city)) {
    $safeCity = mysqli_real_escape_string($conn, $city);
    $whereClauses[] = "city = '$safeCity'";
}

if (!empty($priceRange)) {
    if ($priceRange === '0-10000000') {
        $whereClauses[] = "price >= 0 AND price <= 10000000";
    } elseif ($priceRange === '10000001-20000000') {
        $whereClauses[] = "price >= 10000001 AND price <= 20000000";
    } elseif ($priceRange === '20000001-30000000') {
        $whereClauses[] = "price >= 20000001 AND price <= 30000000";
    } elseif ($priceRange === '30000001+') {
        $whereClauses[] = "price >= 30000001";
    }
}

$whereSql = '';
if (!empty($whereClauses)) {
    $whereSql = ' WHERE ' . implode(' AND ', $whereClauses);
}

// Count total properties
$count_query = "SELECT COUNT(*) as total FROM properties";
$count_query .= $whereSql;
try {
    $count_result = mysqli_query($conn, $count_query);
    $count_row = mysqli_fetch_assoc($count_result);
    $total_rows = isset($count_row['total']) ? (int)$count_row['total'] : 0;
    $total_pages = $total_rows > 0 ? (int)ceil($total_rows / $limit) : 0;

    // Fetch properties
    $query = "SELECT * FROM properties";
    $query .= $whereSql;
    $query .= " LIMIT $limit OFFSET $offset";

    $result = mysqli_query($conn, $query);

    $properties = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $row['main_image'] = normalizeMainImagePath(isset($row['main_image']) ? $row['main_image'] : '');
        $properties[] = $row;
    }
} catch (Throwable $e) {
    respond([
        'error' => 'Database query failed',
        'details' => $e->getMessage()
    ], 500);
}

respond([
    'properties' => $properties,
    'totalPages' => $total_pages
]);
?>
