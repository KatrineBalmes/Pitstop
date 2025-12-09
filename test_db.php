<?php
include 'db.php';

$sql = "SELECT * FROM products LIMIT 1";
$result = $conn->query($sql);

if (!$result) {
    echo "Query error: " . $conn->error;
} else {
    echo "Connection OK! Table exists and has data.";
}
?>
