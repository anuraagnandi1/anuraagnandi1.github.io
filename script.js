
const products = window.SHAWARMAZED_PRODUCTS || [];
let currentFilter = "All";
let cart = JSON.parse(localStorage.getItem("shawarmazedCart") || "{}");

const grid = document.getElementById("productGrid");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const checkoutModal = document.getElementById("checkoutModal");
const toast = document.getElementById("toast");

function spiceText(level){
  if(level === 3) return "🌶️🌶️🌶️ Fiery";
  if(level === 2) return "🌶️🌶️ Medium";
  return "🌶️ Mild";
}

function renderProducts(){
  const shown = products.filter(p => {
    if(currentFilter === "All") return true;
    if(currentFilter === "Spicy") return p.spice === 3;
    return p.cat === currentFilter;
  });
  grid.innerHTML = shown.map((p) => {
    const idx = products.indexOf(p);
    return `
      <article class="product-card card-tone-${idx % 4}">
        <div class="product-visual">
          <span class="product-badge">${p.cat} · ${p.tag}</span>
          <img class="product-photo" src="${p.img}" alt="${p.name}" loading="lazy" referrerpolicy="no-referrer" />
        </div>
        <div class="product-body">
          <h3>${p.name}</h3>
          <div class="product-meta">
            <span class="spice">${spiceText(p.spice)}</span>
            <span class="price">₹${p.price}</span>
          </div>
          <button class="add-btn" onclick="addToCart(${idx})">Add to order +</button>
        </div>
      </article>
    `;
  }).join("");
}
renderProducts();

document.querySelectorAll(".filter").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderProducts();
  });
});

function saveCart(){
  localStorage.setItem("shawarmazedCart", JSON.stringify(cart));
  renderCart();
}

window.addToCart = function(index){
  cart[index] = (cart[index] || 0) + 1;
  saveCart();
  showToast("Added. Excellent decision.");
}

function updateQty(index, delta){
  cart[index] = (cart[index] || 0) + delta;
  if(cart[index] <= 0) delete cart[index];
  saveCart();
}
window.updateQty = updateQty;

function removeItem(index){
  delete cart[index];
  saveCart();
}
window.removeItem = removeItem;

function getCartRows(){
  return Object.entries(cart).map(([i,qty])=>({i:Number(i),qty,p:products[Number(i)]})).filter(x=>x.p);
}

function renderCart(){
  const rows = getCartRows();
  const count = rows.reduce((s,x)=>s+x.qty,0);
  const total = rows.reduce((s,x)=>s+x.qty*x.p.price,0);
  cartCount.textContent = count;
  cartTotal.textContent = `₹${total}`;
  cartEmpty.style.display = rows.length ? "none" : "flex";
  cartItems.style.display = rows.length ? "flex" : "none";
  cartItems.innerHTML = rows.map(({i,qty,p})=>`
    <div class="cart-item">
      <div>
        <h4>${p.name}</h4>
        <div class="item-price">₹${p.price * qty}</div>
        <div class="qty">
          <button onclick="updateQty(${i},-1)">−</button>
          <strong>${qty}</strong>
          <button onclick="updateQty(${i},1)">+</button>
        </div>
      </div>
      <button class="remove" onclick="removeItem(${i})">Remove</button>
    </div>
  `).join("");
}
renderCart();

function openCart(){
  cartDrawer.classList.add("open");
  overlay.classList.add("show");
  document.body.classList.add("cart-open");
}
function closeCart(){
  cartDrawer.classList.remove("open");
  overlay.classList.remove("show");
  document.body.classList.remove("cart-open");
}
document.getElementById("cartButton").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
overlay.addEventListener("click",closeCart);

document.getElementById("checkoutBtn").addEventListener("click",()=>{
  const rows = getCartRows();
  if(!rows.length){ showToast("Your cart needs a shawarma first."); return; }
  const total = rows.reduce((s,x)=>s+x.qty*x.p.price,0);
  document.getElementById("orderPreview").innerHTML = `
    <strong>Order summary</strong><br>
    ${rows.map(x=>`${x.qty} × ${x.p.name} — ₹${x.qty*x.p.price}`).join("<br>")}
    <br><strong>Total: ₹${total}</strong>
  `;
  closeCart();
  checkoutModal.classList.add("open");
  document.body.classList.add("modal-open");
});
document.getElementById("closeCheckout").addEventListener("click",()=>{
  checkoutModal.classList.remove("open");
  document.body.classList.remove("modal-open");
});

document.getElementById("checkoutForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const orderNo = "SZ" + Math.floor(1000 + Math.random()*9000);
  cart = {};
  saveCart();
  checkoutModal.classList.remove("open");
  document.body.classList.remove("modal-open");
  showToast(`Order ${orderNo} placed — you’re about to be Shawarmazed.`);
  e.target.reset();
});

function showToast(message){
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>toast.classList.remove("show"),2600);
}
