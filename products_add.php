<?php
// ordering/products_add.php - FIXED STOCK UPDATE LOGIC
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
    $type = $conn->real_escape_string(trim($data['type'] ?? 'Snacks'));
    $size = $conn->real_escape_string(trim($data['size']));
    $stockInput = intval($data['stock'] ?? 0);
    $price = floatval($data['price'] ?? 0);
    $imageField = $data['image'] ?? '';
    $isUpdate = $data['is_update'] ?? false; // Flag to determine if updating existing product
    
    // Handle image upload
    $imagePath = '';
    
    if (!empty($imageField)) {
        // Check if it's a base64 data URI
        if (strpos($imageField, 'data:image') === 0) {
            // Create uploads directory if it doesn't exist
            $uploadDir = __DIR__ . '/uploads';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            // Extract image type and base64 data
            if (preg_match('/^data:image\/(\w+);base64,/', $imageField, $matches)) {
                $ext = $matches[1];
                $base64Data = substr($imageField, strpos($imageField, ',') + 1);
                $decodedImage = base64_decode($base64Data);
                
                if ($decodedImage !== false) {
                    // Generate unique filename
                    $filename = time() . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
                    $filePath = $uploadDir . '/' . $filename;
                    
                    // Save file
                    if (file_put_contents($filePath, $decodedImage)) {
                        $imagePath = 'uploads/' . $filename;
                    }
                }
            }
        } else {
            // Use existing image path
            $imagePath = $imageField;
        }
    }
    
    // Check if product already exists (by name and size)
    $checkSql = "SELECT id, stock, image FROM products WHERE name = ? AND size = ? LIMIT 1";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param('ss', $name, $size);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        // UPDATE existing product
        $row = $checkResult->fetch_assoc();
        $existingId = $row['id'];
        $currentStock = intval($row['stock']);
        $oldImage = $row['image'];
        
        // FIXED: Add to existing stock instead of replacing
        $finalStock = $currentStock + $stockInput;
        
        // If new image uploaded and old image exists, delete old image
        if (!empty($imagePath) && !empty($oldImage) && $imagePath !== $oldImage) {
            $oldImagePath = __DIR__ . '/' . $oldImage;
            if (file_exists($oldImagePath) && strpos($oldImage, 'uploads/') === 0) {
                @unlink($oldImagePath);
            }
        }
        
        // Use old image if no new image provided
        if (empty($imagePath)) {
            $imagePath = $oldImage;
        }
        
        $updateSql = "UPDATE products SET type = ?, stock = ?, price = ?, image = ? WHERE id = ?";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bind_param('sidsi', $type, $finalStock, $price, $imagePath, $existingId);
        
        if (!$updateStmt->execute()) {
            throw new Exception('Failed to update product: ' . $updateStmt->error);
        }
        
        $updateStmt->close();
        $message = "Product updated! Added {$stockInput} stocks. New total: {$finalStock}";
        
    } else {
        // INSERT new product
        $insertSql = "INSERT INTO products (name, type, size, stock, price, image) VALUES (?, ?, ?, ?, ?, ?)";
        $insertStmt = $conn->prepare($insertSql);
        $insertStmt->bind_param('sssids', $name, $type, $size, $stockInput, $price, $imagePath);
        
        if (!$insertStmt->execute()) {
            throw new Exception('Failed to insert product: ' . $insertStmt->error);
        }
        
        $insertStmt->close();
        $message = 'Product added successfully';
    }
    
    $checkStmt->close();
    
    echo json_encode([
        'status' => 'ok',
        'message' => $message
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