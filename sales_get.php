<?php
// ordering/sales_get.php
require_once 'db.php';

try {
    // Get all sales records
    $sql = "SELECT * FROM sales ORDER BY sale_date DESC";
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    $sales = [];
    while ($row = $result->fetch_assoc()) {
        $sales[] = $row;
    }
    
    echo json_encode($sales);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    $conn->close();
}
?>