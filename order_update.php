<?php
// ordering/order_update.php - COMPLETE FIX
require_once 'db.php';

try {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    
    if (!$data || !isset($data['order_id'])) {
        throw new Exception('Order ID is required');
    }
    
    $orderId = intval($data['order_id']);
    $status = $data['status'] ?? 'pending';
    $deliveryPerson = $data['delivery_person'] ?? null;
    
    // Start transaction
    $conn->begin_transaction();
    
    // Update order status and delivery person
    $updateSql = "UPDATE orders SET status = ?, delivery_person = ?, updated_at = NOW() WHERE id = ?";
    $stmt = $conn->prepare($updateSql);
    $stmt->bind_param('ssi', $status, $deliveryPerson, $orderId);
    
    if(!$stmt->execute()) {
        throw new Exception('Failed to update order: ' . $stmt->error);
    }
    $stmt->close();
    
    // ✅ When order is COMPLETED (delivered, picked up, or ready for pickup)
    // Move to SALES table so it appears in:
    // 1. Admin Sales page
    // 2. Customer Purchase History
    if($status === 'delivered' || $status === 'already_picked_up') {
        
        // Get order details
        $orderSql = "SELECT * FROM orders WHERE id = ?";
        $orderStmt = $conn->prepare($orderSql);
        $orderStmt->bind_param('i', $orderId);
        $orderStmt->execute();
        $orderResult = $orderStmt->get_result();
        $order = $orderResult->fetch_assoc();
        $orderStmt->close();
        
        if($order) {
            // Check if already exists in sales
            $checkSalesSql = "SELECT id FROM sales WHERE order_id = ?";
            $checkStmt = $conn->prepare($checkSalesSql);
            $checkStmt->bind_param('i', $orderId);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result();
            
            if($checkResult->num_rows === 0) {
                // ✅ INSERT into sales table
                $salesSql = "INSERT INTO sales 
                            (order_id, customer_name, customer_email, delivery_location, 
                             payment_method, delivery_person, total, sale_date) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
                
                $salesStmt = $conn->prepare($salesSql);
                $salesStmt->bind_param('isssssd', 
                    $orderId,
                    $order['customer_name'],
                    $order['customer_email'],
                    $order['delivery_location'],
                    $order['payment_method'],
                    $order['delivery_person'],
                    $order['total']
                );
                
                if(!$salesStmt->execute()) {
                    throw new Exception('Failed to create sales record: ' . $salesStmt->error);
                }
                $salesStmt->close();
                
                error_log("✅ Order #{$orderId} moved to sales (Status: {$status})");
            }
            $checkStmt->close();
        }
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'status' => 'ok',
        'message' => 'Order updated successfully'
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