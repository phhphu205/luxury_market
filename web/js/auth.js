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
  const userAvatar = document.querySelector(".user-avatar");
  if (!greeting || !loginBtn) return;
  if (currentUser) {
    greeting.innerHTML = `<span class="user-name">Xin chào, ${currentUser.username}</span><button class="logout-btn" onclick="window.logout()">Đăng xuất</button>`;
    loginBtn.style.display = "none";
    if (userAvatar) {
      userAvatar.style.display = "flex";
      if (currentUser.avatar) {
        userAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
      } else {
        userAvatar.innerHTML = currentUser.username.charAt(0).toUpperCase();
      }
    }
  } else {
    greeting.innerHTML = "";
    loginBtn.style.display = "inline-block";
    if (userAvatar) {
      userAvatar.style.display = "none";
    }
  }
}

export function logout() { currentUser = null; localStorage.removeItem("luxury_user"); updateUserUI(); if (window.renderCart) window.renderCart(); if (window.updateNavBadge) window.updateNavBadge(); }
export function openAuthModal() { const el = document.getElementById("authModal"); if(el) el.style.display = "flex"; }
export function closeAuthModal() { const el = document.getElementById("authModal"); if(el) el.style.display = "none"; }
export function openProfileModal() { 
  if(currentUser) {
    document.getElementById("profileUsername").innerText = currentUser.username; 
    const avatarPreview = document.getElementById("profileAvatarPreview");
    if (avatarPreview) avatarPreview.src = currentUser.avatar || "https://ui-avatars.com/api/?name=" + currentUser.username + "&background=random";
    const avatarInput = document.getElementById("avatarFileInput");
    if (avatarInput) avatarInput.value = ""; // Reset lại input
    document.getElementById("profileModal").style.display = "flex"; 
  }
}
export function closeProfileModal() { document.getElementById("profileModal").style.display = "none"; }
export function showProfile() { if (!currentUser) { window.showToast("Vui lòng đăng nhập để xem hồ sơ",'error'); return; } openProfileModal(); }

export async function saveProfile() {
  const fileInput = document.getElementById("avatarFileInput");
  if (!fileInput || !currentUser) return;
  const file = fileInput.files[0];
  
  if (!file) {
    showAuthToast("Vui lòng chọn một ảnh để tải lên!", "error");
    return;
  }
  
  const formData = new FormData();
  formData.append("username", currentUser.username);
  formData.append("file", file);
  
  try {
    const response = await fetch("http://127.0.0.1:8000/upload-avatar", {
      method: "POST",
      body: formData
    });
    const result = await response.json();
    
    if (result.status === "success") {
      currentUser.avatar = result.avatar_url;
      localStorage.setItem("luxury_user", JSON.stringify(currentUser));
      updateUserUI();
      showAuthToast(result.message, "success");
      closeProfileModal();
    } else {
      showAuthToast(result.message || "Lỗi tải ảnh lên", "error");
    }
  } catch (error) {
    showAuthToast("Lỗi kết nối đến máy chủ", "error");
  }
}

// ============================================================
// ===== DEDICATED AUTH PAGE LOGIC (cho file auth.html) =======
// ============================================================

export let authPageMode = 'login';

export function switchTab(m) {
  authPageMode = m;
  const isReg = m === 'register';

  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const tabs = document.getElementById('tabs');
  if (!tabs) return; // Bỏ qua nếu không phải ở trang auth.html

  tabLogin.classList.toggle('active', !isReg);
  tabRegister.classList.toggle('active', isReg);
  tabs.classList.toggle('register', isReg);

  document.getElementById('formTitle').textContent = isReg ? 'Tạo tài khoản mới ✨' : 'Chào mừng trở lại 👋';
  document.getElementById('formSubtitle').textContent = isReg ? 'Điền thông tin bên dưới để bắt đầu' : 'Nhập thông tin để tiếp tục mua sắm';

  document.querySelectorAll('.reg-only').forEach(el => el.classList.toggle('show', isReg));
  document.getElementById('extrasRow').style.display = isReg ? 'none' : 'flex';
  document.getElementById('strengthWrap').classList.toggle('show', isReg);

  document.getElementById('btnText').textContent = isReg ? 'Tạo tài khoản' : 'Đăng nhập';

  document.getElementById('switchText').innerHTML = isReg
    ? `Đã có tài khoản? <a href="#" onclick="window.switchTab('login');return false">Đăng nhập</a>`
    : `Chưa có tài khoản? <a href="#" onclick="window.switchTab('register');return false">Đăng ký ngay</a>`;

  document.getElementById('termsFooter').style.display = isReg ? 'none' : 'block';
  document.getElementById('inputPassword').autocomplete = isReg ? 'new-password' : 'current-password';

  clearErrors();
}

export function toggleEye() {
  const inp = document.getElementById('inputPassword');
  const btn = document.getElementById('eyeBtn');
  if (!inp || !btn) return;
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else                         { inp.type = 'password'; btn.textContent = '👁'; }
}

export function checkStrength(val) {
  if (authPageMode !== 'register') return;
  const segs = [document.getElementById('s1'), document.getElementById('s2'), document.getElementById('s3'), document.getElementById('s4')];
  const label = document.getElementById('strengthLabel');
  if (!label) return;
  const colors = ['#e63946','#f4a261','#f4a261','#2d6a4f'];
  const labels = ['Yếu','Trung bình','Khá tốt','Mạnh'];
  let score = 0;
  if (val.length >= 6) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  segs.forEach((s,i) => { if(s) s.style.background = i < score ? colors[Math.min(score-1,3)] : 'var(--border-l)'; });
  label.textContent = val.length === 0 ? 'Nhập mật khẩu' : labels[Math.min(score-1,3)] || 'Yếu';
  label.style.color = score > 0 ? colors[Math.min(score-1,3)] : 'var(--muted-l)';
}

export function showErr(id, msg) {
  const el = document.getElementById(id);
  const inp = document.getElementById(id.replace('err','input'));
  if (el) { el.textContent = msg || el.textContent; el.classList.add('show'); }
  if (inp) inp.classList.add('error-input');
}

export function clearErr(id) {
  const el = document.getElementById(id);
  const inp = document.getElementById(id.replace('err','input'));
  if (el) el.classList.remove('show');
  if (inp) inp.classList.remove('error-input');
}

export function clearErrors() {
  ['errUsername','errPassword','errFullname','errEmail','errConfirm','errTerms'].forEach(clearErr);
}

export function validate() {
  clearErrors();
  let ok = true;
  const uInp = document.getElementById('inputUsername');
  const pInp = document.getElementById('inputPassword');
  if (!uInp || !pInp) return false;

  const u = uInp.value.trim();
  const p = pInp.value;

  if (u.length < 4) { showErr('errUsername', 'Tên đăng nhập tối thiểu 4 ký tự'); ok = false; }

  if (authPageMode === 'login') {
    if (p.length < 6) { showErr('errPassword', 'Mật khẩu tối thiểu 6 ký tự'); ok = false; }
  }

  if (authPageMode === 'register') {
    const fn = document.getElementById('inputFullname').value.trim();
    const em = document.getElementById('inputEmail').value.trim();
    const cf = document.getElementById('inputConfirm').value;
    const ag = document.getElementById('agreeTerms').checked;

    if (fn.length < 2) { showErr('errFullname', 'Vui lòng nhập họ tên của bạn'); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { showErr('errEmail', 'Email không hợp lệ'); ok = false; }
    if (p.length < 6)  { showErr('errPassword', 'Mật khẩu tối thiểu 6 ký tự'); ok = false; }
    if (cf !== p)       { showErr('errConfirm', 'Mật khẩu không khớp'); ok = false; }
    if (!ag)            { showErr('errTerms', 'Bạn cần đồng ý với điều khoản dịch vụ'); ok = false; }
  }
  return ok;
}

export async function handleSubmit(event) {
  event.preventDefault();
  if (!validate()) return;
  
  const baseUrl = "http://127.0.0.1:8000"; 
  const apiUrl = authPageMode === 'register' ? `${baseUrl}/register` : `${baseUrl}/login`;
  const formData = {
      inputUsername: document.getElementById("inputUsername").value,
      inputPassword: document.getElementById("inputPassword").value
  };
  if (authPageMode === 'register') {
      formData.inputEmail = document.getElementById("inputEmail").value;
      formData.inputFullname = document.getElementById("inputFullname").value;
  }

  const submitBtn = document.getElementById('submitBtn');
  if(submitBtn) submitBtn.classList.add('loading');

  try {
      const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
      });
      const result = await response.json();
      showAuthToast(result.message, result.status);

      if (result.status === "success") {
          if (authPageMode === 'login') {
              localStorage.setItem("luxury_user", JSON.stringify(result.user_info));
              setTimeout(() => window.location.href = "../index.html", 1000);
          } else {
              switchTab('login');
          }
      }
  } catch (error) {
      showAuthToast("Lỗi kết nối API", "error");
  } finally {
      if(submitBtn) submitBtn.classList.remove('loading');
  }
}

export function socialLogin(provider) {
  showAuthToast(`${provider} login đang được phát triển 🛠`, 'success');
}

export function forgotPassword() {
  const u = document.getElementById('inputUsername')?.value.trim();
  if (!u) { showAuthToast('Nhập tên đăng nhập trước nhé!', 'error'); return; }
  showAuthToast(`📧 Link khôi phục đã gửi cho: ${u}`, 'success');
}

export function showAuthToast(msg, type='success') {
  const wrap = document.getElementById('toastWrap');
  if (wrap) {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = (type==='success' ? '✅ ' : '❌ ') + msg;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  } else if (window.showToast) {
    window.showToast(msg, type);
  } else {
    alert(msg);
  }
}

// Expose các hàm ra window để gọi từ HTML nội tuyến (chỉ khi chạy trên browser)
if (typeof window !== 'undefined') {
  window.switchTab = switchTab;
  window.toggleEye = toggleEye;
  window.checkStrength = checkStrength;
  window.handleSubmit = handleSubmit;
  window.socialLogin = socialLogin;
  window.forgotPassword = forgotPassword;
  window.saveProfile = saveProfile;
}

// INIT Khởi tạo các trạng thái cho trang auth.html
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Xử lý Preview Avatar khi người dùng chọn ảnh từ thiết bị
    document.addEventListener('change', (e) => {
      if (e.target && e.target.id === 'avatarFileInput') {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(evt) {
            const preview = document.getElementById('profileAvatarPreview');
            if (preview) preview.src = evt.target.result;
          };
          reader.readAsDataURL(file);
        }
      }
    });

    updateUserUI();
    if (document.getElementById('authForm')) {
      const user = localStorage.getItem('luxury_user');
      if (user) {
        try {
          const u = JSON.parse(user);
          if (u && u.username) {
            showAuthToast(`Bạn đã đăng nhập với: ${u.username}. Đang chuyển trang...`, 'success');
            setTimeout(() => window.location.href = '../index.html', 1200);
          }
        } catch(e) {}
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'register') switchTab('register');

      const tabs = document.getElementById('tabs');
      const slider = document.getElementById('tabSlider');
      function updateSlider() {
        const btn = tabs?.querySelector('.tab-btn.active');
        if (btn && slider) {
          slider.style.left   = btn.offsetLeft + 'px';
          slider.style.width  = btn.offsetWidth + 'px';
          slider.style.height = btn.offsetHeight + 'px';
          slider.style.top    = btn.offsetTop + 'px';
          slider.style.transform = 'none';
          slider.style.transition = 'left .3s cubic-bezier(.4,0,.2,1), width .3s';
        }
      }
      setTimeout(updateSlider, 10);
      document.getElementById('tabLogin')?.addEventListener('click', () => setTimeout(updateSlider, 10));
      document.getElementById('tabRegister')?.addEventListener('click', () => setTimeout(updateSlider, 10));
      window.addEventListener('resize', updateSlider);
    }
  });
}