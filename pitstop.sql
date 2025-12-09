-- Create database
CREATE DATABASE IF NOT EXISTS pitstop;
USE pitstop;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    size VARCHAR(50) NOT NULL,
    stock INT DEFAULT 0,
    price DECIMAL(10, 2) DEFAULT 0.00,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_product (name, size)
);

-- Create orders table with updated_at field
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_contact VARCHAR(20) NOT NULL,
    delivery_type ENUM('pickup', 'delivery') NOT NULL,
    recipient_name VARCHAR(255),
    delivery_address VARCHAR(500),
    delivery_location VARCHAR(100),
    notes TEXT,
    payment_method ENUM('cod', 'gcash') NOT NULL,
    receipt_image VARCHAR(255),
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'out_for_delivery', 'delivered', 'ready_for_pickup', 'cancelled') DEFAULT 'pending',
    delivery_person VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_size VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    delivery_location VARCHAR(100),
    payment_method ENUM('cod', 'gcash') NOT NULL,
    delivery_person VARCHAR(255),
    total DECIMAL(10, 2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Create delivery_personnel table
CREATE TABLE IF NOT EXISTS delivery_personnel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    contact VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample delivery personnel
INSERT INTO delivery_personnel (name, contact) VALUES
('John Doe', '09123456789'),
('Jane Smith', '09234567890'),
('Chester Dela Cruz', 09213219334'),
('Keil Valida', 09292831232),
ON DUPLICATE KEY UPDATE contact=VALUES(contact);

-- Insert sample products
INSERT INTO products (name, type, size, stock, price, image) VALUES
('Barbecue Nachos', 'Snacks', 'Regular', 50, 59.00, 'barbecue_nachos.jpg'),
('Strawberry Frappucino', 'Frapuccino', 'Regular', 30, 69.00, 'strawberry_frappucino.jpg'),
('Marshmallow Ice Cream', 'Ice Cream', 'Regular', 40, 35.00, 'marsmallow_ice cream.jpg'),
('Corn Dog', 'Snacks', 'Regular', 25, 40.00, 'corn dog.jpg'),
('Matcha Latte', 'Milktea', 'Regular', 35, 65.00, 'Matcha_Latte.jpg')
ON DUPLICATE KEY UPDATE stock=VALUES(stock);

-- Add updated_at to orders table if not exists
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing orders to have updated_at
UPDATE orders SET updated_at = created_at WHERE updated_at IS NULL;

-- Ensure sales table has sale_date
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;