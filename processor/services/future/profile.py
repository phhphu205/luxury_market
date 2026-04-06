import os
import uuid
from fastapi import UploadFile

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

async def handle_upload_avatar(username: str, file: UploadFile, db):
    try:
        # Tạo thư mục uploads nếu chưa có
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Tạo tên file ngẫu nhiên để tránh trùng lặp
        ext = file.filename.split(".")[-1]
        filename = f"{username}_{uuid.uuid4().hex[:8]}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Lưu file vật lý vào máy chủ
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        # Đường dẫn URL để trả về cho Frontend
        avatar_url = f"http://127.0.0.1:8000/uploads/{filename}"
        
        # Cập nhật đường dẫn avatar vào MongoDB
        await db.users.update_one({"username": username}, {"$set": {"avatar": avatar_url}})
        return {"status": "success", "avatar_url": avatar_url, "message": "Cập nhật avatar thành công!"}
    except Exception as e:
        return {"status": "error", "message": f"Lỗi xử lý ảnh: {str(e)}"}