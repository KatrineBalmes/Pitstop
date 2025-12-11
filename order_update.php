<?php
// ordering/order_update.php
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
    
    // ✅ GET CURRENT STATUS BEFORE UPDATING
    $checkStatusSql = "SELECT status FROM orders WHERE id = ?";
    $checkStmt = $conn->prepare($checkStatusSql);
    $checkStmt->bind_param('i', $orderId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    $currentOrder = $checkResult->fetch_assoc();
    $checkStmt->close();
    
    if (!$currentOrder) {
        throw new Exception('Order not found');
    }
    
    $previousStatus = $currentOrder['status'];
    
    // ✅ RESTORE STOCK AND ORDERS COUNT IF CANCELLING ORDER
    if ($status === 'cancelled' && $previousStatus !== 'cancelled') {
        error_log("🔄 Restoring stock and orders count for cancelled order #{$orderId}");
        
        // Get all items in this order
        $itemsSql = "SELECT product_name, product_size, quantity FROM order_items WHERE order_id = ?";
        $itemsStmt = $conn->prepare($itemsSql);
        $itemsStmt->bind_param('i', $orderId);
        $itemsStmt->execute();
        $itemsResult = $itemsStmt->get_result();
        
        // Check if 'orders' column exists
        $checkColumnSql = "SHOW COLUMNS FROM products LIKE 'orders'";
        $columnExists = $conn->query($checkColumnSql)->num_rows > 0;
        
        // Restore stock and orders count for each item
        while ($item = $itemsResult->fetch_assoc()) {
            if($columnExists) {
                // ✅ RESTORE both stock AND orders count
                $updateStockSql = "UPDATE products SET stock = stock + ?, orders = orders - ? WHERE name = ? AND size = ?";
                $stockStmt = $conn->prepare($updateStockSql);
                $stockStmt->bind_param('iiss', $item['quantity'], $item['quantity'], $item['product_name'], $item['product_size']);
            } else {
                // Only restore stock if orders column doesn't exist
                $updateStockSql = "UPDATE products SET stock = stock + ? WHERE name = ? AND size = ?";
                $stockStmt = $conn->prepare($updateStockSql);
                $stockStmt->bind_param('iss', $item['quantity'], $item['product_name'], $item['product_size']);
            }
            
            if (!$stockStmt->execute()) {
                throw new Exception('Failed to restore stock: ' . $stockStmt->error);
            }
            
            if($columnExists) {
                error_log("✅ Restored {$item['quantity']} units and REMOVED {$item['quantity']} from orders count for {$item['product_name']} ({$item['product_size']})");
            } else {
                error_log("✅ Restored {$item['quantity']} units of {$item['product_name']} ({$item['product_size']})");
            }
            
            $stockStmt->close();
        }
        
        $itemsStmt->close();
    }
    
    // Update order status and delivery person
    $updateSql = "UPDATE orders SET status = ?, delivery_person = ?, updated_at = NOW() WHERE id = ?";
    $stmt = $conn->prepare($updateSql);
    $stmt->bind_param('ssi', $status, $deliveryPerson, $orderId);
    
    if(!$stmt->execute()) {
        throw new Exception('Failed to update order: ' . $stmt->error);
    }
    $stmt->close();
    
    // ✅ When order is COMPLETED (delivered, picked up, or ready for pickup)
    // Move to SALES table - CANCELLED ORDERS WILL NOT BE ADDED TO SALES
    if(($status === 'delivered' || $status === 'already_picked_up' || $status === 'ready_for_pickup') 
       && !in_array($previousStatus, ['delivered', 'already_picked_up', 'ready_for_pickup'])) {
        
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
                // ✅ INSERT into sales table (ONLY for completed orders, NOT cancelled)
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
    
    $message = ($status === 'cancelled' && $previousStatus !== 'cancelled') 
        ? 'Order cancelled, stock and orders count restored successfully' 
        : 'Order updated successfully';
    
    echo json_encode([
        'status' => 'ok',
        'message' => $message,
        'stock_restored' => ($status === 'cancelled' && $previousStatus !== 'cancelled')
    ]);
    
} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollback();
    }
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>
