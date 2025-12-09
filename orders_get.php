<?php
// ordering/orders_get.php - FIXED
require_once 'db.php';

try {
    // Get all orders
    $sql = "SELECT * FROM orders ORDER BY created_at DESC";
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }

    $orders = [];

    while ($order = $result->fetch_assoc()) {
        $orderId = $order['id'];

        // FIXED: Changed 'size' to 'product_size' to match order_items table
        $itemsSql = "SELECT product_name, product_size, quantity, price FROM order_items WHERE order_id = ?";
        $stmt = $conn->prepare($itemsSql);
        $stmt->bind_param('i', $orderId);
        $stmt->execute();
        $itemsResult = $stmt->get_result();

        $items = [];
        while ($item = $itemsResult->fetch_assoc()) {
            $items[] = $item;
        }
        $stmt->close();

        // Ensure all expected fields exist
        $order['items'] = $items;
        $order['delivery_type'] = $order['delivery_type'] ?? 'delivery';
        $order['delivery_person'] = $order['delivery_person'] ?? null;
        $order['notes'] = $order['notes'] ?? '';
        $order['recipient_name'] = $order['recipient_name'] ?? '';
        $order['delivery_address'] = $order['delivery_address'] ?? '';
        $order['customer_contact'] = $order['customer_contact'] ?? '';
        $order['delivery_location'] = $order['delivery_location'] ?? '';
        $order['customer_name'] = $order['customer_name'] ?? '';
        $order['customer_email'] = $order['customer_email'] ?? '';
        $order['payment_method'] = $order['payment_method'] ?? 'cod';
        $order['receipt_image'] = $order['receipt_image'] ?? '';
        $order['total'] = $order['total'] ?? 0;
        $order['status'] = $order['status'] ?? 'pending';

        $orders[] = $order;
    }

    header('Content-Type: application/json');
    echo json_encode($orders);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    $conn->close();
}