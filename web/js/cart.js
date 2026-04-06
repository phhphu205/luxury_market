import { products } from './data.js';

export let cart = [];

export function getCart() {
    if (window.currentUser) {
        cart = JSON.parse(localStorage.getItem("luxury_cart_" + window.currentUser.username)) || [];
    } else { cart = []; }
    return cart;
}

export function addToCart(id) {
  if (!window.currentUser) {
    window.location.href = window.location.pathname.includes('/html/') ? 'auth.html' : 'html/auth.html';
    return;
  }
  const product = products.find(p => p.id === id);
  const existingItem = getCart().find(item => item.id === id);
  if (existingItem) existingItem.qty++;
  else cart.push({...product, qty: 1});
  saveCart(); renderCart(); updateNavBadge();
  window.showToast("✅ Đã thêm sản phẩm vào giỏ hàng", "success");
}

export function removeFromCart(id) { getCart(); cart = cart.filter(c => c.id !== id); saveCart(); renderCart(); updateNavBadge(); }
export function changeQty(id, delta) { getCart(); const item = cart.find(c => c.id === id); if(!item) return; item.qty += delta; if(item.qty <= 0) removeFromCart(id); else { saveCart(); renderCart(); } }
export function saveCart() { if (!window.currentUser) return; localStorage.setItem("luxury_cart_" + window.currentUser.username, JSON.stringify(cart)); }

export function updateNavBadge() {
  getCart(); const total = cart.reduce((s,c) => s+c.qty, 0); const badge = document.getElementById('cartBadge');
  if (badge) { badge.textContent = total; badge.style.display = total > 0 ? 'flex' : 'none'; }
}

export function renderCart() {
  getCart();
  const container = document.getElementById('cartItems'); const footer = document.getElementById('cartFooter');
  if (!container) return;
  if(cart.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:60px 0;color:var(--text-muted)"><div style="font-size:4rem;margin-bottom:16px">🛒</div><p style="font-weight:600">Giỏ hàng trống</p><p style="font-size:0.85rem;margin-top:8px">Hãy thêm sản phẩm vào giỏ nhé!</p></div>`;
    if (footer) footer.style.display = 'none';
  } else {
    const total = cart.reduce((s,c) => s+c.price*c.qty, 0);
    container.innerHTML = cart.map(c => `<div class="cart-item"><div class="cart-item-img">${c.icon}</div><div class="cart-item-info"><div class="cart-item-name">${c.name}</div><div class="cart-item-price">${window.formatPrice(c.price)}</div><div class="cart-item-qty"><button class="qty-btn" onclick="window.changeQty(${c.id},-1)">−</button><span class="qty-num">${c.qty}</span><button class="qty-btn" onclick="window.changeQty(${c.id},1)">+</button></div></div><button class="remove-item" onclick="window.removeFromCart(${c.id})">🗑</button></div>`).join('');
    document.getElementById('cartSubtotal').textContent = window.formatPrice(total); document.getElementById('cartTotal').textContent = window.formatPrice(total);
    if (footer) footer.style.display = 'block';
  }
}
export function toggleCart() { document.getElementById('cartSidebar').classList.toggle('open'); document.getElementById('cartOverlay').classList.toggle('open'); }
export function checkout() { 
  getCart(); 
  if(cart.length === 0) return window.showToast('Giỏ hàng trống!','error'); 
  if (!window.currentUser) {
    window.location.href = window.location.pathname.includes('/html/') ? 'auth.html' : 'html/auth.html';
    return;
  }
  toggleCart(); 
  setTimeout(() => { window.showToast('🎉 Cảm ơn bạn đã đặt hàng!!!','success'); cart = []; saveCart(); renderCart(); updateNavBadge(); }, 300); 
}