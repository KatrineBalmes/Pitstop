<?php
// ordering/dashboard_stats.php - FIXED
require_once 'db.php';

try {
    $stats = [];
    
    // Today's sales from sales table
    $todaySql = "SELECT COALESCE(SUM(total), 0) as today_sales 
                 FROM sales 
                 WHERE DATE(sale_date) = CURDATE()";
    $result = $conn->query($todaySql);
    $stats['today_sales'] = $result->fetch_assoc()['today_sales'];
    
    // Today's order count
    $todayOrdersSql = "SELECT COUNT(*) as today_orders 
                       FROM orders 
                       WHERE DATE(created_at) = CURDATE()";
    $result = $conn->query($todayOrdersSql);
    $stats['today_orders'] = $result->fetch_assoc()['today_orders'];
    
    // Pending orders (not completed)
    $pendingSql = "SELECT COUNT(*) as pending_orders 
                   FROM orders 
                   WHERE status NOT IN ('delivered', 'already_picked_up', 'ready_for_pickup', 'cancelled')";
    $result = $conn->query($pendingSql);
    $stats['pending_orders'] = $result->fetch_assoc()['pending_orders'];
    
    // Top selling products - FIXED to get from completed orders only
    $topProductsSql = "SELECT 
                        oi.product_name as name, 
                        oi.product_size as size,
                        SUM(oi.quantity) as total_sold 
                       FROM order_items oi 
                       JOIN orders o ON oi.order_id = o.id 
                       WHERE o.status IN ('delivered', 'already_picked_up')
                       GROUP BY oi.product_name, oi.product_size
                       ORDER BY total_sold DESC 
                       LIMIT 5";
    $result = $conn->query($topProductsSql);
    
    $topProducts = [];
    if ($result) {
        while($row = $result->fetch_assoc()) {
            // Combine name and size for display
            $row['name'] = $row['name'] . ' (' . $row['size'] . ')';
            $topProducts[] = $row;
        }
    }
    $stats['top_products'] = $topProducts;
    
    // Daily sales for last 7 days
    $dailySalesSql = "SELECT 
                        DATE(sale_date) as date,
                        SUM(total) as total
                      FROM sales
                      WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                      GROUP BY DATE(sale_date)
                      ORDER BY date ASC";
    $result = $conn->query($dailySalesSql);
    
    $dailySales = [];
    if ($result) {
        while($row = $result->fetch_assoc()) {
            $dailySales[] = $row;
        }
    }
    $stats['daily_sales'] = $dailySales;
    
    // Debug log
    error_log("Dashboard stats: " . json_encode($stats));
    
    echo json_encode($stats);
    
} catch (Exception $e) {
    http_response_code(500);
    error_log("Dashboard error: " . $e->getMessage());
    echo json_encode([
        'error' => $e->getMessage(),
        'today_sales' => 0,
        'today_orders' => 0,
        'pending_orders' => 0,
        'top_products' => [],
        'daily_sales' => []
    ]);
} finally {
    $conn->close();
}