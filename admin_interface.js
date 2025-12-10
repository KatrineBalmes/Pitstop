// admin_interface.js - UPDATED WITH STOCK ALERT AND NO LOCATION CHART
const API_URL = 'http://localhost/ordering';

/* ---------------- FIXED NAVIGATION ---------------- */
const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
const panels = Array.from(document.querySelectorAll('.panel'));

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        console.log('Navigation clicked:', btn.dataset.target);
        
        navButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        const target = btn.dataset.target;
        panels.forEach(p => p.style.display = (p.id === target ? 'block' : 'none'));
        
        // Load content based on target
        if(target === 'dashboard') {
            console.log('Loading dashboard...');
            loadDashboard();
        }
        if(target === 'addItem' || target === 'overallStocks') {
            console.log('Loading products...');
            loadProducts();
        }
        if(target === 'stockAlert') {
            console.log('Loading stock alert...');
            loadStockAlert(); // MAKE SURE THIS IS CALLED
        }
        if(target === 'orderDetails') {
            console.log('Loading orders...');
            loadOrders();
        }
        if(target === 'sales') {
            console.log('Loading sales...');
            loadSales();
        }
    });
});

/* ---------------- LOAD STOCK ALERT (WITH DEBUG) ---------------- */
async function loadStockAlert() {
    console.log('🔍 === STOCK ALERT FUNCTION STARTED ===');
    
    try {
        console.log('📡 Fetching from:', `${API_URL}/products_get.php`);
        const res = await fetch(`${API_URL}/products_get.php`);
        console.log('📡 Response status:', res.status);
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const products = await res.json();
        console.log('📦 All products received:', products);
        console.log('📊 Total products:', products.length);
        
        if (!Array.isArray(products)) {
            console.error('❌ Expected array but got:', products);
            return;
        }

        // Log each product's stock
        console.log('=== CHECKING STOCK LEVELS ===');
        products.forEach(p => {
            const stockInt = parseInt(p.stock);
            console.log(`${p.name} (${p.size}): stock="${p.stock}" parsed=${stockInt} isLow=${stockInt < 10}`);
        });

        // Filter products with stock less than 10
        const lowStockProducts = products.filter(p => {
            const stockValue = parseInt(p.stock);
            return stockValue < 10;
        });
        
        console.log('⚠️ Low stock products found:', lowStockProducts.length);
        console.log('Low stock items:', lowStockProducts);
        
        // Sort by stock level (lowest first)
        lowStockProducts.sort((a, b) => parseInt(a.stock) - parseInt(b.stock));
        
        const tbody = document.querySelector('#stockAlertTable tbody');
        
        if (!tbody) {
            console.error('❌ Table tbody not found! Check HTML structure.');
            alert('Error: Stock Alert table not found in HTML!');
            return;
        }
        
        console.log('✅ Table tbody found');
        tbody.innerHTML = '';
        
        if (lowStockProducts.length === 0) {
            console.log('✅ No low stock items - showing success message');
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;padding:40px;">
                        <div style="font-size:48px;margin-bottom:10px;">✓</div>
                        <div style="color:#28a745;font-weight:700;font-size:18px;">All Products Have Sufficient Stock!</div>
                        <div style="color:#666;margin-top:8px;font-size:14px;">No items below 10 stock level</div>
                        <div style="color:#999;margin-top:12px;font-size:13px;">Total products checked: ${products.length}</div>
                    </td>
                </tr>
            `;
        } else {
            console.log('⚠️ Displaying', lowStockProducts.length, 'low stock items...');
            
            // Add summary header
            const summaryRow = document.createElement('tr');
            summaryRow.style.background = '#fff3cd';
            summaryRow.style.fontWeight = '700';
            summaryRow.innerHTML = `
                <td colspan="6" style="padding:15px;text-align:center;color:#856404;border-bottom:2px solid #ffc107;">
                    ⚠️ ${lowStockProducts.length} Product${lowStockProducts.length > 1 ? 's' : ''} Need Restocking
                </td>
            `;
            tbody.appendChild(summaryRow);
            
            // Add each low stock item
            lowStockProducts.forEach((item, index) => {
                console.log(`Adding row ${index + 1}:`, item.name, 'stock:', item.stock);
                
                const tr = document.createElement('tr');
                const stockLevel = parseInt(item.stock);
                
                let stockColor, urgencyIcon, rowBackground;
                if (stockLevel === 0) {
                    stockColor = '#dc3545';
                    urgencyIcon = '🔴';
                    rowBackground = 'rgba(220, 53, 69, 0.08)';
                } else if (stockLevel < 5) {
                    stockColor = '#ff5a5a';
                    urgencyIcon = '🟠';
                    rowBackground = 'rgba(255, 90, 90, 0.08)';
                } else {
                    stockColor = '#ff9800';
                    urgencyIcon = '🟡';
                    rowBackground = 'rgba(255, 152, 0, 0.06)';
                }
                
                tr.style.background = rowBackground;
                
                tr.innerHTML = `
                    <td>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="font-size:18px;">${urgencyIcon}</span>
                            <strong>${item.name}</strong>
                        </div>
                    </td>
                    <td>${item.type}</td>
                    <td>${item.size}</td>
                    <td>
                        <span style="
                            color:${stockColor};
                            font-weight:700;
                            font-size:16px;
                            background:white;
                            padding:4px 12px;
                            border-radius:6px;
                            border:2px solid ${stockColor};
                            display:inline-block;
                        ">
                            ${item.stock}
                        </span>
                        ${stockLevel === 0 ? '<div style="color:#dc3545;font-size:11px;font-weight:600;margin-top:4px;">OUT OF STOCK</div>' : ''}
                        ${stockLevel > 0 && stockLevel < 5 ? '<div style="color:#ff5a5a;font-size:11px;font-weight:600;margin-top:4px;">CRITICAL</div>' : ''}
                    </td>
                    <td>₱${parseFloat(item.price).toFixed(2)}</td>
                    <td>${item.orders || 0}</td>
                `;
                
                tbody.appendChild(tr);
            });
            
            // Add footer with statistics
            const statsRow = document.createElement('tr');
            const outOfStock = lowStockProducts.filter(p => parseInt(p.stock) === 0).length;
            const critical = lowStockProducts.filter(p => parseInt(p.stock) > 0 && parseInt(p.stock) < 5).length;
            const low = lowStockProducts.filter(p => parseInt(p.stock) >= 5).length;
            
            statsRow.style.background = '#f8f9fa';
            statsRow.style.fontWeight = '600';
            statsRow.innerHTML = `
                <td colspan="6" style="padding:15px;text-align:center;border-top:2px solid #dee2e6;">
                    <div style="display:flex;justify-content:center;gap:30px;flex-wrap:wrap;">
                        ${outOfStock > 0 ? `<div><span style="color:#dc3545;">🔴 Out of Stock:</span> <strong>${outOfStock}</strong></div>` : ''}
                        ${critical > 0 ? `<div><span style="color:#ff5a5a;">🟠 Critical (1-4):</span> <strong>${critical}</strong></div>` : ''}
                        ${low > 0 ? `<div><span style="color:#ff9800;">🟡 Low (5-9):</span> <strong>${low}</strong></div>` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(statsRow);
            
            console.log('✅ Stock alert table populated successfully with', lowStockProducts.length, 'items');
        }
        
        console.log('🔍 === STOCK ALERT FUNCTION COMPLETED ===');
        
    } catch (err) {
        console.error('❌ loadStockAlert error:', err);
        const tbody = document.querySelector('#stockAlertTable tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;padding:40px;color:#dc3545;">
                        <div style="font-size:48px;margin-bottom:10px;">⚠️</div>
                        <div style="font-weight:700;font-size:18px;">Failed to Load Stock Alert</div>
                        <div style="margin-top:8px;font-size:14px;">${err.message}</div>
                    </td>
                </tr>
            `;
        }
        alert('Error loading stock alert: ' + err.message);
    }
}
/* ---------------- LOGOUT ---------------- */
document.getElementById('logoutSidebarBtn').addEventListener('click', () => {
    if(confirm('Are you sure you want to logout?')) window.location.href = 'admin.html';
});

/* ---------------- LOAD PRODUCTS WITH SEARCH ---------------- */
let allProducts = [];

async function loadProducts() {
    try {
        const res = await fetch(`${API_URL}/products_get.php`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        allProducts = await res.json();
        if (!Array.isArray(allProducts)) {
            console.error('Expected array but got:', allProducts);
            return;
        }

        renderProducts(allProducts);
        
    } catch (err) {
        console.error('loadProducts error:', err);
        alert('Failed to load products. Please check if the server is running.');
    }
}

function renderProducts(products) {
    // Populate Overall Stocks table
    const overallTbody = document.querySelector('#overallStocksTable tbody');
    overallTbody.innerHTML = '';
    
    if (products.length === 0) {
        overallTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No products available</td></tr>';
    } else {
        products.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.name}</td>
                <td>${item.type}</td>
                <td>${item.size}</td>
                <td>${item.stock}</td>
                <td>₱${parseFloat(item.price).toFixed(2)}</td>
                <td>${item.orders || 0}</td>
            `;
            overallTbody.appendChild(tr);
        });
    }

    // Populate Add Item table
    const productTbody = document.querySelector('#productTable tbody');
    productTbody.innerHTML = '';
    
    if (products.length === 0) {
        productTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No products available</td></tr>';
    } else {
        products.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.type}</td>
                <td>${item.size}</td>
                <td>${item.stock}</td>
                <td>₱${parseFloat(item.price).toFixed(2)}</td>
                <td>${item.orders || 0}</td>
            `;
            row.addEventListener('click', () => selectProduct(item));
            productTbody.appendChild(row);
        });
    }
}

// Search functionality for Overall Stocks
document.getElementById('searchOverallStocks').addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.type.toLowerCase().includes(query) ||
        p.size.toLowerCase().includes(query)
    );
    
    const tbody = document.querySelector('#overallStocksTable tbody');
    tbody.innerHTML = '';
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No products found</td></tr>';
    } else {
        filtered.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.name}</td>
                <td>${item.type}</td>
                <td>${item.size}</td>
                <td>${item.stock}</td>
                <td>₱${parseFloat(item.price).toFixed(2)}</td>
                <td>${item.orders || 0}</td>
            `;
            tbody.appendChild(tr);
        });
    }
});

/* ---------------- SELECT PRODUCT FOR EDIT ---------------- */
let selectedProduct = null;

function selectProduct(item){
    selectedProduct = item;
    
    document.getElementById('itemName').value = item.name;
    document.getElementById('productType').value = item.type;
    document.getElementById('size').value = item.size;
    document.getElementById('stockQty').value = '';
    document.getElementById('stockQty').placeholder = `Current: ${item.stock} | Enter amount to add`;
    document.getElementById('price').value = item.price;
    
    if (item.image) {
        if (item.image.startsWith('uploads/')) {
            document.getElementById('imagePreview').src = `${API_URL}/${item.image}`;
        } else {
            document.getElementById('imagePreview').src = item.image;
        }
    } else {
        document.getElementById('imagePreview').src = 'placeholder.png';
    }
    
    document.getElementById('addUpdateItem').textContent = 'Update Item';
}

/* ---------------- ADD / UPDATE PRODUCT ---------------- */
document.getElementById('addUpdateItem').addEventListener('click', async () => {
    const name = document.getElementById('itemName').value.trim();
    const type = document.getElementById('productType').value;
    const size = document.getElementById('size').value;
    const stockInput = document.getElementById('stockQty').value.trim();
    const priceInput = document.getElementById('price').value.trim();
    const imagePreview = document.getElementById('imagePreview');
    const image = imagePreview.src && !imagePreview.src.includes('placeholder.png') ? imagePreview.src : '';

    // ---------- VALIDATE ITEM NAME ----------
    if (!name) {
        alert('❌ Item name is required.');
        return;
    }

    // ---------- VALIDATE PRICE ----------
    if (!/^\d+$/.test(priceInput)) {
        alert('❌ Price must be a positive whole number (numbers only, no decimals)!');
        document.getElementById('price').value = '';
        document.getElementById('price').focus();
        return;
    }

    const price = parseInt(priceInput);
    if (price <= 0) {
        alert('❌ Price must be greater than 0!');
        document.getElementById('price').value = '';
        document.getElementById('price').focus();
        return;
    }

    if (price > 9999) {
        alert('❌ Price cannot exceed ₱9,999!');
        document.getElementById('price').value = '9999';
        document.getElementById('price').focus();
        return;
    }

    // ---------- VALIDATE STOCK ----------
    let stockToAdd = 0;
    if (stockInput !== '') {
        if (!/^\d+$/.test(stockInput)) {
            alert('❌ Stock must be a positive whole number (no letters, no decimals)!');
            document.getElementById('stockQty').value = '';
            document.getElementById('stockQty').focus();
            return;
        }

        stockToAdd = parseInt(stockInput);

        if (stockToAdd < 0) {
            alert('❌ Stock cannot be negative!');
            return;
        }

        if (stockToAdd > 100) {
            alert('❌ Cannot add more than 100 stock at once!');
            document.getElementById('stockQty').value = '100';
            document.getElementById('stockQty').focus();
            return;
        }

        // Check for existing product total stock
        if (selectedProduct) {
            const currentStock = parseInt(selectedProduct.stock) || 0;
            const newTotalStock = currentStock + stockToAdd;
            if (newTotalStock > 100) {
                alert(`❌ Total stock cannot exceed 100!\nCurrent stock: ${currentStock}\nAdding: ${stockToAdd}\nMax allowed: ${100 - currentStock}`);
                document.getElementById('stockQty').value = (100 - currentStock).toString();
                document.getElementById('stockQty').focus();
                return;
            }
        }
    } else if (!selectedProduct && stockToAdd < 0) {
        alert('❌ Initial stock cannot be negative!');
        return;
    }

    // ---------- SEND DATA TO SERVER ----------
    try {
        const payload = { name, type, size, stock: stockToAdd, price, image };
        const res = await fetch(`${API_URL}/products_add.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseText = await res.text();
        const jsonResponse = JSON.parse(responseText);

        if (jsonResponse && jsonResponse.status === 'ok') {
            alert(jsonResponse.message || '✅ Product saved successfully!');
            clearInputs();
            selectedProduct = null;
            loadProducts();
        } else {
            alert('❌ Failed to save product: ' + (jsonResponse.error || 'Unknown error'));
        }
    } catch (err) {
        console.error('Save error:', err);
        alert('❌ Error while saving: ' + err.message);
    }
});

/* ---------------- DELETE PRODUCT ---------------- */
document.getElementById('deleteItem').addEventListener('click', async () => {
    const name = document.getElementById('itemName').value.trim();
    const size = document.getElementById('size').value;
    
    if(!name) {
        alert('Select a product to delete.');
        return;
    }

    if(!confirm(`Are you sure you want to delete "${name}" (${size})?`)) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/products_delete.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, size })
        });
        
        const responseText = await res.text();
        let jsonResponse = JSON.parse(responseText);
        
        if(jsonResponse && jsonResponse.status === 'deleted'){
            alert(jsonResponse.message || 'Product deleted successfully!');
            clearInputs();
            selectedProduct = null;
            loadProducts();
        } else {
            alert('Delete failed: ' + (jsonResponse.error || 'Unknown error'));
        }
    } catch (err) {
        console.error('Delete error:', err);
        alert('Error while deleting: ' + err.message);
    }
});

/* ---------------- IMAGE PREVIEW ---------------- */
document.getElementById('productImage').addEventListener('change', e => {
    const file = e.target.files[0];
    if(!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = evt => {
        document.getElementById('imagePreview').src = evt.target.result;
    };
    reader.readAsDataURL(file);
});

/* ---------------- CLEAR INPUTS ---------------- */
function clearInputs(){
    document.getElementById('itemName').value = '';
    document.getElementById('productType').value = 'Snacks';
    document.getElementById('size').value = 'Small';
    document.getElementById('stockQty').value = '';
    document.getElementById('stockQty').placeholder = 'Enter stock quantity';
    document.getElementById('price').value = 0;
    document.getElementById('imagePreview').src = 'placeholder.png';
    document.getElementById('productImage').value = '';
    document.getElementById('addUpdateItem').textContent = 'Add/Update Item';
    selectedProduct = null;
}

/* ---------------- COMPLETE ORDER UPDATE FLOW ---------------- */

// 1. LOAD ORDERS - Only show ACTIVE orders (not completed)
async function loadOrders(){
    console.log('🔄 Loading orders...');
    
    try {
        const res = await fetch(`${API_URL}/orders_get.php`);
        console.log('Response status:', res.status);
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const orders = await res.json();
        console.log('📦 All orders received:', orders.length);
        
        if (!Array.isArray(orders)) {
            console.error('❌ Expected array but got:', orders);
            return;
        }
        
        const personnelRes = await fetch(`${API_URL}/delivery_personnel_get.php`);
        const personnel = await personnelRes.json();
        
        const orderPanel = document.querySelector('#orderDetails .panel-body');
        orderPanel.innerHTML = '';
        
        // ✅ FILTER OUT COMPLETED ORDERS - These should NOT appear in Orders
        const activeOrders = orders.filter(order => {
            const isCompleted = order.status === 'delivered' || 
                               order.status === 'ready_for_pickup' || 
                               order.status === 'already_picked_up';
            console.log(`Order #${order.id}: status="${order.status}", isCompleted=${isCompleted}`);
            return !isCompleted; // Only show NOT completed orders
        });
        
        console.log('✅ Active orders (should display):', activeOrders.length);
        console.log('📊 Filtered out (completed):', orders.length - activeOrders.length);
        
        if(activeOrders.length === 0){
            orderPanel.innerHTML = `
                <div style="text-align:center;padding:60px 20px;">
                    <div style="font-size:64px;margin-bottom:20px;">✅</div>
                    <h3 style="color:#28a745;margin:0 0 10px;">All Orders Completed!</h3>
                    <p style="color:#666;margin:0;">No pending orders at this time.</p>
                    <p style="color:#999;font-size:14px;margin-top:20px;">Total orders: ${orders.length} | Completed: ${orders.length}</p>
                </div>
            `;
            return;
        }
        
        // Create grid container
        const ordersGrid = document.createElement('div');
        ordersGrid.className = 'orders-grid';
        
        activeOrders.forEach((order, index) => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            
            const itemsList = order.items.map(item => {
                const size = item.product_size || item.size || '-';
                const price = parseFloat(item.price * item.quantity).toFixed(2);
                return `<li>${item.product_name} (${size}) x${item.quantity} - ₱${price}</li>`;
            }).join('');
            
            const deliveryDropdown = personnel.map(p => 
                `<option value="${p.name}" ${order.delivery_person === p.name ? 'selected' : ''}>${p.name}</option>`
            ).join('');
            
            let statusOptions = '';
            if(order.delivery_type === 'pickup') {
                statusOptions = `
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="ready_for_pickup" ${order.status === 'ready_for_pickup' ? 'selected' : ''}>Ready for Pickup</option>
                    <option value="already_picked_up" ${order.status === 'already_picked_up' ? 'selected' : ''}>✅ Already Picked Up</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                `;
            } else {
                statusOptions = `
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="out_for_delivery" ${order.status === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>✅ Delivered</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                `;
            }
            
            orderCard.innerHTML = `
                <div class="order-card-header">
                    <strong style="color:#d91f2a;">Order #${order.id}</strong>
                    <span style="color:#999;font-size:13px;">${new Date(order.created_at).toLocaleString()}</span>
                </div>
                <div class="order-card-body">
                    <div style="margin-bottom:10px;">
                        <strong>Customer:</strong> ${order.customer_name}<br>
                        <strong>Contact:</strong> ${order.customer_contact}<br>
                        <strong>Email:</strong> ${order.customer_email}
                    </div>
                    <div style="margin-bottom:10px;">
                        <strong>Delivery:</strong> ${order.delivery_type === 'delivery' ? 'Delivery to ' + order.delivery_location : 'Pick Up'}
                        ${order.recipient_name ? '<br><strong>Recipient:</strong> ' + order.recipient_name : ''}
                        ${order.delivery_address ? '<br><strong>Address:</strong> ' + order.delivery_address : ''}
                    </div>
                    <div style="margin-bottom:10px;">
                        <strong>Payment:</strong> ${order.payment_method.toUpperCase()}
                        ${order.receipt_image ? '<br><a href="' + API_URL + '/' + order.receipt_image + '" target="_blank" style="color:#d91f2a;">View Receipt</a>' : ''}
                    </div>
                    <div style="margin-bottom:10px;">
                        <strong>Items:</strong>
                        <ul class="order-items-list">${itemsList}</ul>
                    </div>
                    <div style="margin-bottom:10px;">
                        <strong>Status:</strong>
                        <select class="status-dropdown" data-order-id="${order.id}">
                            ${statusOptions}
                        </select>
                    </div>
                    ${order.delivery_type === 'delivery' ? `
                    <div style="margin-bottom:10px;">
                        <strong>Delivery Person:</strong>
                        <select class="delivery-person-dropdown" data-order-id="${order.id}">
                            <option value="">Not Assigned</option>
                            ${deliveryDropdown}
                        </select>
                    </div>` : ''}
                </div>
                <div class="order-card-footer">
                    <span><strong>Total:</strong> ₱${parseFloat(order.total).toFixed(2)}</span>
                    <button class="action-btn" onclick="updateOrderStatus(${order.id})">Update</button>
                </div>
                ${order.notes ? '<div style="margin-top:10px;font-size:13px;color:#666;padding:10px;background:#f9f9f9;border-radius:6px;"><strong>Notes:</strong> ' + order.notes + '</div>' : ''}
            `;
            
            ordersGrid.appendChild(orderCard);
        });
        
        orderPanel.appendChild(ordersGrid);
        console.log('✅ Orders grid created with', activeOrders.length, 'active orders');
        
    } catch(err){
        console.error('❌ loadOrders error:', err);
        alert('Failed to load orders: ' + err.message);
    }
}

// 2. UPDATE ORDER STATUS - With auto-refresh
async function updateOrderStatus(orderId) {
    const statusDropdown = document.querySelector(`.status-dropdown[data-order-id="${orderId}"]`);
    const deliveryPersonDropdown = document.querySelector(`.delivery-person-dropdown[data-order-id="${orderId}"]`);
    
    const status = statusDropdown.value;
    const deliveryPerson = deliveryPersonDropdown ? deliveryPersonDropdown.value : null;
    
    // Check if marking as completed
    const isCompleting = status === 'delivered' || 
                        status === 'already_picked_up' || 
                        status === 'ready_for_pickup';
    
    if(isCompleting) {
        const confirmMsg = status === 'delivered' 
            ? '✅ Mark this order as DELIVERED?\n\nThis will:\n• Remove from Orders\n• Add to Sales\n• Show in Customer Purchase History'
            : status === 'already_picked_up'
            ? '✅ Mark this order as ALREADY PICKED UP?\n\nThis will:\n• Remove from Orders\n• Add to Sales\n• Show in Customer Purchase History'
            : '✅ Mark this order as READY FOR PICKUP?\n\nThis will:\n• Remove from Orders\n• Add to Sales\n• Show in Customer Purchase History';
        
        if(!confirm(confirmMsg)) {
            return;
        }
    }
    
    try {
        console.log(`🔄 Updating Order #${orderId} to status: ${status}`);
        
        const res = await fetch(`${API_URL}/order_update.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                order_id: orderId,
                status: status,
                delivery_person: deliveryPerson
            })
        });
        
        const result = await res.json();
        
        if(result.status === 'ok') {
            console.log('✅ Order updated successfully');
            
            if(isCompleting) {
                alert('✅ Order completed successfully!\n\n• Removed from Orders\n• Added to Sales\n• Customer can now view in Purchase History');
            } else {
                alert('Order status updated!');
            }
            
            // Refresh all relevant sections
            console.log('🔄 Refreshing all sections...');
            await loadOrders();      // Refresh Orders (completed order will disappear)
            await loadSales();       // Refresh Sales (completed order will appear)
            await loadDashboard();   // Refresh Dashboard stats
            
            console.log('✅ All sections refreshed');
        } else {
            alert('❌ Failed to update order: ' + (result.error || 'Unknown error'));
        }
    } catch(err) {
        console.error('❌ Update error:', err);
        alert('Failed to update order: ' + err.message);
    }
}

// 3. LOAD SALES - Show completed orders
async function loadSales(){
    console.log('🔄 Loading sales...');
    
    try {
        const res = await fetch(`${API_URL}/sales_get.php`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const sales = await res.json();
        console.log('💰 Sales received:', sales.length);
        
        const salesPanel = document.querySelector('#sales .panel-body');
        salesPanel.innerHTML = '';
        
        if(!Array.isArray(sales) || sales.length === 0) {
            salesPanel.innerHTML = `
                <div style="text-align:center;padding:60px 20px;">
                    <div style="font-size:64px;margin-bottom:20px;">📊</div>
                    <h3 style="color:#666;margin:0 0 10px;">No Sales Yet</h3>
                    <p style="color:#999;margin:0;">Completed orders will appear here.</p>
                </div>
            `;
            return;
        }
        
        // Group sales by date
        const salesByDate = {};
        sales.forEach(sale => {
            const date = sale.sale_date.split(' ')[0];
            if(!salesByDate[date]) {
                salesByDate[date] = [];
            }
            salesByDate[date].push(sale);
        });
        
        // Create sales sections by date
        Object.keys(salesByDate).sort().reverse().forEach(date => {
            const dateSales = salesByDate[date];
            const dateTotal = dateSales.reduce((sum, s) => sum + parseFloat(s.total), 0);
            
            const dateSection = document.createElement('div');
            dateSection.className = 'sales-section';
            
            const dateHeader = document.createElement('h3');
            dateHeader.className = 'sales-date-header';
            dateHeader.textContent = `${new Date(date).toLocaleDateString()} - Total: ₱${dateTotal.toFixed(2)}`;
            dateSection.appendChild(dateHeader);
            
            const table = document.createElement('table');
            table.className = 'data-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Location</th>
                        <th>Payment</th>
                        <th>Delivered By</th>
                        <th>Total</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            
            const tbody = table.querySelector('tbody');
            dateSales.forEach(sale => {
                const row = document.createElement('tr');
                const time = new Date(sale.sale_date).toLocaleTimeString();
                row.innerHTML = `
                    <td>#${sale.order_id}</td>
                    <td>${sale.customer_name}</td>
                    <td>${sale.delivery_location || 'Pick Up'}</td>
                    <td>${sale.payment_method.toUpperCase()}</td>
                    <td>${sale.delivery_person || 'N/A'}</td>
                    <td style="color:#28a745;font-weight:700;">₱${parseFloat(sale.total).toFixed(2)}</td>
                    <td>${time}</td>
                `;
                tbody.appendChild(row);
            });
            
            dateSection.appendChild(table);
            salesPanel.appendChild(dateSection);
        });
        
        console.log('✅ Sales loaded successfully');
        
    } catch(err){
        console.error('❌ loadSales error:', err);
        alert('Failed to load sales data');
    }
}

// Make updateOrderStatus globally available
window.updateOrderStatus = updateOrderStatus;
/* ---------------- DASHBOARD ---------------- */
a/* ---------------- DASHBOARD WITH CHARTS ---------------- */
async function loadDashboard() {
    console.log('📊 Loading dashboard...');
    
    try {
        const res = await fetch(`${API_URL}/dashboard_stats.php`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const stats = await res.json();
        console.log('📈 Dashboard stats:', stats);
        
        const dashboardPanel = document.querySelector('#dashboard .panel-body');
        dashboardPanel.innerHTML = `
            <div class="dashboard-layout">
                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);">
                        <h3>Today's Sales</h3>
                        <p>₱${parseFloat(stats.today_sales || 0).toFixed(2)}</p>
                    </div>
                    <div class="stat-card" style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);">
                        <h3>Total Orders Today</h3>
                        <p>${stats.today_orders || 0}</p>
                    </div>
                    <div class="stat-card" style="background:linear-gradient(135deg,#4facfe 0%,#00f2fe 100%);">
                        <h3>Pending Orders</h3>
                        <p>${stats.pending_orders || 0}</p>
                    </div>
                </div>
                
                <!-- Charts -->
                <div class="charts-grid">
                    <div class="chart-container">
                        <h3>Top Selling Products</h3>
                        <canvas id="productChart"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h3>Daily Sales (Last 7 Days)</h3>
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        // Create charts
        createProductChart(stats.top_products || []);
        createSalesChart(stats.daily_sales || []);
        
        console.log('✅ Dashboard loaded successfully');
        
    } catch(err) {
        console.error('❌ Dashboard error:', err);
        const dashboardPanel = document.querySelector('#dashboard .panel-body');
        dashboardPanel.innerHTML = `
            <div style="text-align:center;padding:60px 20px;">
                <div style="font-size:64px;margin-bottom:20px;">⚠️</div>
                <h3 style="color:#d91f2a;margin:0 0 10px;">Failed to Load Dashboard</h3>
                <p style="color:#666;margin:0;">${err.message}</p>
                <button onclick="loadDashboard()" style="margin-top:20px;padding:10px 20px;background:#d91f2a;color:white;border:none;border-radius:8px;cursor:pointer;">
                    Retry
                </button>
            </div>
        `;
    }
}

function createProductChart(products) {
    console.log('🎨 Creating product chart with data:', products);
    
    const ctx = document.getElementById('productChart');
    if (!ctx) {
        console.error('❌ Product chart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    if (window.productChartInstance) {
        window.productChartInstance.destroy();
    }
    
    if (!products || products.length === 0) {
        ctx.parentElement.innerHTML = `
            <h3>Top Selling Products</h3>
            <div style="text-align:center;padding:40px;color:#999;">
                <div style="font-size:48px;margin-bottom:10px;">📊</div>
                <p>No sales data yet</p>
            </div>
        `;
        return;
    }
    
    window.productChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: products.map(p => `${p.name} (${p.total_sold} sold)`),
            datasets: [{
                data: products.map(p => p.total_sold),
                backgroundColor: [
                    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe',
                    '#00f2fe', '#43e97b', '#38f9d7', '#fa709a', '#fee140'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + ' items';
                        }
                    }
                }
            }
        }
    });
    
    console.log('✅ Product chart created');
}

function createSalesChart(dailySales) {
    console.log('🎨 Creating sales chart with data:', dailySales);
    
    const ctx = document.getElementById('salesChart');
    if (!ctx) {
        console.error('❌ Sales chart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    if (window.salesChartInstance) {
        window.salesChartInstance.destroy();
    }
    
    if (!dailySales || dailySales.length === 0) {
        ctx.parentElement.innerHTML = `
            <h3>Daily Sales (Last 7 Days)</h3>
            <div style="text-align:center;padding:40px;color:#999;">
                <div style="font-size:48px;margin-bottom:10px;">📈</div>
                <p>No sales data yet</p>
            </div>
        `;
        return;
    }
    
    window.salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dailySales.map(d => {
                const date = new Date(d.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }),
            datasets: [{
                label: 'Daily Sales (₱)',
                data: dailySales.map(d => parseFloat(d.total)),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { 
                    display: false 
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₱' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₱' + value.toFixed(0);
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    console.log('✅ Sales chart created');
}
/* ---------------- INITIAL LOAD ---------------- */
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    console.log('Admin interface loaded. API URL:', API_URL);
});

window.updateOrderStatus = updateOrderStatus;
