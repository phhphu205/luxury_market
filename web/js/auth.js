export let currentUser = JSON.parse(localStorage.getItem("luxury_user")) || null;
export let isLoginMode = true;

export function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  document.getElementById("authTitle").innerText = isLoginMode ? "Đăng nhập" : "Đăng ký";
  document.getElementById("switchAuth").innerHTML = isLoginMode
    ? `Chưa có tài khoản? <span onclick="window.toggleAuthMode()">Đăng ký</span>`
    : `Đã có tài khoản? <span onclick="window.toggleAuthMode()">Đăng nhập</span>`;
}

export function handleAuth() {
  const username = document.getElementById("authUsername")?.value;
  const password = document.getElementById("authPassword")?.value;
  if (!username || !password) { alert("Vui lòng nhập đầy đủ thông tin!"); return; }
  let users = JSON.parse(localStorage.getItem("luxury_users")) || [];
  if (isLoginMode) {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) { alert("Sai tài khoản hoặc mật khẩu!"); return; }
    currentUser = user;
    localStorage.setItem("luxury_user", JSON.stringify(user));
    alert("Đăng nhập thành công!");
  } else {
    if (users.some(u => u.username === username)) { alert("Tên đăng nhập đã tồn tại!"); return; }
    users.push({ username, password });
    localStorage.setItem("luxury_users", JSON.stringify(users));
    alert("Đăng ký thành công! Hãy đăng nhập.");
    toggleAuthMode(); return;
  }
  updateUserUI();
  if (window.renderCart) window.renderCart();
  if (window.updateNavBadge) window.updateNavBadge();
  closeAuthModal();
}

export function updateUserUI() {
  const greeting = document.getElementById("userGreeting");
  const loginBtn = document.querySelector(".login-btn");
  if (!greeting || !loginBtn) return;
  if (currentUser) {
    greeting.innerHTML = `<span class="user-name">Xin chào, ${currentUser.username}</span><button class="logout-btn" onclick="window.logout()">Đăng xuất</button>`;
    loginBtn.style.display = "none";
  } else {
    greeting.innerHTML = "";
    loginBtn.style.display = "inline-block";
  }
}

export function logout() { currentUser = null; localStorage.removeItem("luxury_user"); updateUserUI(); if (window.renderCart) window.renderCart(); if (window.updateNavBadge) window.updateNavBadge(); }
export function openAuthModal() { const el = document.getElementById("authModal"); if(el) el.style.display = "flex"; }
export function closeAuthModal() { const el = document.getElementById("authModal"); if(el) el.style.display = "none"; }
export function openProfileModal() { if(currentUser) document.getElementById("profileUsername").innerText = currentUser.username; document.getElementById("profileModal").style.display = "flex"; }
export function closeProfileModal() { document.getElementById("profileModal").style.display = "none"; }
export function showProfile() { if (!currentUser) { window.showToast("Vui lòng đăng nhập để xem hồ sơ",'error'); return; } openProfileModal(); }