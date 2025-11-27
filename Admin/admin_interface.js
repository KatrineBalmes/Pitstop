const API_URL = 'http://localhost/ordering'; // folder with PHP files

/* ---------------- NAVIGATION ---------------- */
const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
const panels = Array.from(document.querySelectorAll('.panel'));

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const target = btn.dataset.target;
        panels.forEach(p => p.style.display = (p.id === target ? 'block' : 'none'));
        if(target === 'addItem' || target === 'overallStocks') loadProducts();
    });
});

/* ---------------- LOGOUT ---------------- */
document.getElementById('logoutSidebarBtn').addEventListener('click', () => {
    if(confirm('Are you sure you want to logout?')) window.location.reload();
});

/* ---------------- LOAD PRODUCTS ---------------- */
async function loadProducts() {
    const res = await fetch(`${API_URL}/products_get.php`);
    const products = await res.json();

    // Populate Overall Stocks table
    const overallTbody = document.querySelector('#overallStocksTable tbody');
    overallTbody.innerHTML = '';
    products.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.type}</td>
            <td>${item.size}</td>
            <td>${item.stock}</td>
            <td>₱${parseFloat(item.price).toFixed(2)}</td>
        `;
        overallTbody.appendChild(row);
    });

    // Populate Add Item table
    const productTbody = document.querySelector('#productTable tbody');
    productTbody.innerHTML = '';
    products.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.type}</td>
            <td>${item.size}</td>
            <td>${item.stock}</td>
            <td>₱${parseFloat(item.price).toFixed(2)}</td>
        `;
        row.addEventListener('click', () => selectProduct(item));
        productTbody.appendChild(row);
    });
}

/* ---------------- SELECT PRODUCT FOR EDIT ---------------- */
function selectProduct(item){
    document.getElementById('itemName').value = item.name;
    document.getElementById('productType').value = item.type;
    document.getElementById('size').value = item.size;
    document.getElementById('stockQty').value = item.stock;
    document.getElementById('price').value = item.price;
    document.getElementById('imagePreview').src = item.image || 'placeholder.png';
}

/* ---------------- ADD / UPDATE PRODUCT ---------------- */
document.getElementById('addUpdateItem').addEventListener('click', async () => {
    const name = document.getElementById('itemName').value.trim();
    const type = document.getElementById('productType').value;
    const size = document.getElementById('size').value;
    const stock = parseInt(document.getElementById('stockQty').value);
    const price = parseFloat(document.getElementById('price').value);
    const image = document.getElementById('imagePreview').src;

    if(!name) return alert('Item name is required.');

    await fetch(`${API_URL}/products_add.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, size, stock, price, image })
    });

    alert('Product added/updated successfully.');
    clearInputs();
    loadProducts();
});

/* ---------------- DELETE PRODUCT ---------------- */
document.getElementById('deleteItem').addEventListener('click', async () => {
    const name = document.getElementById('itemName').value.trim();
    if(!name) return alert('Select a product to delete.');

    if(!confirm('Are you sure you want to delete this product?')) return;

    await fetch(`${API_URL}/products_delete.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });

    alert('Product deleted successfully.');
    clearInputs();
    loadProducts();
});

/* ---------------- IMAGE PREVIEW ---------------- */
document.getElementById('productImage').addEventListener('change', e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = evt => document.getElementById('imagePreview').src = evt.target.result;
    reader.readAsDataURL(file);
});

/* ---------------- CLEAR INPUTS ---------------- */
function clearInputs(){
    document.getElementById('itemName').value = '';
    document.getElementById('productType').value = 'Beverages/Drinks';
    document.getElementById('size').value = 'Small';
    document.getElementById('stockQty').value = 0;
    document.getElementById('price').value = 0;
    document.getElementById('imagePreview').src = 'placeholder.png';
}

/* ---------------- INITIAL LOAD ---------------- */
document.addEventListener('DOMContentLoaded', loadProducts);
