<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

const MAX_IMAGE_SIZE = 5242880; // 5MB
const MAX_ADDITIONAL_IMAGES = 6;

function respond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function clean($value) {
    return trim((string)$value);
}

function addError(&$errors, $key, $message) {
    $errors[$key] = $message;
}

function cleanupUploadedFiles($relativePaths) {
    foreach ($relativePaths as $relativePath) {
        $fullPath = realpath(__DIR__ . '/..') . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativePath);
        if ($fullPath && is_file($fullPath)) {
            @unlink($fullPath);
        }
    }
}

function saveUploadedImage($file, $fieldKey, $label, $uploadDir, &$errors, &$savedFiles, $required = false) {
    if (!is_array($file) || !isset($file['error'])) {
        if ($required) {
            addError($errors, $fieldKey, $label . ' is required.');
        }
        return null;
    }

    if ($file['error'] === UPLOAD_ERR_NO_FILE) {
        if ($required) {
            addError($errors, $fieldKey, $label . ' is required.');
        }
        return null;
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        addError($errors, $fieldKey, $label . ' upload failed.');
        return null;
    }

    if (!isset($file['size']) || $file['size'] <= 0 || $file['size'] > MAX_IMAGE_SIZE) {
        addError($errors, $fieldKey, $label . ' must be 5MB or smaller.');
        return null;
    }

    if (!is_uploaded_file($file['tmp_name'])) {
        addError($errors, $fieldKey, $label . ' file source is invalid.');
        return null;
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = $finfo ? finfo_file($finfo, $file['tmp_name']) : '';
    if ($finfo) {
        finfo_close($finfo);
    }

    $allowedMimes = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp'
    ];

    if (!isset($allowedMimes[$mimeType])) {
        addError($errors, $fieldKey, $label . ' must be JPG, PNG, or WEBP.');
        return null;
    }

    $baseName = pathinfo((string)$file['name'], PATHINFO_FILENAME);
    $safeBaseName = preg_replace('/[^a-zA-Z0-9_-]/', '', $baseName);
    if (!$safeBaseName) {
        $safeBaseName = 'property-image';
    }

    try {
        $unique = bin2hex(random_bytes(6));
    } catch (Throwable $e) {
        $unique = uniqid('', true);
        $unique = str_replace('.', '', $unique);
    }

    $fileName = strtolower($safeBaseName . '-' . $unique . '.' . $allowedMimes[$mimeType]);
    $destination = $uploadDir . DIRECTORY_SEPARATOR . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        addError($errors, $fieldKey, $label . ' could not be saved.');
        return null;
    }

    $relativePath = 'assets/images/uploads/' . $fileName;
    $savedFiles[] = $relativePath;

    return $relativePath;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method not allowed'], 405);
}

$allowedCities = ['Lahore', 'Islamabad', 'Rawalpindi'];
$allowedTypes = ['House', 'Apartment', 'Commercial'];

$errors = [];

$title = clean($_POST['title'] ?? '');
if (strlen($title) < 5 || strlen($title) > 150) {
    addError($errors, 'title', 'Title must be between 5 and 150 characters.');
}

$description = clean($_POST['description'] ?? '');
if (strlen($description) < 20 || strlen($description) > 2000) {
    addError($errors, 'description', 'Description must be between 20 and 2000 characters.');
}

$priceRaw = clean($_POST['price'] ?? '');
$price = is_numeric($priceRaw) ? (float)$priceRaw : 0;
if ($price <= 0) {
    addError($errors, 'price', 'Price must be greater than 0.');
}

$location = clean($_POST['location'] ?? '');
if (strlen($location) < 3 || strlen($location) > 150) {
    addError($errors, 'location', 'Location must be between 3 and 150 characters.');
}

$city = clean($_POST['city'] ?? '');
if (!in_array($city, $allowedCities, true)) {
    addError($errors, 'city', 'Please select a valid city.');
}

$propertyType = clean($_POST['property_type'] ?? '');
if (!in_array($propertyType, $allowedTypes, true)) {
    addError($errors, 'property_type', 'Please select a valid property type.');
}

$bedroomsRaw = clean($_POST['bedrooms'] ?? '');
$bedrooms = filter_var($bedroomsRaw, FILTER_VALIDATE_INT);
if ($bedrooms === false || $bedrooms < 0 || $bedrooms > 20) {
    addError($errors, 'bedrooms', 'Bedrooms must be an integer between 0 and 20.');
}

$bathroomsRaw = clean($_POST['bathrooms'] ?? '');
$bathrooms = filter_var($bathroomsRaw, FILTER_VALIDATE_INT);
if ($bathrooms === false || $bathrooms < 0 || $bathrooms > 20) {
    addError($errors, 'bathrooms', 'Bathrooms must be an integer between 0 and 20.');
}

$areaRaw = clean($_POST['area_marla'] ?? '');
$areaMarla = is_numeric($areaRaw) ? (float)$areaRaw : 0;
if ($areaMarla <= 0 || $areaMarla > 10000) {
    addError($errors, 'area_marla', 'Area must be a valid number greater than 0.');
}

$sellerName = clean($_POST['seller_name'] ?? '');
if (strlen($sellerName) < 2 || strlen($sellerName) > 100) {
    addError($errors, 'seller_name', 'Seller name must be between 2 and 100 characters.');
}

$sellerEmail = clean($_POST['seller_email'] ?? '');
if (!filter_var($sellerEmail, FILTER_VALIDATE_EMAIL) || strlen($sellerEmail) > 100) {
    addError($errors, 'seller_email', 'Please enter a valid seller email.');
}

$sellerPhone = clean($_POST['seller_phone'] ?? '');
if (!preg_match('/^[0-9+\-\s]{7,20}$/', $sellerPhone)) {
    addError($errors, 'seller_phone', 'Phone must be 7-20 chars with digits, +, -, or spaces.');
}

$sellerDescription = clean($_POST['seller_description'] ?? '');
if (strlen($sellerDescription) > 500) {
    addError($errors, 'seller_description', 'Seller description can be up to 500 characters.');
}

if (!isset($_FILES['main_image']) || !is_array($_FILES['main_image']) || ($_FILES['main_image']['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
    addError($errors, 'main_image', 'Main image is required.');
}

$additionalImageCount = 0;
if (isset($_FILES['additional_images']) && isset($_FILES['additional_images']['name']) && is_array($_FILES['additional_images']['name'])) {
    foreach ($_FILES['additional_images']['name'] as $name) {
        if (trim((string)$name) !== '') {
            $additionalImageCount++;
        }
    }
}
if ($additionalImageCount > MAX_ADDITIONAL_IMAGES) {
    addError($errors, 'additional_images', 'You can upload up to ' . MAX_ADDITIONAL_IMAGES . ' additional images.');
}

if (!empty($errors)) {
    respond([
        'error' => 'Validation failed',
        'errors' => $errors
    ], 422);
}

if (!function_exists('mysqli_connect')) {
    respond(['error' => 'MySQLi extension not available on the server'], 500);
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conn = mysqli_connect('localhost', 'root', '', 'prime_properties');
    mysqli_set_charset($conn, 'utf8mb4');
} catch (Throwable $e) {
    respond(['error' => 'Database connection failed'], 500);
}

$uploadDir = realpath(__DIR__ . '/../assets/images');
if ($uploadDir === false) {
    respond(['error' => 'Image directory is missing'], 500);
}
$uploadDir .= DIRECTORY_SEPARATOR . 'uploads';

if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
    respond(['error' => 'Could not create upload directory'], 500);
}

$savedFiles = [];
$mainImagePath = saveUploadedImage($_FILES['main_image'], 'main_image', 'Main image', $uploadDir, $errors, $savedFiles, true);

$additionalImagePaths = [];
if (isset($_FILES['additional_images']) && isset($_FILES['additional_images']['name']) && is_array($_FILES['additional_images']['name'])) {
    $totalFiles = count($_FILES['additional_images']['name']);
    for ($i = 0; $i < $totalFiles; $i++) {
        $singleFile = [
            'name' => $_FILES['additional_images']['name'][$i] ?? '',
            'type' => $_FILES['additional_images']['type'][$i] ?? '',
            'tmp_name' => $_FILES['additional_images']['tmp_name'][$i] ?? '',
            'error' => $_FILES['additional_images']['error'][$i] ?? UPLOAD_ERR_NO_FILE,
            'size' => $_FILES['additional_images']['size'][$i] ?? 0
        ];

        if (($singleFile['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            continue;
        }

        $saved = saveUploadedImage($singleFile, 'additional_images', 'Additional image', $uploadDir, $errors, $savedFiles, false);
        if ($saved) {
            $additionalImagePaths[] = $saved;
        }
    }
}

if (!empty($errors)) {
    cleanupUploadedFiles($savedFiles);
    respond([
        'error' => 'Validation failed',
        'errors' => $errors
    ], 422);
}

$additionalImagesCsv = implode(',', $additionalImagePaths);

try {
    $sql = 'INSERT INTO properties (
                title,
                description,
                price,
                location,
                city,
                property_type,
                bedrooms,
                bathrooms,
                area_marla,
                main_image,
                additional_images,
                seller_name,
                seller_email,
                seller_phone,
                seller_description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param(
        $stmt,
        'ssdsssiidssssss',
        $title,
        $description,
        $price,
        $location,
        $city,
        $propertyType,
        $bedrooms,
        $bathrooms,
        $areaMarla,
        $mainImagePath,
        $additionalImagesCsv,
        $sellerName,
        $sellerEmail,
        $sellerPhone,
        $sellerDescription
    );

    mysqli_stmt_execute($stmt);
    $newPropertyId = mysqli_insert_id($conn);
    mysqli_stmt_close($stmt);
    mysqli_close($conn);
} catch (Throwable $e) {
    cleanupUploadedFiles($savedFiles);
    respond(['error' => 'Failed to save property in database'], 500);
}

respond([
    'success' => true,
    'message' => 'Property added successfully.',
    'id' => $newPropertyId
], 201);
?>
