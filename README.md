# 🛍️ LUXURY MARKET - AI Powered E-Commerce

Dự án website thương mại điện tử tích hợp **Trí tuệ nhân tạo (Gemini AI)** để tư vấn bán hàng.

---

## 🛠️ Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Python, FastAPI |
| **AI Engine** | Google Gemini 1.5 Flash |
| **Database** | MongoDB (NoSQL) |
| **DevOps** | Docker, Docker-compose |

---

## 📂 Cấu Trúc Dự Án

```text
LUXURY_MARKET/
├── 🧠 processor/          # Backend (FastAPI & AI Logic)
│   ├── services/          # Xử lý logic nghiệp vụ (Auth, AI)
│   ├── repositories/      # Kết nối & Thao tác Database
│   └── main.py            # Cổng chạy ứng dụng chính
├── 🌐 web/               # Frontend (Giao diện người dùng)
│   ├── html/              # Các trang giao diện
│   ├── css/               # Định dạng kiểu dáng
│   └── js/                # Xử lý tương tác & Gọi API
└── 🐳 Docker Setup        # Cấu hình container hóa hệ thống
