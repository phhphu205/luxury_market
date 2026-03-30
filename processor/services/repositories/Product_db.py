import os
import urllib.parse
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# 1. Đảm bảo load đúng file .env
env_path = Path(__file__).resolve().parent.parent.parent / "ad.env"
load_dotenv(dotenv_path=env_path)

def _connect_db():
    """
    Hàm helper để khởi tạo kết nối.
    Tạo ra một instance client duy nhất để tái sử dụng trong toàn bộ ứng dụng.
    """
    # Lấy biến và đặt giá trị mặc định để tránh bị None
    user = os.getenv("MONGO_INITDB_ROOT_USERNAME", "")
    password = os.getenv("MONGO_INITDB_ROOT_PASSWORD", "")
    host = os.getenv("MONGO_HOST", "localhost")
    port = os.getenv("MONGO_PORT", 27017)
    db_name = os.getenv("MONGO_DB_NAME", "luxury_db")
    print(f"--- Đang kết nối tới: {host}:{port} ---")

    # 2. Quan trọng: Mã hóa username/password nếu có ký tự đặc biệt (@, :, /...)
    safe_user = urllib.parse.quote_plus(user)
    safe_password = urllib.parse.quote_plus(password)

    # 3. Build URI
    uri = f"mongodb://{safe_user}:{safe_password}@{host}:{port}/?authSource=admin"
    
    try:
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
        print("✅ Khởi tạo DB client thành công. Kết nối sẽ được thiết lập khi có truy vấn đầu tiên.")
        return client[db_name]
    except Exception as e: 
        print(f"❌ Lỗi kết nối: {e}")
        return None

# Khởi tạo một instance DB duy nhất và export nó
db = _connect_db()

if __name__ == "__main__":
    import asyncio
    async def test_connection():
        if db:
            print("✅ Đối tượng DB:", db)
            await db.command('ping')
            print("✅ Ping tới server DB thành công!")
    asyncio.run(test_connection())