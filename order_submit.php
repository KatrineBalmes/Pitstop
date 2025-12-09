<?php
// ordering/order_submit.php - FIXED
require_once 'db.php';

try {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    
    if (!$data || empty($data['items'])) {
        throw new Exception('No items in order');
    }
    
    // Start transaction
    $conn->begin_transaction();
    
    // Validate and check stock for all items
    foreach($data['items'] as $item) {
        $name = $conn->real_escape_string($item['name']);
        $size = $conn->real_escape_string($item['size']);
        $qty = intval($item['quantity']);
        
        $checkStmt = $conn->prepare("SELECT stock FROM products WHERE name = ? AND size = ?");
        $checkStmt->bind_param('ss', $name, $size);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        
        if($result->num_rows === 0) {
            throw new Exception("Product not found: $name ($size)");
        }
        
        $row = $result->fetch_assoc();
        if($row['stock'] < $qty) {
            throw new Exception("Insufficient stock for $name ($size). Available: {$row['stock']}, Requested: $qty");
        }
        $checkStmt->close();
    }
    
    // Handle receipt upload if GCash
    $receiptPath = '';
    if(!empty($data['receipt_image'])) {
        $uploadDir = __DIR__ . '/receipts';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        if (preg_match('/^data:image\/(\w+);base64,/', $data['receipt_image'], $matches)) {
            $ext = $matches[1];
            $base64Data = substr($data['receipt_image'], strpos($data['receipt_image'], ',') + 1);
            $decodedImage = base64_decode($base64Data);
            
            if ($decodedImage !== false) {
                $filename = time() . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
                $filePath = $uploadDir . '/' . $filename;
                
                if (file_put_contents($filePath, $decodedImage)) {
                    $receiptPath = 'receipts/' . $filename;
                }
            }
        }
    }
    
    // Insert order
    $insertOrderSql = "INSERT INTO orders (customer_name, customer_email, customer_contact, delivery_type, 
                       recipient_name, delivery_address, delivery_location, notes, payment_method, 
                       receipt_image, subtotal, delivery_fee, total, status) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
    
    $orderStmt = $conn->prepare($insertOrderSql);
    $orderStmt->bind_param('ssssssssssddd', 
        $data['customer_name'],
        $data['customer_email'],
        $data['customer_contact'],
        $data['delivery_type'],
        $data['recipient_name'],
        $data['delivery_address'],
        $data['delivery_location'],
        $data['notes'],
        $data['payment_method'],
        $receiptPath,
        $data['subtotal'],
        $data['delivery_fee'],
        $data['total']
    );
    
    if(!$orderStmt->execute()) {
        throw new Exception('Failed to create order: ' . $orderStmt->error);
    }
    
    $orderId = $conn->insert_id;
    $orderStmt->close();
    
    // Insert order items and update stock + order count
    $itemStmt = $conn->prepare("INSERT INTO order_items (order_id, product_name, product_size, quantity, price) VALUES (?, ?, ?, ?, ?)");
    
    // FIXED: Check if 'orders' column exists before updating
    $checkColumnSql = "SHOW COLUMNS FROM products LIKE 'orders'";
    $columnExists = $conn->query($checkColumnSql)->num_rows > 0;
    
    if($columnExists) {
        // Update both stock and orders count
        $updateStmt = $conn->prepare("UPDATE products SET stock = stock - ?, orders = orders + ? WHERE name = ? AND size = ?");
    } else {
        // Update only stock if orders column doesn't exist
        $updateStmt = $conn->prepare("UPDATE products SET stock = stock - ? WHERE name = ? AND size = ?");
    }
    
    foreach($data['items'] as $item) {
        $name = $item['name'];
        $size = $item['size'];
        $qty = intval($item['quantity']);
        $price = floatval($item['price']);
        
        // Insert order item
        $itemStmt->bind_param('issid', $orderId, $name, $size, $qty, $price);
        if(!$itemStmt->execute()) {
            throw new Exception('Failed to add order item: ' . $itemStmt->error);
        }
        
        // Update stock (and orders if column exists)
        if($columnExists) {
            $updateStmt->bind_param('iiss', $qty, $qty, $name, $size);
        } else {
            $updateStmt->bind_param('iss', $qty, $name, $size);
        }
        
        if(!$updateStmt->execute()) {
            throw new Exception('Failed to update stock: ' . $updateStmt->error);
        }
    }
    
    $itemStmt->close();
    $updateStmt->close();
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'status' => 'ok',
        'message' => 'Order placed successfully',
        'order_id' => $orderId
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage()
    ]);
} finally {
    $conn->close();
}