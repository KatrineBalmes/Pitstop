# 🍽️ Pitstop - Food Ordering & Management System

A complete web-based food ordering and restaurant management system featuring a customer ordering interface, admin dashboard with analytics, and real-time order tracking.
---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [File Structure](#-file-structure)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
---

## 🎯 Overview

Pitstop is a modern food ordering system designed for restaurants and food businesses. It provides a seamless ordering experience for customers and powerful management tools for administrators. The system includes inventory management, real-time order tracking, sales analytics, and automated stock alerts.

**Perfect for:**
- Small to medium-sized restaurants
- Food delivery businesses
- Café and snack shops
- Cloud kitchens

---

## ✨ Features

### 🛒 Customer Ordering Interface

#### Core Features
- **Dynamic Product Catalog**
  - Browse products by category (Snacks, Fries, Ice Cream, Milktea, Frappuccino, Yogurt Series)
  - Real-time stock availability
  - High-quality product images
  - Search functionality across all products
  
- **Interactive Shopping Cart**
  - Add/remove items with quantity controls
  - Real-time price calculations
  - Stock validation before adding items
  - Persistent cart during session
  
- **Hero Carousel**
  - Auto-playing promotional banners
  - Touch-enabled swipe navigation
  - Clickable dots navigation
  - Responsive image display

- **Featured Products**
  - Dynamically displays top-selling items
  - Based on completed order analytics
  - Automatic fallback to random products

#### Ordering Process
- **Multiple Delivery Options**
  - Pick up from store
  - Delivery to 29 supported barangays
  - Option to deliver to someone else
  - Detailed address input for deliveries
  
- **Payment Methods**
  - Cash on Delivery (COD)
  - GCash (with QR code and receipt upload)
  
- **Order Tracking**
  - Real-time status updates
  - Order history with complete details
  - Push notifications for order changes
  - Delivery personnel information

#### User Management
- **Account System**
  - User registration with email verification
  - Secure login system
  - Password recovery via email (PHPMailer)
  - Logout with confirmation prompt
  
- **User Dashboard**
  - Purchase history
  - Active order notifications
  - Profile information display

---

### 👨‍💼 Admin Dashboard

#### Analytics & Reporting
- **Dashboard Statistics**
  - Today's sales (₱)
  - Total orders today
  - Pending orders count
  - Visual data presentation
  
- **Sales Analytics**
  - Top Selling Products (Doughnut Chart)
  - Daily Sales Trends (Line Chart - Last 7 Days)
  - Sales grouped by date
  - Detailed transaction history
  - Export-ready data format

#### Inventory Management
- **Product Management**
  - Add new products with images
  - Update existing product details
  - Adjust stock quantities
  - Delete products
  - Multiple size variants (Small, Regular, Large)
  - Real-time stock tracking
  - Product image upload (max 5MB)
  
- **Stock Alert System**
  - Automatic low stock detection (< 10 items)
  - Color-coded urgency levels:
    - 🔴 **Out of Stock** (0 items) - Critical with pulsing animation
    - 🟠 **Critical Level** (1-4 items) - Urgent restocking needed
    - 🟡 **Low Stock** (5-9 items) - Warning level
  - Search functionality
  - Summary statistics
  - Sortable tables

#### Order Management
- **Order Processing**
  - Grid-based order display
  - Real-time order updates
  - Status management:
    - Pending
    - Processing
    - Out for Delivery (for delivery orders)
    - Ready for Pickup (for pickup orders)
    - Delivered / Already Picked Up
    - Cancelled
  - Assign delivery personnel
  - View customer details
  - Order items breakdown
  - Payment receipt viewing
  - Special notes from customers

#### User Interface
- **Modern Design**
  - Yellow gradient sidebar theme
  - Responsive layout
  - Smooth animations
  - Hover effects
  - Mobile-friendly interface
  - Logout with confirmation

---

## 📸 Screenshots

### Customer Interface
![Pitstop Front Design](Pitstop_Front%20Design.png)

*Customer ordering interface with carousel, featured menu, and shopping cart*

### Product Examples
The system showcases various food items including:
- 🌭 Corn Dog
- 🍟 Barbecue Nachos
- 🍦 Marshmallow Ice Cream
- 🥟 Empanada
- 🍓 Strawberry Frappuccino
- 🍵 Matcha Latte
- 🧊 Ice Cream Varieties

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with:
  - CSS Grid & Flexbox
  - Gradient backgrounds
  - Smooth animations
  - Responsive design
- **JavaScript (ES6+)** - Client-side functionality:
  - Vanilla JavaScript (no frameworks)
  - Async/Await for API calls
  - LocalStorage for user sessions
  - Dynamic DOM manipulation

### Backend
- **PHP 7.4+** - Server-side processing
- **MySQL** - Database management
- **JSON** - API data exchange format
- **PHPMailer** - Email functionality

### Visualization
- **Chart.js** - Interactive charts for admin dashboard

### Architecture
- RESTful API design
- Separation of concerns
- Mobile-first responsive approach
- Client-server architecture

---

## 🚀 Getting Started

### Prerequisites

Before installation, ensure you have:

```
✅ PHP 7.4 or higher
✅ MySQL 5.7 or higher
✅ Apache/Nginx web server
✅ Modern web browser (Chrome, Firefox, Safari, Edge)
✅ Text editor (VS Code, Sublime Text, etc.)
```

---

## 📥 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/KatrineBalmes/Pitstop.git
cd Pitstop
```

### Step 2: Database Setup

1. **Create MySQL Database**
```sql
CREATE DATABASE pitstop;
```

2. **Import Database Schema**

Use the provided `pitstop.sql` file:

```bash
mysql -u root -p pitstop < pitstop.sql
```

Or import via phpMyAdmin:
- Open phpMyAdmin
- Select the `pitstop` database
- Click "Import"
- Choose `pitstop.sql` file
- Click "Go"

### Step 3: Configure Database Connection

Edit `db.php` with your database credentials:

```php
<?php
$servername = "localhost";
$username = "root";          // Your MySQL username
$password = "";              // Your MySQL password
$dbname = "pitstop";         // Database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
```

### Step 4: Configure Web Server

#### For Apache (XAMPP/WAMP)

1. Copy project folder to `htdocs`:
```
C:/xampp/htdocs/Pitstop/
```

2. Update API URL in JavaScript files:

**In `ordering.js` (line 1):**
```javascript
const API_URL = 'http://localhost/Pitstop';
```

**In `admin_interface.js` (line 1):**
```javascript
const API_URL = 'http://localhost/Pitstop';
```

3. Access the application:
- Customer Interface: `http://localhost/Pitstop/index.html`
- Admin Panel: `http://localhost/Pitstop/admin.html`

#### For Nginx

Create a server block:
```nginx
server {
    listen 80;
    server_name localhost;
    root /var/www/Pitstop;
    index index.html;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

### Step 5: Set File Permissions

```bash
# For uploads folder
chmod -R 755 /path/to/Pitstop
chmod -R 777 /path/to/Pitstop/uploads
```

### Step 6: PHPMailer Configuration (Optional)

If using email verification, configure `send_verification.php`:

```php
$mail->Host = 'smtp.gmail.com';
$mail->Username = 'your-email@gmail.com';
$mail->Password = 'your-app-password';
$mail->Port = 587;
```

---

## ⚙️ Configuration

### Delivery Barangays

The system supports delivery to 29 barangays. Edit in `ordering.js`:

```javascript
const barangays = [
    'Alalum', 'Antipolo', 'Balimbing', 'Banaba', 'Bayanan', 
    'Danglayan', 'Del Pilar', 'Gelerang Kawayan', 'Ilat North', 
    'Ilat South', 'Kaingin', 'Laurel', 'Malaking Pook', 
    'Mataas na Lupa', 'Natunuan North', 'Natunuan South', 
    'Padre Castillo', 'Palsahingin', 'Pila', 'Poblacion', 
    'Pook ni Banal', 'Pook ni Kapitan', 'Resplandor', 'Sambat', 
    'San Antonio', 'San Mariano', 'San Mateo', 'Santa Elena', 
    'Santo Niño'
];
```

### Product Categories

Edit categories in `admin_interface.html`:

```html
<select id="productType">
    <option value="Snacks">Snack</option>
    <option value="Fries">Fries</option>
    <option value="Ice Cream">Ice Cream</option>
    <option value="Milktea">Milktea</option>
    <option value="Frapuccino">Frappuccino</option>
    <option value="Yogurt Series">Yogurt Series</option>
    <option value="Others">Others</option>
</select>
```

### Theme Customization

Update colors in CSS files:

**Customer Theme (`ordering.css`):**
```css
:root {
    --red: #d91f2a;        /* Primary brand color */
    --dark: #111;          /* Text color */
    --muted: #6b6b6b;      /* Secondary text */
    --card: #fff;          /* Card background */
}
```

**Admin Theme (`admin_interface.css`):**
```css
:root {
    --yellow: #fcc544;       /* Primary admin color */
    --yellow-dark: #e5b03a;  /* Darker shade */
    --text-dark: #172026;    /* Text color */
}
```

---

## 📖 Usage Guide

### For Customers

#### 1. Account Creation
1. Open `index.html`
2. Click "Sign Up"
3. Fill in registration form:
   - Full Name
   - Email Address
   - Contact Number
   - Password (min 8 characters)
4. Verify email (if PHPMailer configured)
5. Login with credentials

#### 2. Browse Products
- **Home Page**: View featured best-selling items
- **Menu Page**: Browse all products by category
- **Search**: Use search bar to find specific items
- **Product Details**: View name, size, price, and availability

#### 3. Order Process
1. **Add to Cart**
   - Click on products to add
   - Adjust quantities using +/- buttons
   - View real-time price updates

2. **Checkout**
   - Click "Order Now" button
   - Review cart items
   - Click "Checkout"

3. **Fill Order Details**
   - Customer information (auto-filled from account)
   - Choose delivery type:
     - **Pick Up**: Collect from store
     - **Delivery**: Select barangay (₱30 fee)
   - Optional: Deliver to someone else
   - Add special notes

4. **Payment**
   - **Cash on Delivery**: Pay upon receipt
   - **GCash**: Scan QR code, upload receipt

5. **Confirm Order**
   - Review summary
   - Click "Confirm Payment"
   - Receive order confirmation

#### 4. Track Orders
- **Message Notifications**: View active order status
- **Purchase History**: See completed orders
- **Status Updates**:
  - ⏳ Pending - Order received
  - 🔄 Processing - Being prepared
  - 🚚 Out for Delivery - On the way
  - 🛍️ Ready for Pickup - Ready to collect
  - ✅ Delivered/Picked Up - Complete

---

### For Administrators

#### 1. Admin Login
1. Open `admin.html`
2. Enter admin credentials
3. Access admin dashboard

#### 2. Dashboard Overview
- View today's metrics:
  - Total sales (₱)
  - Number of orders
  - Pending orders count
- Analyze charts:
  - Top selling products
  - Sales trends (last 7 days)

#### 3. Product Management

**Add New Product:**
1. Go to "Add Item"
2. Upload product image
3. Enter details:
   - Item name
   - Product type/category
   - Size (Small/Regular/Large)
   - Initial stock quantity
   - Price
4. Click "Add/Update Item"

**Update Existing Product:**
1. Click on product in table
2. Form populates with current data
3. Modify details:
   - To add stock: Enter quantity to add
   - To update price: Change price field
4. Click "Add/Update Item"

**Delete Product:**
1. Select product from table
2. Click "Delete Item"
3. Confirm deletion

#### 4. Stock Management

**Monitor Overall Stocks:**
1. Go to "Overall Stocks"
2. View complete inventory
3. Use search to find products
4. Check stock levels

**Stock Alert System:**
1. Go to "Stock Alert"
2. View low stock items (< 10)
3. Color-coded alerts:
   - 🔴 Out of Stock (0) - Immediate action
   - 🟠 Critical (1-4) - Restock soon
   - 🟡 Low (5-9) - Monitor closely
4. Use to plan restocking

#### 5. Order Processing

**View Orders:**
1. Go to "Order Details"
2. See grid of active orders
3. Each card shows:
   - Order number and date
   - Customer details
   - Delivery information
   - Order items
   - Payment method
   - Total amount

**Update Order Status:**
1. Select order status from dropdown:
   - **For Pickup**: Pending → Processing → Ready for Pickup → Already Picked Up
   - **For Delivery**: Pending → Processing → Out for Delivery → Delivered
2. Assign delivery person (for delivery orders)
3. Click "Update" button

**Handle Special Cases:**
- View customer notes for special instructions
- Cancel orders if needed
- Contact customer using displayed details

#### 6. Sales Reports
1. Go to "Sales" section
2. View completed transactions
3. Sales grouped by date
4. See delivery personnel performance
5. Track payment methods
6. Export data for accounting

---

## 📁 File Structure

```
Pitstop/
│
├── 📄 index.html                    # Landing/Welcome page
├── 📄 ordering.html                 # Customer ordering interface
├── 📄 ordering.css                  # Customer styles
├── 📄 ordering.js                   # Customer JavaScript
│
├── 👤 User Authentication
│   ├── user_login.html              # Customer login
│   ├── signup.html                  # Customer registration
│   ├── signup.css                   # Signup styles
│   ├── forgot_password.html         # Password recovery
│   └── user.css                     # User auth styles
│
├── 👨‍💼 Admin Panel
│   ├── admin.html                   # Admin login
│   ├── admin.js                     # Admin login logic
│   ├── admin_interface.html         # Admin dashboard
│   ├── admin_interface.css          # Admin styles
│   └── admin_interface.js           # Admin functionality
│
├── 🔧 Backend PHP Files
│   ├── db.php                       # Database connection
│   ├── products_get.php             # Get all products
│   ├── products_add.php             # Add/update product
│   ├── products_delete.php          # Delete product
│   ├── orders_get.php               # Get all orders
│   ├── order_submit.php             # Submit new order
│   ├── order_update.php             # Update order status
│   ├── customer_orders.php          # Get customer orders
│   ├── sales_get.php                # Get sales data
│   ├── dashboard_stats.php          # Dashboard statistics
│   ├── delivery_personnel_get.php   # Get delivery staff
│   ├── send_verification.php        # Email verification
│   └── test_db.php                  # Database connection test
│
├── 📦 Database
│   ├── pitstop.sql                  # Database schema
│   └── pitstop.sql.txt              # Schema text backup
│
├── 📂 uploads/                      # Product images directory
│
├── 📧 PHPMailer/                    # Email library
│
├── 🖼️ Images
│   ├── Product Images
│   │   ├── corn dog.jpg
│   │   ├── barbecue_nachos.jpg
│   │   ├── marsmallow_ice cream.jpg
│   │   ├── empanada.jpg
│   │   ├── strawberry_frappucino.jpg
│   │   ├── Matcha_Latte.jpg
│   │   ├── fries.jpg
│   │   └── icecream.jpg
│   │
│   ├── Carousel Images
│   │   ├── display_1.jpg
│   │   ├── display 2.jpg
│   │   └── display_3.jpg
│   │
│   ├── UI Assets
│   │   ├── staff.png                # Admin avatar
│   │   ├── pay.jpg                  # GCash QR code
│   │   ├── background intro.png
│   │   ├── user_login background.png
│   │   ├── topbar_background.png
│   │   └── Pitstop_Front Design.png
│
├── 🎨 Styles
│   ├── style.css                    # Landing page styles
│   └── user.css                     # User interface styles
│
├── 🐛 Debug Tools
│   └── localstorage_debug.html      # LocalStorage viewer
│
└── 📖 README.md                     # This file
```

---

## 🗄️ Database Schema

### Tables Overview

```
📊 Database: pitstop
├── 👤 users                 # Customer accounts
├── 🛡️ admin                 # Admin accounts
├── 📦 products              # Product inventory
├── 🛒 orders                # Customer orders
├── 📝 order_items           # Order details
├── 💰 sales                 # Completed sales
└── 🚚 delivery_personnel    # Delivery staff
```

### Detailed Schema

#### `users` Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contact VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    verification_code VARCHAR(10),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `admin` Table
```sql
CREATE TABLE admin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `products` Table
```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    size VARCHAR(20) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    orders INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_product (name, size)
);
```

#### `orders` Table
```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_contact VARCHAR(20) NOT NULL,
    delivery_type ENUM('pickup', 'delivery') NOT NULL,
    delivery_location VARCHAR(100),
    delivery_address TEXT,
    recipient_name VARCHAR(100),
    payment_method ENUM('cod', 'gcash') NOT NULL,
    receipt_image VARCHAR(255),
    status ENUM('pending', 'processing', 'out_for_delivery', 
                'delivered', 'ready_for_pickup', 
                'already_picked_up', 'cancelled') DEFAULT 'pending',
    delivery_person VARCHAR(100),
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### `order_items` Table
```sql
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    product_size VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

#### `sales` Table
```sql
CREATE TABLE sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    delivery_location VARCHAR(100),
    payment_method VARCHAR(20) NOT NULL,
    order_status VARCHAR(50) NOT NULL,
    delivery_person VARCHAR(100),
    total DECIMAL(10,2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

#### `delivery_personnel` Table
```sql
CREATE TABLE delivery_personnel (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 API Endpoints

### Products API

#### Get All Products
```http
GET /products_get.php
```
**Response:**
```json
[
    {
        "id": 1,
        "name": "Corn Dog",
        "type": "Snacks",
        "size": "Regular",
        "stock": 50,
        "price": "45.00",
        "image": "uploads/corn_dog.jpg",
        "orders": 120
    }
]
```

#### Add/Update Product
```http
POST /products_add.php
Content-Type: application/json
```
**Request Body:**
```json
{
    "name": "Corn Dog",
    "type": "Snacks",
    "size": "Regular",
    "stock": 10,
    "price": 45.00,
    "image": "data:image/jpeg;base64,..."
}
```

#### Delete Product
```http
POST /products_delete.php
Content-Type: application/json
```
**Request Body:**
```json
{
    "name": "Corn Dog",
    "size": "Regular"
}
```

---

### Orders API

#### Get All Orders
```http
GET /orders_get.php
```

#### Submit New Order
```http
POST /order_submit.php
Content-Type: application/json
```
**Request Body:**
```json
{
    "customer_name": "John Doe",
    "customer_email": "john@email.com",
    "customer_contact": "09123456789",
    "delivery_type": "delivery",
    "delivery_location": "Poblacion",
    "delivery_address": "123 Main St",
    "recipient_name": "",
    "payment_method": "cod",
    "receipt_image": "",
    "subtotal": 150.00,
    "delivery_fee": 30.00,
    "total": 180.00,
    "notes": "Extra sauce please",
    "items": [
        {
            "name": "Corn Dog",
            "size": "Regular",
            "quantity": 2,
            "price": 45.00
        }
    ]
}
```

#### Update Order Status
```http
POST /order_update.php
Content-Type: application/json
```
**Request Body:**
```json
{
    "order_id": 123,
    "status": "processing",
    "delivery_person": "Juan Dela Cruz"
}
```

#### Get Customer Orders
```http
GET /customer_orders.php?email=customer@email.com
```

---

### Analytics API

#### Get Dashboard Statistics
```http
GET /dashboard_stats.php
```
**Response:**
```json
{
    "today_sales": "1470.00",
    "today_orders": 15,
    "pending_orders": 3,
    "top_products": [
        {
            "name": "Corn Dog",
            "total_sold": 50
        }
    ],
    "daily_sales": [
        {
            "date": "2025-12-02",
            "total": "1470.00"
        }
    ]
}
```

#### Get Sales Data
```http
GET /sales_get.php
```

---

### Delivery API

#### Get Delivery Personnel
```http
GET /delivery_personnel_get.php
```
**Response:**
```json
[
    {
        "id": 1,
        "name": "Juan Dela Cruz",
        "contact": "09123456789",
        "status": "active"
    }
]
```

---

### Coding Standards

#### PHP
- Follow PSR-12 coding standards
- Use meaningful variable names
- Add comments for complex logic
- Use prepared statements for database queries

#### JavaScript
- Use ES6+ features (const, let, arrow functions)
- Use async/await for asynchronous operations
- Add JSDoc comments for functions
- Follow camelCase naming convention

#### HTML/CSS
- Use semantic HTML5 elements
- Follow BEM methodology for CSS classes
- Ensure responsive design
- Add alt text to images

## 🐛 Known Issues

1. **Stock Updates**: Require page refresh in some cases
2. **Image Upload**: Limited to 5MB file size
3. **Session Management**: Uses LocalStorage (not secure for production)
4. **Email Verification**: Requires PHPMailer configuration
5. **GCash Payment**: Manual verification required
6. **Browser Compatibility**: Optimized for modern browsers
---

## 🙏 Acknowledgments

- **Chart.js** - For beautiful data visualizations
- **PHPMailer** - For email functionality
- **Google Fonts** - Inter font family
- **Community Contributors** - For suggestions and improvements
---

### Frequently Asked Questions

**Q: How do I reset the admin password?**
A: Directly update the database `admin` table with a new hashed password.

**Q: Can I use this for commercial purposes?**
A: Yes, under the MIT License terms.

**Q: How do I add more barangays?**
A: Edit the `barangays` array in `ordering.js`.

**Q: Where are product images stored?**
A: In the `uploads/` directory. Ensure proper permissions.

**Q: How do I backup my data?**
A: Export the MySQL database using phpMyAdmin or mysqldump.

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: "Connection failed" error
**Solution:**
1. Check database credentials in `db.php`
2. Ensure MySQL service is running
3. Verify database exists

#### Issue: Images not displaying
**Solution:**
1. Check `uploads/` folder permissions (777)
2. Verify image paths in database
3. Check API_URL in JavaScript files

#### Issue: Orders not submitting
**Solution:**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify API endpoints are accessible
4. Check database connection

#### Issue: Charts not loading
**Solution:**
1. Verify Chart.js CDN is accessible
2. Check browser console for errors
3. Ensure `dashboard_stats.php` returns valid data

---

## 📈 Performance Tips

1. **Optimize Images**: Compress product images before upload
2. **Database Indexing**: Add indexes to frequently queried columns
3. **Caching**: Implement browser caching for static assets
4. **CDN**: Use CDN for Chart.js and other libraries
5. **Minification**: Minify CSS and JavaScript for production

---

## 📸 Additional Screenshots

### Customer Interface Flow
```
Landing Page → Registration → Login → Browse Menu → Add to Cart → Checkout → Track Order
```

### Admin Dashboard Flow
```
Admin Login → Dashboard → Manage Products → Process Orders → View Analytics
```

---
