const API_URL = 'http://localhost:3000/api/products'; // Node.js backend

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
    const res=await fetch(API_URL);
    const data=await res.json();
    MENU=Object.values(data); // convert object to array
    renderMenuCards();
    renderMenuCategories();
}

const menuCards=document.getElementById('menuCards');

function renderMenuCards(){
    menuCards.innerHTML='';
    MENU.forEach(item=>{
        const c=document.createElement('div'); c.className='card';
        c.innerHTML=`
            <div class="thumb" style="background-image:url('${item.image}')"></div>
            <h3>${item.name}</h3>
            <p class="muted">Delicious & fresh</p>
            <div class="meta">
                <div class="price">₱${parseFloat(item.price).toFixed(2)}</div>
                <button class="add" data-id="${item.name}">Add</button>
            </div>
        `;
        menuCards.appendChild(c);
    });
    attachAddButtons(menuCards);
}

function attachAddButtons(grid){
    grid.querySelectorAll('.add').forEach(btn=>{
        btn.addEventListener('click', ()=>{
            addToCart(btn.dataset.id);
        });
    });
}

function addToCart(name){
    const item=MENU.find(i=>i.name===name);
    if(!cart[name]) cart[name]={...item, qty:0};
    cart[name].qty+=1;
    updateCartUI(); openCart();
}

/* Cart UI */
const cartPane=document.getElementById('cartPane');
const cartList=document.getElementById('cartList');
const subtotalEl=document.getElementById('subtotal');

function updateCartUI(){
    cartList.innerHTML='';
    const keys=Object.keys(cart);
    if(keys.length===0){ cartList.innerHTML='<div class="muted">Your cart is empty.</div>'; subtotalEl.textContent='₱0.00'; return; }
    let subtotal=0;
    keys.forEach(k=>{
        const it=cart[k]; subtotal+=parseFloat(it.price)*it.qty;
        const row=document.createElement('div'); row.className='cart-row';
        row.innerHTML=`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0">
                <div>
                    <div style="font-weight:600">${it.name}</div>
                    <div class="muted" style="font-size:13px">₱${parseFloat(it.price).toFixed(2)} × ${it.qty}</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;">
                    <button class="small" data-op="inc" data-id="${it.name}">＋</button>
                    <button class="small" data-op="dec" data-id="${it.name}">−</button>
                </div>
            </div>
        `;
        cartList.appendChild(row);
    });
    subtotalEl.textContent=`₱${subtotal.toFixed(2)}`;
    cartList.querySelectorAll('button[data-op]').forEach(b=>{
        b.addEventListener('click', ()=>{
            const id=b.dataset.id, op=b.dataset.op;
            if(op==='inc') cart[id].qty+=1;
            if(op==='dec'){ cart[id].qty-=1; if(cart[id].qty<=0) delete cart[id]; }
            updateCartUI();
        });
    });
}

document.getElementById('openCartBtn').addEventListener('click', openCart);
document.getElementById('closeCartBtn').addEventListener('click', closeCart);
document.getElementById('checkoutBtn').addEventListener('click', ()=>{
    if(Object.keys(cart).length===0){ alert('Cart is empty'); return; }
    alert('Demo order placed. Thank you!');
    cart={}; updateCartUI(); closeCart();
});

function openCart(){ cartPane.classList.add('open'); cartPane.setAttribute('aria-hidden','false'); }
function closeCart(){ cartPane.classList.remove('open'); cartPane.setAttribute('aria-hidden','true'); }

/* ---------- MENU PAGE ---------- */
const menuPage=document.getElementById('menuPage');
const menuNavLink=document.getElementById('menuNavLink');
const menuCategoryList=document.getElementById('menuCategoryList');
const menuItemsGrid=document.getElementById('menuItemsGrid');
const menuCategoryTitle=document.getElementById('menuCategoryTitle');

const CATEGORIES=[...new Set(MENU.map(i=>i.type))];

menuNavLink.addEventListener('click', e=>{
    e.preventDefault(); showMenuPage(); setActiveNav('Menu');
});

const homeNavLink=document.querySelector('.nav-links li:first-child a');
homeNavLink.addEventListener('click', e=>{
    e.preventDefault(); document.querySelector('.hero').style.display='block';
    document.querySelector('#menu').style.display='grid';
    menuPage.style.display='none';
    setActiveNav('Home');
});

function showMenuPage(){
    document.querySelector('.hero').style.display='none';
    document.querySelector('#menu').style.display='none';
    menuPage.style.display='block';
}

function setActiveNav(linkText){ document.querySelectorAll('.nav-links li').forEach(li=>{ li.classList.remove('active'); if(li.textContent.trim()===linkText) li.classList.add('active'); }); }

function renderMenuCategories(){
    menuCategoryList.innerHTML='';
    const uniqueCats=[...new Set(MENU.map(i=>i.type))];
    uniqueCats.forEach(c=>{
        const li=document.createElement('li'); li.textContent=c;
        li.addEventListener('click', ()=> renderMenuItems(c));
        menuCategoryList.appendChild(li);
    });
}

function renderMenuItems(category){
    menuCategoryTitle.textContent=category;
    menuItemsGrid.innerHTML='';
    MENU.filter(i=>i.type===category).forEach(item=>{
        const c=document.createElement('div'); c.className='card';
        c.innerHTML=`
            <div class="thumb" style="background-image:url('${item.image}')"></div>
            <h3>${item.name}</h3>
            <p class="muted">₱${parseFloat(item.price).toFixed(2)}</p>
            <button class="add" data-id="${item.name}">Add</button>
        `;
        menuItemsGrid.appendChild(c);
    });
    attachAddButtons(menuItemsGrid);
}

/* ---------- INIT ---------- */
fetchMenu();
