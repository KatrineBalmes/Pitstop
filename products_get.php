<?php
// ordering/products_get.php - SAFE VERSION
require_once 'db.php';

try {
    // Check if 'orders' column exists in products table
    $checkColumnSql = "SHOW COLUMNS FROM products LIKE 'orders'";
    $columnExists = $conn->query($checkColumnSql)->num_rows > 0;
    
    if($columnExists) {
        // If column exists, use it directly
        $sql = "SELECT 
                    p.id, 
                    p.name, 
                    p.type, 
                    p.size, 
                    p.stock, 
                    p.price, 
                    p.image, 
                    p.created_at,
                    p.orders
                FROM products p
                ORDER BY p.type ASC, p.name ASC, p.size ASC";
    } else {
        // If column doesn't exist, calculate orders from order_items
        $sql = "SELECT 
                    p.id, 
                    p.name, 
                    p.type, 
                    p.size, 
                    p.stock, 
                    p.price, 
                    p.image, 
                    p.created_at,
                    COALESCE(SUM(oi.quantity), 0) as orders
                FROM products p
                LEFT JOIN order_items oi ON p.name = oi.product_name AND p.size = oi.product_size
                GROUP BY p.id, p.name, p.type, p.size, p.stock, p.price, p.image, p.created_at
                ORDER BY p.type ASC, p.name ASC, p.size ASC";
    }
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    $products = [];
    while ($row = $result->fetch_assoc()) {
        // Ensure orders is always set
        if(!isset($row['orders'])) {
            $row['orders'] = 0;
        }
        $products[] = $row;
    }
    
    echo json_encode($products);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    $conn->close();
}