import * as UI from './ui.js';
import * as Auth from './auth.js';
import * as Cart from './cart.js';

// Cấp phát các hàm cho đối tượng Window để hoạt động bình thường với thẻ HTML (onclick="..." vv...)
Object.assign(window, UI);
Object.assign(window, Auth);
Object.assign(window, Cart);

document.addEventListener('keydown', e => {
  if(e.key === 'Escape') { UI.closeProductModal(); const s = document.getElementById('searchOverlay'); if(s) s.classList.remove('open'); }
  if((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); UI.toggleSearch(); }
});

document.querySelectorAll("img").forEach(img => img.setAttribute("loading", "lazy"));

function init() {
  if (document.getElementById('categoriesGrid')) UI.renderCategories();
  if (document.getElementById('productsGrid')) UI.renderProducts();
  if (document.getElementById('flashGrid')) UI.renderFlashSale();
  if (document.getElementById('reviewsGrid')) UI.renderReviews();

  if (document.getElementById('bannerSlider')) {
    UI.startSlider();
    document.getElementById('bannerSlider').addEventListener('mouseenter', () => clearInterval(UI.slideInterval));
    document.getElementById('bannerSlider').addEventListener('mouseleave', () => UI.startSlider());
  }

  if (document.getElementById('countH')) {
    UI.startCountdown();
    setInterval(UI.updateCountdown, 1000);
  }

  Cart.renderCart();
  Cart.updateNavBadge();
  UI.setupObserver();
  UI.setupNavScroll();
  Auth.updateUserUI();
}

window.addEventListener("DOMContentLoaded", init);
