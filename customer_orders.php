<?php
// ordering/customer_orders.php
require_once 'db.php';

try {
    if(!isset($_GET['email'])) {
        throw new Exception('Email parameter is required');
    }
    
    $email = $conn->real_escape_string($_GET['email']);
    
    // Get all orders for this customer with their items
    $sql = "SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $orders = [];
    
    while ($order = $result->fetch_assoc()) {
        // Get items for this order
        $orderId = $order['id'];
        $itemsSql = "SELECT * FROM order_items WHERE order_id = ?";
        $itemsStmt = $conn->prepare($itemsSql);
        $itemsStmt->bind_param('i', $orderId);
        $itemsStmt->execute();
        $itemsResult = $itemsStmt->get_result();
        
        $items = [];
        while($item = $itemsResult->fetch_assoc()) {
            $items[] = $item;
        }
        $itemsStmt->close();
        
        $order['items'] = $items;
        $orders[] = $order;
    }
    
    $stmt->close();
    
    echo json_encode($orders);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    $conn->close();
}
?>