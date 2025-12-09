<?php
// ordering/products_delete.php
require_once 'db.php';

try {
    // Get JSON input
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    
    // Validate input
    if (!$data || empty($data['name']) || empty($data['size'])) {
        throw new Exception('Product name and size are required');
    }
    
    $name = $conn->real_escape_string(trim($data['name']));
    $size = $conn->real_escape_string(trim($data['size']));
    
    // Get product image before deleting
    $selectSql = "SELECT image FROM products WHERE name = ? AND size = ? LIMIT 1";
    $selectStmt = $conn->prepare($selectSql);
    $selectStmt->bind_param('ss', $name, $size);
    $selectStmt->execute();
    $result = $selectStmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Product not found');
    }
    
    $row = $result->fetch_assoc();
    $imagePath = $row['image'];
    $selectStmt->close();
    
    // Delete the product from database
    $deleteSql = "DELETE FROM products WHERE name = ? AND size = ?";
    $deleteStmt = $conn->prepare($deleteSql);
    $deleteStmt->bind_param('ss', $name, $size);
    
    if (!$deleteStmt->execute()) {
        throw new Exception('Failed to delete product: ' . $deleteStmt->error);
    }
    
    $deleteStmt->close();
    
    // Delete image file if it exists in uploads folder
    if (!empty($imagePath) && strpos($imagePath, 'uploads/') === 0) {
        $fullPath = __DIR__ . '/' . $imagePath;
        if (file_exists($fullPath)) {
            @unlink($fullPath);
        }
    }
    
    echo json_encode([
        'status' => 'deleted',
        'message' => 'Product deleted successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage()
    ]);
} finally {
    $conn->close();
}