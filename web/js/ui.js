import { categories, products, flashSaleProducts, reviews } from './data.js';

export let currentSlide = 0;
export let isDark = localStorage.getItem('luxury_theme') === 'dark';

// Áp dụng ngay giao diện tối nếu trước đó người dùng đã chọn
if (isDark) {
  document.documentElement.setAttribute('data-theme', 'dark');
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
});
export let slideInterval;
export let endTime;

export function formatPrice(n) { return n.toLocaleString('vi-VN') + '₫'; }

export function showToast(msg, type='success') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${type==='success'?'✅':'❌'}</span><span>${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

export function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  if(!grid) return;
  grid.innerHTML = categories.map(c => `
    <a class="cat-card reveal" onclick="window.filterByCategory('${c.name}')" href="products.html">
      <span class="cat-icon">${c.icon}</span>
      <div class="cat-name">${c.name}</div>
      <div class="cat-count">${c.count}</div>
    </a>
  `).join('');
}

export function renderProducts(filter = 'Tất cả') {
  const filters = ['Tất cả', 'Thời trang', 'Điện tử', 'Giày dép', 'Đồng hồ'];
  const filterBar = document.getElementById('filterBar');
  if (filterBar) {
    filterBar.innerHTML = `
      <span style="font-weight:600;font-size:0.9rem;color:var(--text-muted);margin-right:8px">Lọc:</span>
      ${filters.map(f => `<button class="filter-chip ${f===filter?'active':''}" onclick="window.renderProducts('${f}')">${f}</button>`).join('')}
      <div style="margin-left:auto;display:flex;align-items:center;gap:8px">
        <span style="font-size:0.85rem;color:var(--text-muted)">Sắp xếp:</span>
        <select onchange="window.handleSort(this.value)" style="padding:8px 12px;border-radius:8px;border:1.5px solid var(--border);background:var(--card);color:var(--text);font-family:inherit;font-size:0.85rem;outline:none;cursor:pointer">
          <option>Nổi bật nhất</option>
          <option>Giá tăng dần</option>
          <option>Giá giảm dần</option>
          <option>Mới nhất</option>
          <option>Đánh giá cao</option>
        </select>
      </div>
    `;
  }
  let filtered = filter === 'Tất cả' ? products : products.filter(p => p.cat.includes(filter) || (filter==='Thời trang' && p.cat==='Thời trang'));
  const grid = document.getElementById('productsGrid');
  if(!grid) return;
  grid.innerHTML = filtered.map(p => {
    const discount = p.oldPrice ? Math.round((1-p.price/p.oldPrice)*100) : 0;
    return `
    <div class="product-card reveal" onclick="window.openProduct(${p.id})">
      <div class="product-img">
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:6rem;background:var(--bg2)">${p.icon}</div>
        <div class="product-badges">${p.badges.map(b=>`<span class="badge badge-${b}">${b==='new'?'MỚI':b==='sale'?'SALE':b==='hot'?'🔥 HOT':b.toUpperCase()}</span>`).join('')}</div>
        <div class="product-actions">
          <button class="action-btn" onclick="event.stopPropagation();window.addWishlist(${p.id})" title="Yêu thích">❤️</button>
          <button class="action-btn" onclick="event.stopPropagation();window.openProduct(${p.id})" title="Xem nhanh">👁</button>
          <button class="action-btn" onclick="event.stopPropagation();window.addToCart(${p.id})" title="Thêm giỏ">🛒</button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-cat">${p.cat}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating"><span class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5-Math.floor(p.rating))}</span><span class="rating-count">${p.rating} (${p.reviews})</span></div>
        <div class="product-price"><span class="price-current">${formatPrice(p.price)}</span>${p.oldPrice?`<span class="price-old">${formatPrice(p.oldPrice)}</span><span class="price-off">-${discount}%</span>`:''}</div>
        <button class="add-cart-btn" onclick="event.stopPropagation();window.addToCart(${p.id})">🛒 Thêm vào giỏ</button>
      </div>
    </div>`;
  }).join('');
  setupObserver();
}

export function renderFlashSale() {
  const grid = document.getElementById('flashGrid');
  if(!grid) return;
  grid.innerHTML = flashSaleProducts.map(p => `
    <div class="flash-card reveal" onclick="window.showToast('Thêm ${p.name} vào giỏ hàng!','success')">
      <div class="flash-img">${p.icon}<div class="flash-progress"><div class="flash-progress-bar" style="width:${p.progress}%"></div></div></div>
      <div class="flash-info">
        <div class="flash-name">${p.name}</div>
        <div class="flash-price"><span class="flash-price-cur">${formatPrice(p.price)}</span><span class="flash-price-old">${formatPrice(p.oldPrice)}</span><span style="background:var(--accent);color:white;font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:6px;margin-left:auto">-${p.off}%</span></div>
        <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);margin-top:8px">Đã bán: ${p.progress}%</div>
      </div>
    </div>
  `).join('');
}

export function renderReviews() {
  const grid = document.getElementById('reviewsGrid');
  if(!grid) return;
  grid.innerHTML = reviews.map(r => `
    <div class="review-card reveal">
      <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
      <p class="review-text">${r.text}</p>
      <div class="reviewer"><div class="reviewer-avatar">${r.avatar}</div><div><div class="reviewer-name">${r.name}</div><div class="reviewer-info">${r.info}</div></div></div>
    </div>
  `).join('');
}

export function openProduct(id) {
  const p = products.find(x => x.id===id);
  if(!p) return;
  const discount = p.oldPrice ? Math.round((1-p.price/p.oldPrice)*100) : 0;
  document.getElementById('modalGrid').innerHTML = `
    <div class="modal-img">${p.icon}</div>
    <div class="modal-info">
      <div class="modal-cat">${p.cat}</div><div class="modal-name">${p.name}</div>
      <div class="modal-rating"><span style="color:#f4a261;font-size:1rem">${'★'.repeat(Math.floor(p.rating))}</span><span style="font-size:0.9rem;color:var(--text-muted);font-weight:600">${p.rating} · ${p.reviews} đánh giá</span></div>
      <p class="modal-desc">${p.desc}</p>
      <div class="modal-price-row"><span class="modal-price">${formatPrice(p.price)}</span>${p.oldPrice?`<span class="modal-old">${formatPrice(p.oldPrice)}</span><span style="background:rgba(230,57,70,0.1);color:var(--accent);padding:4px 10px;border-radius:8px;font-size:0.8rem;font-weight:700">-${discount}%</span>`:''}</div>
      <div style="margin-bottom:20px"><div style="font-size:0.85rem;font-weight:600;margin-bottom:10px;color:var(--text-muted)">Kích thước:</div><div style="display:flex;gap:8px">${['S','M','L','XL','XXL'].map(s=>`<button onclick="window.selectSize(this)" style="padding:8px 16px;border-radius:10px;border:1.5px solid var(--border);background:var(--card);cursor:pointer;font-family:inherit;font-weight:600;color:var(--text);transition:all 0.2s">${s}</button>`).join('')}</div></div>
      <div class="modal-actions"><button class="btn-primary" onclick="window.addToCart(${p.id});window.closeProductModal()" style="width:100%;justify-content:center;border-radius:12px">🛒 Thêm vào giỏ</button><button class="btn-secondary" onclick="window.closeProductModal()" style="width:100%;justify-content:center;border-radius:12px">❤️ Yêu thích</button></div>
    </div>`;
  document.getElementById('productModal').classList.add('open');
}

export function closeProductModal() { document.getElementById('productModal').classList.remove('open'); }
export function closeModal(e) { if(e.target===document.getElementById('productModal')) closeProductModal(); }
export function selectSize(btn) {
  btn.closest('div').querySelectorAll('button').forEach(b => b.style.cssText='padding:8px 16px;border-radius:10px;border:1.5px solid var(--border);background:var(--card);cursor:pointer;font-family:inherit;font-weight:600;color:var(--text);transition:all 0.2s');
  btn.style.cssText='padding:8px 16px;border-radius:10px;border:2px solid var(--accent);background:rgba(230,57,70,0.1);cursor:pointer;font-family:inherit;font-weight:700;color:var(--accent);transition:all 0.2s';
}

export function toggleSearch() { document.getElementById('searchOverlay').classList.toggle('open'); setTimeout(() => { const i = document.getElementById('bigSearchInput'); if(i) i.focus(); }, 100); }
export function closeSearch(e) { if(e.target === document.getElementById('searchOverlay')) toggleSearch(); }
export function handleSearch(v) { if(v.length > 1) showToast(`Đang tìm: "${v}"...`, 'success'); }
export function goSlide(n) { currentSlide = n; const t = document.getElementById('slidesTrack'); if(t) t.style.transform = `translateX(-${n*100}%)`; document.querySelectorAll('.dot').forEach((d,i) => d.classList.toggle('active', i===n)); }
export function changeSlide(d) { goSlide((currentSlide+d+3)%3); }
export function startSlider() { slideInterval = setInterval(() => changeSlide(1), 5000); }
export function startCountdown() { endTime = new Date().getTime() + 8*3600000 + 45*60000 + 30000; updateCountdown(); }
export function updateCountdown() {
  if (!document.getElementById('countH')) return;
  const diff = endTime - new Date().getTime();
  if(diff < 0) { endTime = new Date().getTime() + 12*3600000; return; }
  document.getElementById('countH').textContent = String(Math.floor(diff/3600000)).padStart(2,'0');
  document.getElementById('countM').textContent = String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
  document.getElementById('countS').textContent = String(Math.floor((diff%60000)/1000)).padStart(2,'0');
}
export function toggleTheme() { isDark = !isDark; document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light'); localStorage.setItem('luxury_theme', isDark ? 'dark' : 'light'); const btn = document.querySelector('.theme-toggle'); if(btn) btn.textContent = isDark ? '☀️' : '🌙'; }
export function setupObserver() {
  const obs = new IntersectionObserver(entries => { entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }); }, {threshold:0.1, rootMargin:'0px 0px -50px 0px'});
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}
export function setupNavScroll() { window.addEventListener('scroll', () => { const nb = document.getElementById('navbar'); if (nb) nb.classList.toggle('scrolled', window.scrollY > 50); }); }
export function filterByCategory(cat) { localStorage.setItem('luxury_filter', cat); }
export function openCategory(name) { showToast(`Đang xem: ${name}`, 'success'); }
export function addWishlist(id) { const p = products.find(x => x.id===id); if(p) showToast(`❤️ Đã thêm "${p.name}" vào danh sách yêu thích!`, 'success'); }
export function handleSort(v) { showToast(`Sắp xếp theo: ${v}`, 'success'); }
export function subscribe() { const e = document.getElementById('emailInput')?.value; if(!e) { showToast('Vui lòng nhập email!','error'); return; } showToast(`✅ Đăng ký thành công: ${e}`, 'success'); document.getElementById('emailInput').value = ''; }
export function toggleMenu() { showToast('📱 Menu mobile đang được phát triển','success'); }