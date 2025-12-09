<?php
// ordering/delivery_personnel_get.php
require_once 'db.php';

try {
    $sql = "SELECT * FROM delivery_personnel ORDER BY name ASC";
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    $personnel = [];
    while ($row = $result->fetch_assoc()) {
        $personnel[] = $row;
    }
    
    echo json_encode($personnel);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    $conn->close();
}
?>