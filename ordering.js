// ordering.js - UPDATED WITH SEARCH AND BARANGAY LIST
const API_URL = 'http://localhost/ordering';

/* ---------- CAROUSEL ---------- */
const slidesEl = document.getElementById('slides');
const dotsEl = document.getElementById('carouselDots');
const slideCount = slidesEl.children.length;
let currentSlide = 0, slideWidth = 0, autoplayInterval = null;

function setupDots(){
    dotsEl.innerHTML='';
    for(let i=0;i<slideCount;i++){
        const btn = document.createElement('button');
        btn.dataset.index=i;
        if(i===0) btn.classList.add('active');
        btn.addEventListener('click', ()=>{ goToSlide(i); resetAutoplay(); });
        dotsEl.appendChild(btn);
    }
}

function updateSlidePosition(){
    slideWidth=slidesEl.clientWidth;
    slidesEl.style.transform=`translateX(${-currentSlide*slideWidth}px)`;
    dotsEl.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('active',i===currentSlide));
}

function goToSlide(i){
    currentSlide=(i+slideCount)%slideCount;
    updateSlidePosition();
}

document.querySelectorAll('.carousel-arrow').forEach(btn=>{
    btn.addEventListener('click', ()=>{
        goToSlide(btn.dataset.dir==='left'?currentSlide-1:currentSlide+1);
        resetAutoplay();
    });
});

function autoplay(){ autoplayInterval=setInterval(()=>goToSlide(currentSlide+1),4500); }
function resetAutoplay(){ clearInterval(autoplayInterval); autoplay(); }

let startX=0,isDragging=false;
slidesEl.addEventListener('pointerdown', e=>{ isDragging=true; startX=e.clientX; slidesEl.style.transition='none'; });
slidesEl.addEventListener('pointermove', e=>{ if(!isDragging) return; const dx=e.clientX-startX; slidesEl.style.transform=`translateX(${-currentSlide*slidesEl.clientWidth+dx}px)`; });
slidesEl.addEventListener('pointerup', e=>{ 
    if(!isDragging) return; 
    isDragging=false; slidesEl.style.transition=''; 
    const dx=e.clientX-startX; 
    if(dx>60) goToSlide(currentSlide-1); 
    else if(dx<-60) goToSlide(currentSlide+1); 
    else updateSlidePosition(); 
    resetAutoplay(); 
});
slidesEl.addEventListener('pointerleave', ()=>{ if(!isDragging) return; isDragging=false; slidesEl.style.transition=''; updateSlidePosition(); resetAutoplay(); });
window.addEventListener('resize', updateSlidePosition);
setupDots(); autoplay(); updateSlidePosition();

/* ---------- MENU & CART ---------- */
let MENU=[],cart={};

async function fetchMenu(){
    try {
        const res = await fetch(`${API_URL}/products_get.php`);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!Array.isArray(data)) {
            console.error('Expected array but got:', data);
            return;
        }
        
        MENU = data;
        console.log('Loaded products:', MENU.length);
        
        renderFeaturedMenu();
        renderMenuCategories();
        
    } catch (err) {
        console.error('fetchMenu error:', err);
        alert('Failed to load menu. Please check if the server is running.');
    }
}

const menuCards=document.getElementById('menuCards');

async function renderFeaturedMenu(){
    menuCards.innerHTML='';
    
    if (MENU.length === 0) {
        menuCards.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#999;">No products available</p>';
        return;
    }
    
    try {
        const salesRes = await fetch(`${API_URL}/sales_get.php`);
        const sales = await salesRes.json();
        
        if(!Array.isArray(sales) || sales.length === 0) {
            const randomProducts = MENU.slice(0, 10);
            displayFeaturedProducts(randomProducts);
            return;
        }
        
        const orderIds = sales.map(s => s.order_id);
        const itemsRes = await fetch(`${API_URL}/orders_get.php`);
        const orders = await itemsRes.json();
        
        const productSales = {};
        
        orders.forEach(order => {
            if(order.status === 'delivered' || order.status === 'ready_for_pickup' || order.status === 'already_picked_up') {
                order.items.forEach(item => {
                    const key = `${item.product_name}_${item.product_size}`;
                    if(!productSales[key]) {
                        productSales[key] = {
                            name: item.product_name,
                            size: item.product_size,
                            totalSold: 0
                        };
                    }
                    productSales[key].totalSold += parseInt(item.quantity);
                });
            }
        });
        
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 10);
        
        if(topProducts.length === 0) {
            const randomProducts = MENU.slice(0, 10);
            displayFeaturedProducts(randomProducts);
            return;
        }
        
        const featured = topProducts.map(tp => {
            return MENU.find(m => m.name === tp.name && m.size === tp.size);
        }).filter(p => p !== undefined);
        
        displayFeaturedProducts(featured);
        
    } catch(err) {
        console.error('Error loading featured products:', err);
        const fallback = MENU.slice(0, 10);
        displayFeaturedProducts(fallback);
    }
}

function displayFeaturedProducts(products) {
    menuCards.innerHTML = '';
    
    if(products.length === 0) {
        menuCards.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#999;">No featured items yet</p>';
        return;
    }
    
    products.forEach(item => {
        const c = document.createElement('div'); 
        c.className = 'card';
        
        let imageSrc = 'placeholder.png';
        if (item.image) {
            if (item.image.startsWith('uploads/')) {
                imageSrc = `${API_URL}/${item.image}`;
            } else {
                imageSrc = item.image;
            }
        }
        
        c.innerHTML = `
            <div class="card-img">
                <img src="${imageSrc}" alt="${item.name}" onerror="this.src='placeholder.png'">
            </div>
            <h3>${item.name}</h3>
            <p>₱${parseFloat(item.price).toFixed(2)}</p>
            ${item.stock <= 0 ? '<p style="color:#d91f2a;font-weight:600;margin-top:8px;">Not Available</p>' : ''}
        `;
        
        c.addEventListener('click', () => {
            showMenuPage();
            setActiveNav('Menu');
        });
        
        menuCards.appendChild(c);
    });
}

/* Cart UI */
const cartPane=document.getElementById('cartPane');
const cartList=document.getElementById('cartList');
const subtotalEl=document.getElementById('subtotal');

function updateCartUI(){
    cartList.innerHTML='';
    const keys=Object.keys(cart);
    if(keys.length===0){ 
        cartList.innerHTML='<div class="muted">Your cart is empty.</div>'; 
        subtotalEl.textContent='₱0.00'; 
        return; 
    }
    let subtotal=0;
    keys.forEach(k=>{
        const it=cart[k]; 
        subtotal+=parseFloat(it.price)*it.qty;
        const row=document.createElement('div'); 
        row.className='cart-row';
        row.innerHTML=`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0">
                <div>
                    <div style="font-weight:600">${it.name} (${it.size})</div>
                    <div class="muted" style="font-size:13px">₱${parseFloat(it.price).toFixed(2)} x ${it.qty}</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;">
                    <button class="small" data-op="inc" data-id="${k}">+</button>
                    <button class="small" data-op="dec" data-id="${k}">-</button>
                </div>
            </div>
        `;
        cartList.appendChild(row);
    });
    subtotalEl.textContent=`₱${subtotal.toFixed(2)}`;
    cartList.querySelectorAll('button[data-op]').forEach(b=>{
    b.addEventListener('click', ()=>{
        const id=b.dataset.id, op=b.dataset.op;
        
        if(op==='inc') {
            const item = MENU.find(i => `${i.name}_${i.size}` === id);
            if(item && cart[id].qty >= item.stock) {
                alert(`Sorry, only ${item.stock} items available in stock!`);
                return;
            }
            cart[id].qty+=1;
        }
        
        if(op==='dec'){ 
            cart[id].qty-=1; 
            if(cart[id].qty<=0) delete cart[id]; 
        }
        updateCartUI();
    });
});
}

function addToCart(uniqueId){
    const item=MENU.find(i=> `${i.name}_${i.size}` === uniqueId);
    if(!item) return;
    
    // CHECK IF STOCK IS AVAILABLE
    if(item.stock <= 0) {
        alert('Sorry, this item is out of stock!');
        return;
    }
    
    // CHECK IF ADDING MORE WILL EXCEED STOCK
    const currentQty = cart[uniqueId] ? cart[uniqueId].qty : 0;
    if(currentQty >= item.stock) {
        alert(`Sorry, only ${item.stock} items available in stock!`);
        return;
    }
    
    if(!cart[uniqueId]) cart[uniqueId]={...item, qty:0};
    cart[uniqueId].qty+=1;
    updateCartUI(); 
    openCart();
}

document.getElementById('openCartBtn').addEventListener('click', openCart);
document.getElementById('closeCartBtn').addEventListener('click', closeCart);
document.getElementById('checkoutBtn').addEventListener('click', showCheckoutModal);

function openCart(){ cartPane.classList.add('open'); cartPane.setAttribute('aria-hidden','false'); }
function closeCart(){ cartPane.classList.remove('open'); cartPane.setAttribute('aria-hidden','true'); }

// Add Tesseract.js CDN to ordering.html <head> section:
// <script src="https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js"></script>

// Replace the GCash section in showCheckoutModal():

function showCheckoutModal(){
    if(Object.keys(cart).length===0){ 
        alert('Cart is empty'); 
        return; 
    }
    
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    if(!loggedInUser){
        alert('Please login first');
        window.location.href = 'user_login.html';
        return;
    }
    
    const barangays = [
        'Alalum', 'Antipolo', 'Balimbing', 'Banaba', 'Bayanan', 'Danglayan', 
        'Del Pilar', 'Gelerang Kawayan', 'Ilat North', 'Ilat South', 'Kaingin', 
        'Laurel', 'Malaking Pook', 'Mataas na Lupa', 'Natunuan North', 
        'Natunuan South', 'Padre Castillo', 'Palsahingin', 'Pila', 'Poblacion', 
        'Pook ni Banal', 'Pook ni Kapitan', 'Resplandor', 'Sambat', 'San Antonio', 
        'San Mariano', 'San Mateo', 'Santa Elena', 'Santo Niño'
    ];
    
    const barangayOptions = barangays.map(b => `<option value="${b}">${b}</option>`).join('');
    
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Checkout</h2>
                <button class="close-modal" onclick="this.closest('.checkout-modal').remove()">x</button>
            </div>
            <div class="modal-body">
                <div class="checkout-section">
                    <h3>Customer Details</h3>
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="checkoutName" value="${loggedInUser.fullname}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="checkoutEmail" value="${loggedInUser.email}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Contact Number</label>
                        <input type="tel" id="checkoutContact" value="${loggedInUser.contact}" readonly>
                    </div>
                </div>
                
                <div class="checkout-section">
                    <h3>Delivery Options</h3>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="deliverForOthers"> 
                            Deliver to someone else / Pick up by others
                        </label>
                    </div>
                    <div id="recipientSection" style="display:none;">
                        <div class="form-group">
                            <label>Recipient Name</label>
                            <input type="text" id="recipientName" placeholder="Enter recipient name">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Delivery Type</label>
                        <select id="deliveryType">
                            <option value="pickup">Pick Up</option>
                            <option value="delivery">Delivery</option>
                        </select>
                    </div>
                    
                    <div id="deliverySection" style="display:none;">
                        <div class="form-group">
                            <label>Select Barangay</label>
                            <select id="deliveryLocation">
                                <option value="">-- Select Barangay --</option>
                                ${barangayOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Detailed Address</label>
                            <textarea id="deliveryAddress" rows="2" placeholder="House no., street, landmarks"></textarea>
                        </div>
                        <p style="color:#d91f2a;font-size:14px;margin-top:10px;">
                            <strong>Note:</strong> Delivery is available within 30km radius only. ₱30 delivery charge will be added.
                        </p>
                    </div>
                    
                    <div class="form-group">
                        <label>Notes (Optional)</label>
                        <textarea id="orderNotes" rows="2" placeholder="Special instructions"></textarea>
                    </div>
                </div>
                
                <div class="checkout-section">
                    <h3>Payment Method</h3>
                    <div class="form-group">
                        <select id="paymentMethod">
                            <option value="cod">Cash on Delivery (COD)</option>
                            <option value="gcash">GCash</option>
                        </select>
                    </div>
                    
                    <div id="gcashSection" style="display:none;">
                        <div class="gcash-qr">
                            <img src="pay.jpg" alt="GCash QR Code" style="width:200px;height:200px;margin:10px auto;display:block;">
                            <p style="text-align:center;color:#666;font-size:14px;">Scan to pay</p>
                        </div>
                        <div class="form-group">
                            <label>Upload Receipt <span style="color:#d91f2a;">*</span></label>
                            <input type="file" id="receiptUpload" accept="image/*">
                            <small style="color:#666;font-size:12px;display:block;margin-top:4px;">
                                📸 Upload your GCash receipt and we'll auto-detect the reference number
                            </small>
                            <div id="ocrStatus" style="margin-top:8px;padding:10px;border-radius:6px;display:none;">
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <div id="ocrSpinner" style="display:none;">
                                        <div style="border:3px solid #f3f3f3;border-top:3px solid #00b14f;border-radius:50%;width:20px;height:20px;animation:spin 1s linear infinite;"></div>
                                    </div>
                                    <span id="ocrMessage"></span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>GCash Reference Number <span style="color:#d91f2a;">*</span></label>
                            <input 
                                type="text" 
                                id="gcashRefNumber" 
                                placeholder="Auto-detected or enter manually"
                                maxlength="13"
                                pattern="[0-9]*"
                                inputmode="numeric"
                                style="font-family:monospace;letter-spacing:2px;font-size:16px;text-align:center;">
                            <small style="color:#666;font-size:12px;display:block;margin-top:4px;">
                                ⚠️ <strong>Important:</strong> Must be exactly 13 digits. No spaces. Numbers only.
                            </small>
                            <small style="color:#28a745;font-size:12px;font-weight:600;display:none;margin-top:4px;" id="refNumSuccess">
                                ✓ Valid reference number
                            </small>
                            <small style="color:#d91f2a;font-size:12px;font-weight:600;display:none;margin-top:4px;" id="refNumError">
                                ✗ Must be exactly 13 digits
                            </small>
                        </div>
                    </div>
                </div>
                
                <div class="checkout-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <strong id="modalSubtotal">₱0.00</strong>
                    </div>
                    <div class="summary-row" id="deliveryFeeRow" style="display:none;">
                        <span>Delivery Fee:</span>
                        <strong>₱30.00</strong>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <strong id="modalTotal">₱0.00</strong>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="this.closest('.checkout-modal').remove()">Cancel</button>
                <button class="btn-confirm" id="confirmPaymentBtn">Confirm Payment</button>
            </div>
        </div>
    `;
    
    // Add spinner animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(modal);
    
    const subtotal = Object.values(cart).reduce((sum, item) => sum + (item.price * item.qty), 0);
    document.getElementById('modalSubtotal').textContent = `₱${subtotal.toFixed(2)}`;
    document.getElementById('modalTotal').textContent = `₱${subtotal.toFixed(2)}`;
    
    document.getElementById('deliverForOthers').addEventListener('change', function(){
        document.getElementById('recipientSection').style.display = this.checked ? 'block' : 'none';
    });
    
    document.getElementById('deliveryType').addEventListener('change', function(){
        const isDelivery = this.value === 'delivery';
        document.getElementById('deliverySection').style.display = isDelivery ? 'block' : 'none';
        document.getElementById('deliveryFeeRow').style.display = isDelivery ? 'flex' : 'none';
        updateTotal();
    });
    
    document.getElementById('paymentMethod').addEventListener('change', function(){
        document.getElementById('gcashSection').style.display = this.value === 'gcash' ? 'block' : 'none';
    });
    
    function updateTotal(){
        const deliveryFee = document.getElementById('deliveryType').value === 'delivery' ? 30 : 0;
        const total = subtotal + deliveryFee;
        document.getElementById('modalTotal').textContent = `₱${total.toFixed(2)}`;
    }
    
    // GCash Reference Number Validation
    const gcashRefNumber = document.getElementById('gcashRefNumber');
    const refNumSuccess = document.getElementById('refNumSuccess');
    const refNumError = document.getElementById('refNumError');
    
    gcashRefNumber.addEventListener('input', function(e) {
        // Remove any non-numeric characters and spaces
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // Validate length
        if(this.value.length === 13) {
            refNumSuccess.style.display = 'block';
            refNumError.style.display = 'none';
            this.style.borderColor = '#28a745';
            this.style.background = 'rgba(40, 167, 69, 0.05)';
        } else if(this.value.length > 0) {
            refNumSuccess.style.display = 'none';
            refNumError.style.display = 'block';
            this.style.borderColor = '#d91f2a';
            this.style.background = 'rgba(217, 31, 42, 0.05)';
        } else {
            refNumSuccess.style.display = 'none';
            refNumError.style.display = 'none';
            this.style.borderColor = '';
            this.style.background = '';
        }
    });
    
    // OCR for Receipt Analysis
    document.getElementById('receiptUpload').addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if(!file) return;
        
        const ocrStatus = document.getElementById('ocrStatus');
        const ocrMessage = document.getElementById('ocrMessage');
        const ocrSpinner = document.getElementById('ocrSpinner');
        
        // Show analyzing status
        ocrStatus.style.display = 'block';
        ocrStatus.style.background = 'rgba(0, 177, 79, 0.1)';
        ocrStatus.style.borderLeft = '3px solid #00b14f';
        ocrSpinner.style.display = 'block';
        ocrMessage.textContent = '🔍 Analyzing receipt for reference number...';
        ocrMessage.style.color = '#00b14f';
        
        try {
            // Check if Tesseract is available
            if(typeof Tesseract === 'undefined') {
                throw new Error('OCR library not loaded. Please refresh the page.');
            }
            
            const result = await Tesseract.recognize(file, 'eng', {
                logger: m => {
                    if(m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        ocrMessage.textContent = `🔍 Analyzing receipt... ${progress}%`;
                    }
                }
            });
            
            const text = result.data.text;
            console.log('OCR Result:', text);
            
            // Extract 13-digit reference number patterns
            // GCash reference numbers are typically 13 digits
            const patterns = [
                /\b(\d{13})\b/g,  // Exact 13 digits
                /ref(?:erence)?[:\s#]*(\d{13})/gi,  // "Reference: 1234567890123"
                /(?:ref|reference|no|number)[:\s#]*(\d{13})/gi
            ];
            
            let refNumber = null;
            
            for(let pattern of patterns) {
                const matches = text.match(pattern);
                if(matches && matches.length > 0) {
                    // Extract just the numbers
                    refNumber = matches[0].replace(/\D/g, '');
                    if(refNumber.length === 13) {
                        break;
                    }
                }
            }
            
            if(refNumber && refNumber.length === 13) {
                // Success - found reference number
                document.getElementById('gcashRefNumber').value = refNumber;
                
                // Trigger validation
                gcashRefNumber.dispatchEvent(new Event('input'));
                
                ocrSpinner.style.display = 'none';
                ocrStatus.style.background = 'rgba(40, 167, 69, 0.1)';
                ocrStatus.style.borderLeft = '3px solid #28a745';
                ocrMessage.innerHTML = `✅ <strong>Reference number detected:</strong> ${refNumber}<br><small>Please verify and edit if incorrect</small>`;
                ocrMessage.style.color = '#28a745';
                
                // Highlight the input briefly
                gcashRefNumber.style.animation = 'pulse 0.5s ease';
                
            } else {
                // Not found - manual entry required
                ocrSpinner.style.display = 'none';
                ocrStatus.style.background = 'rgba(255, 193, 7, 0.1)';
                ocrStatus.style.borderLeft = '3px solid #ffc107';
                ocrMessage.innerHTML = `⚠️ <strong>Could not detect reference number</strong><br><small>Please enter it manually from your receipt</small>`;
                ocrMessage.style.color = '#ff9800';
                
                // Focus on input
                document.getElementById('gcashRefNumber').focus();
            }
            
        } catch(err) {
            console.error('OCR Error:', err);
            ocrSpinner.style.display = 'none';
            ocrStatus.style.background = 'rgba(217, 31, 42, 0.1)';
            ocrStatus.style.borderLeft = '3px solid #d91f2a';
            ocrMessage.innerHTML = `❌ <strong>Error analyzing receipt</strong><br><small>${err.message}. Please enter reference number manually.</small>`;
            ocrMessage.style.color = '#d91f2a';
        }
    });
    
    document.getElementById('confirmPaymentBtn').addEventListener('click', processOrder);
}

// Update processOrder function to include reference number validation
async function processOrder(){
    const deliveryType = document.getElementById('deliveryType').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const deliverForOthers = document.getElementById('deliverForOthers').checked;
    
    if(deliveryType === 'delivery' && !document.getElementById('deliveryLocation').value){
        alert('Please select delivery location');
        return;
    }
    
    if(deliverForOthers && !document.getElementById('recipientName').value.trim()){
        alert('Please enter recipient name');
        return;
    }
    
    if(paymentMethod === 'gcash'){
        if(!document.getElementById('receiptUpload').files[0]){
            alert('Please upload payment receipt');
            return;
        }
        
        const refNumber = document.getElementById('gcashRefNumber').value;
        if(!refNumber || refNumber.length !== 13){
            alert('Please enter a valid 13-digit GCash reference number.\n\nReference number must be exactly 13 digits with no spaces.');
            document.getElementById('gcashRefNumber').focus();
            return;
        }
        
        // Additional validation: check if it's all numbers
        if(!/^\d{13}$/.test(refNumber)){
            alert('Reference number must contain only numbers (0-9)');
            document.getElementById('gcashRefNumber').focus();
            return;
        }
    }
    
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const subtotal = Object.values(cart).reduce((sum, item) => sum + (item.price * item.qty), 0);
    const deliveryFee = deliveryType === 'delivery' ? 30 : 0;
    const total = subtotal + deliveryFee;
    
    const orderData = {
        customer_name: loggedInUser.fullname,
        customer_email: loggedInUser.email,
        customer_contact: loggedInUser.contact,
        delivery_type: deliveryType,
        recipient_name: deliverForOthers ? document.getElementById('recipientName').value : '',
        delivery_location: deliveryType === 'delivery' ? document.getElementById('deliveryLocation').value : '',
        delivery_address: deliveryType === 'delivery' ? document.getElementById('deliveryAddress').value : '',
        notes: document.getElementById('orderNotes').value,
        payment_method: paymentMethod,
        gcash_reference: paymentMethod === 'gcash' ? document.getElementById('gcashRefNumber').value : '',
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: total,
        items: Object.values(cart).map(item => ({
            name: item.name,
            size: item.size,
            quantity: item.qty,
            price: item.price
        }))
    };
    
    if(paymentMethod === 'gcash'){
        const file = document.getElementById('receiptUpload').files[0];
        const reader = new FileReader();
        reader.onload = async function(e){
            orderData.receipt_image = e.target.result;
            await submitOrder(orderData);
        };
        reader.readAsDataURL(file);
    } else {
        await submitOrder(orderData);
    }
}

async function submitOrder(orderData){
    try {
        const res = await fetch(`${API_URL}/order_submit.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        const result = await res.json();
        
        if(result.status === 'ok'){
            cart = {};
            updateCartUI();
            document.querySelector('.checkout-modal').remove();
            closeCart();
            alert('Thank you for your order! We will process it shortly.');
            fetchMenu();
        } else {
            alert('Order failed: ' + (result.error || 'Unknown error'));
        }
    } catch(err){
        console.error('Order error:', err);
        alert('Failed to submit order: ' + err.message);
    }
}

/* ---------- MENU PAGE WITH SEARCH ---------- */
const menuPage=document.getElementById('menuPage');
const menuNavLink=document.getElementById('menuNavLink');
const menuCategoryList=document.getElementById('menuCategoryList');
const menuItemsGrid=document.getElementById('menuItemsGrid');
const menuSearchBar=document.getElementById('menuSearchBar');

menuNavLink.addEventListener('click', e=>{
    e.preventDefault(); 
    showMenuPage(); 
    setActiveNav('Menu');
    if (MENU.length > 0) {
        const firstCategory = [...new Set(MENU.map(i=>i.type))][0];
        if (firstCategory) renderMenuItems(firstCategory);
    }
});

// Menu search functionality
menuSearchBar.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    if(query === '') {
        // Show all items from current category
        const activeCategory = document.querySelector('#menuCategoryList li.active');
        if(activeCategory) {
            renderMenuItems(activeCategory.textContent);
        }
        return;
    }
    
    const filtered = MENU.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
    );
    
    document.getElementById('menuCategoryTitle').textContent = `Search Results (${filtered.length})`;
    menuItemsGrid.innerHTML = '';
    
    if(filtered.length === 0) {
        menuItemsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#999;">No products found</p>';
        return;
    }
    
    filtered.forEach(item => {
    const c = document.createElement('div');
    c.className = 'card';
    
    let imageSrc = 'placeholder.png';
    if (item.image) {
        imageSrc = item.image.startsWith('uploads/') ? `${API_URL}/${item.image}` : item.image;
    }
    
    const uniqueId = `${item.name}_${item.size}`;
    const isOutOfStock = item.stock <= 0;
    
    c.innerHTML = `
        <div class="thumb" style="background-image:url('${imageSrc}')"></div>
        <h3>${item.name}</h3>
        <p class="muted">${item.size} - ₱${parseFloat(item.price).toFixed(2)}</p>
        ${isOutOfStock 
            ? '<p style="color:#d91f2a;font-weight:600;margin-top:8px;">Not Available</p>' 
            : `<button class="add" data-id="${uniqueId}">Add to Cart</button>`
        }
    `;
    menuItemsGrid.appendChild(c);
});
    attachAddButtons(menuItemsGrid);
});

const homeNavLink=document.querySelector('.nav-links li:first-child a');
homeNavLink.addEventListener('click', e=>{
    e.preventDefault(); 
    document.querySelector('.hero').style.display='block';
    document.querySelector('#menu').style.display='block';
    menuPage.style.display='none';
    document.getElementById('purchaseHistory').style.display='none';
    document.getElementById('messageNotifications').style.display='none';
    setActiveNav('Home');
});

function showMenuPage(){
    document.querySelector('.hero').style.display='none';
    document.querySelector('#menu').style.display='none';
    menuPage.style.display='block';
    document.getElementById('purchaseHistory').style.display='none';
    document.getElementById('messageNotifications').style.display='none';
}

function setActiveNav(linkText){ 
    document.querySelectorAll('.nav-links li').forEach(li=>{ 
        li.classList.remove('active'); 
        if(li.textContent.trim()===linkText) li.classList.add('active'); 
    }); 
}

function renderMenuCategories(){
    menuCategoryList.innerHTML='';
    const uniqueCats=[...new Set(MENU.map(i=>i.type))];
    
    if (uniqueCats.length === 0) {
        menuCategoryList.innerHTML = '<li style="color:#999;">No categories</li>';
        return;
    }
    
    uniqueCats.forEach(c=>{
        const li=document.createElement('li'); 
        li.textContent=c;
        li.addEventListener('click', ()=> {
            menuCategoryList.querySelectorAll('li').forEach(item => item.classList.remove('active'));
            li.classList.add('active');
            menuSearchBar.value = ''; // Clear search
            renderMenuItems(c);
        });
        menuCategoryList.appendChild(li);
    });
    
    if (menuCategoryList.firstChild) {
        menuCategoryList.firstChild.classList.add('active');
    }
}

function renderMenuItems(category){
    const menuCategoryTitle = document.getElementById('menuCategoryTitle');
    if (menuCategoryTitle) {
        menuCategoryTitle.textContent = category;
    }
    
    menuItemsGrid.innerHTML='';
    const items = MENU.filter(i=>i.type===category);
    
    if (items.length === 0) {
        menuItemsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#999;">No items in this category</p>';
        return;
    }
    
    items.forEach(item=>{
        const c=document.createElement('div'); 
        c.className='card';
        
        let imageSrc = 'placeholder.png';
        if (item.image) {
            if (item.image.startsWith('uploads/')) {
                imageSrc = `${API_URL}/${item.image}`;
            } else {
                imageSrc = item.image;
            }
        }
        
        const uniqueId = `${item.name}_${item.size}`;
        const isOutOfStock = item.stock <= 0;
        
        c.innerHTML=`
            <div class="thumb" style="background-image:url('${imageSrc}')"></div>
            <h3>${item.name}</h3>
            <p class="muted">${item.size} - ₱${parseFloat(item.price).toFixed(2)}</p>
            ${isOutOfStock 
                ? '<p style="color:#d91f2a;font-weight:600;margin-top:8px;">Not Available</p>' 
                : `<button class="add" data-id="${uniqueId}">Add to Cart</button>`
            }
        `;
        menuItemsGrid.appendChild(c);
    });
    attachAddButtons(menuItemsGrid);
}

function attachAddButtons(grid){
    grid.querySelectorAll('.add').forEach(btn=>{
        btn.addEventListener('click', (e)=>{
            e.stopPropagation();
            addToCart(btn.dataset.id);
        });
    });
}
/* ---------- PURCHASE HISTORY ---------- */
document.getElementById('purchaseHistoryLink').addEventListener('click', async (e) => {
    e.preventDefault();
    showPurchaseHistory();
    setActiveNav('Purchase History');
});

async function showPurchaseHistory() {
    document.querySelector('.hero').style.display='none';
    document.querySelector('#menu').style.display='none';
    menuPage.style.display='none';
    document.getElementById('messageNotifications').style.display='none';
    document.getElementById('purchaseHistory').style.display='block';
    
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    if(!loggedInUser) {
        alert('Please login first');
        window.location.href = 'user_login.html';
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/customer_orders.php?email=${encodeURIComponent(loggedInUser.email)}`);
        const orders = await res.json();
        
        const historyContent = document.getElementById('purchaseHistoryContent');
        historyContent.innerHTML = '';
        
        const completedOrders = orders.filter(o => 
            o.status === 'delivered' || 
            o.status === 'ready_for_pickup' || 
            o.status === 'already_picked_up'
        );
        
        if(completedOrders.length === 0) {
            historyContent.innerHTML = '<p style="text-align:center;color:#999;">No purchase history yet</p>';
            return;
        }
        
        completedOrders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.style.cssText = 'background:#fff;padding:24px;margin-bottom:20px;border-radius:14px;box-shadow:0 4px 12px rgba(0,0,0,0.08);border-left:4px solid #28a745;';
            
            const itemsList = order.items.map(item => 
                `<li style="margin-bottom:5px;">${item.product_name} (${item.product_size}) x ${item.quantity} - ₱${parseFloat(item.price * item.quantity).toFixed(2)}</li>`
            ).join('');
            
            const statusText = order.status === 'already_picked_up' ? 'Picked Up' : order.status === 'ready_for_pickup' ? 'Ready for Pickup' : 'Delivered';
            const statusColor = order.status === 'already_picked_up' || order.status === 'delivered' ? '#28a745' : '#ffc107';
            
            orderCard.innerHTML = `
                <div style="display:flex;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid rgba(0,0,0,0.06);">
                    <div>
                        <strong style="color:#d91f2a;font-size:18px;">Order #${order.id}</strong>
                        <div style="margin-top:4px;">
                            <span style="background:${statusColor};color:white;padding:4px 10px;border-radius:6px;font-size:13px;font-weight:600;">${statusText}</span>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:#999;font-size:14px;">${new Date(order.created_at).toLocaleDateString()}</div>
                        <div style="color:#666;font-size:13px;margin-top:2px;">${new Date(order.created_at).toLocaleTimeString()}</div>
                    </div>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:16px;">
                    <div>
                        <h4 style="margin:0 0 8px;font-size:14px;color:#666;">Customer Details</h4>
                        <div style="font-size:14px;line-height:1.8;">
                            <strong>Name:</strong> ${order.customer_name}<br>
                            <strong>Contact:</strong> ${order.customer_contact}<br>
                            <strong>Email:</strong> ${order.customer_email}
                        </div>
                    </div>
                    <div>
                        <h4 style="margin:0 0 8px;font-size:14px;color:#666;">Delivery Details</h4>
                        <div style="font-size:14px;line-height:1.8;">
                            <strong>Type:</strong> ${order.delivery_type === 'delivery' ? 'Delivery' : 'Pick Up'}<br>
                            ${order.delivery_location ? '<strong>Location:</strong> ' + order.delivery_location + '<br>' : ''}
                            ${order.recipient_name ? '<strong>Recipient:</strong> ' + order.recipient_name + '<br>' : ''}
                            ${order.delivery_person ? '<strong>Delivered by:</strong> ' + order.delivery_person + '<br>' : ''}
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom:16px;">
                    <h4 style="margin:0 0 8px;font-size:14px;color:#666;">Items Ordered</h4>
                    <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;">${itemsList}</ul>
                </div>
                
                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:2px solid rgba(0,0,0,0.06);">
                    <div style="font-size:14px;">
                        <strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:13px;color:#666;">Total Amount</div>
                        <div style="font-size:24px;font-weight:700;color:#28a745;">₱${parseFloat(order.total).toFixed(2)}</div>
                    </div>
                </div>
            `;
            
            historyContent.appendChild(orderCard);
        });
        
    } catch(err) {
        console.error('Purchase history error:', err);
        alert('Failed to load purchase history');
    }
}

/* ---------- MESSAGE NOTIFICATIONS ---------- */
document.getElementById('messageNotificationsLink').addEventListener('click', async (e) => {
    e.preventDefault();
    showMessageNotifications();
    setActiveNav('Message Notifications');
});

async function showMessageNotifications() {
    document.querySelector('.hero').style.display='none';
    document.querySelector('#menu').style.display='none';
    menuPage.style.display='none';
    document.getElementById('purchaseHistory').style.display='none';
    document.getElementById('messageNotifications').style.display='block';
    
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    if(!loggedInUser) {
        alert('Please login first');
        window.location.href = 'user_login.html';
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/customer_orders.php?email=${encodeURIComponent(loggedInUser.email)}`);
        const orders = await res.json();
        
        const notifContent = document.getElementById('messageNotificationsContent');
        notifContent.innerHTML = '';
        
        const activeOrders = orders.filter(o =>
            o.status !== 'delivered' &&
            o.status !== 'already_picked_up'
        );
        
        if(activeOrders.length === 0) {
            notifContent.innerHTML = '<p style="text-align:center;color:#999;">No active orders</p>';
            return;
        }
        
        activeOrders.forEach(order => {
            const notifCard = document.createElement('div');
            notifCard.style.cssText = 'background:#fff;padding:20px;margin-bottom:16px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);border-left:4px solid #d91f2a;';
            
            let message = '';
            let icon = '';
            
            if(order.status === 'pending') {
                icon = '• • •';
                message = `Your order is pending and will be processed soon.<br><strong>Amount to prepare:</strong> ₱${parseFloat(order.total).toFixed(2)}`;
            } else if(order.status === 'processing') {
                icon = '⏳';
                message = `Your order is being prepared!<br><strong>Amount to prepare:</strong> ₱${parseFloat(order.total).toFixed(2)}`;
            } else if(order.status === 'out_for_delivery') {
                icon = '📍';
                const deliveryPerson = order.delivery_person || 'our staff';
                message = `Your order is out for delivery!<br><strong>Please prepare exact amount:</strong> ₱${parseFloat(order.total).toFixed(2)}<br><strong>To be delivered by:</strong> ${deliveryPerson}`;
            } else if(order.status === 'ready_for_pickup') {
                icon = '🛍️';
                message = `Your order is ready for pickup!<br><strong>Amount to pay:</strong> ₱${parseFloat(order.total).toFixed(2)}<br>Please come to our store to collect your order.`;
            } else if(order.status === 'cancelled') {
                icon = '🚫';
                message = 'Your order has been cancelled. Please contact us for more information.';
            }
            
            notifCard.innerHTML = `
                <div style="display:flex;gap:12px;margin-bottom:10px;">
                    <div style="font-size:28px;">${icon}</div>
                    <div style="flex:1;">
                        <div style="margin-bottom:8px;">
                            <strong style="color:#d91f2a;font-size:16px;">Order #${order.id}</strong>
                            <span style="float:right;color:#999;font-size:13px;">${new Date(order.updated_at).toLocaleString()}</span>
                        </div>
                        <p style="margin:0;line-height:1.8;font-size:14px;">${message}</p>
                        <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(0,0,0,0.06);font-size:13px;color:#666;">
                            <strong>Delivery:</strong> ${order.delivery_type === 'delivery' ? order.delivery_location : 'Pick Up'}
                        </div>
                    </div>
                </div>
            `;
            
            notifContent.appendChild(notifCard);
        });
        
    } catch(err) {
        console.error('Notifications error:', err);
        alert('Failed to load notifications');
    }
}
// Logout functionality with confirmation prompt
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', () => {
    // Show confirmation dialog
    const confirmLogout = confirm('Are you sure you want to logout?');
    
    if (confirmLogout) {
        // User clicked "OK" - proceed with logout
        localStorage.removeItem('loggedInUser'); // Clear user login data
        alert('You have been logged out successfully.');
        window.location.href = 'user_login.html'; // Redirect to login page
    }
    // If user clicked "Cancel", nothing happens
});
/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
    fetchMenu();
    console.log('Ordering system loaded. API URL:', API_URL);
});


