from pydantic import BaseModel, EmailStr

# 1. Khai báo Schema để validate dữ liệu từ Frontend
class RegisterForm(BaseModel):
    inputUsername: str
    inputPassword: str
    inputEmail: EmailStr
    inputFullname: str

# 2. Hàm xử lý logic chính
async def handle_register(user: RegisterForm, db):
    try:
        # Kiểm tra username đã tồn tại chưa
        existing_user = await db.users.find_one({"username": user.inputUsername})
        if existing_user:
            return {"status": "error", "message": "Tên đăng nhập này bị đăng nhập!!!"}

        # Chuẩn bị dữ liệu để insert
        new_user = {
            "username": user.inputUsername,
            "password": user.inputPassword,
            "email": user.inputEmail,
            "fullname": user.inputFullname,
            "role": "user"
        }

        # Thực thi lưu vào MongoDB
        await db.users.insert_one(new_user)
        return {"status": "success", "message": "Đăng kí thành công!"}
    
    except Exception as e:
        return {"status": "error", "message": f"Lỗi kỹ thuật: {str(e)}"}