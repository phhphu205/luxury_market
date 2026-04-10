import asyncio
import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from services.future.register import RegisterForm, handle_register
from services.future.login import LoginForm, handle_login 
from services.future.AI_assitant import ChatInput, get_products
from services.future.profile import handle_upload_avatar
from services.repositories.Product_db import db
processor = FastAPI()

processor.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cấu hình để server các file ảnh được upload
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

processor.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@processor.get("/api/products")
async def get_all_products():
    products_cursor = db.products.find({}, {"_id": 0})
    products_list = await products_cursor.to_list(length=None)
    return products_list

@processor.get("/api/categories")
async def get_all_categories():
    categories_cursor = db.categories.find({}, {"_id": 0})
    categories_list = await categories_cursor.to_list(length=None)
    return categories_list

@processor.get("/api/flash-sales")
async def get_flash_sales():
    # Giả định collection có tên là 'flash_sales'
    flash_sales_cursor = db.flash_sales.find({}, {"_id": 0})
    flash_sales_list = await flash_sales_cursor.to_list(length=None)
    return flash_sales_list

@processor.get("/api/reviews")
async def get_all_reviews():
    reviews_cursor = db.reviews.find({}, {"_id": 0})
    reviews_list = await reviews_cursor.to_list(length=None)
    return reviews_list

@processor.post("/api/chat_ai")
async def chat_endpoint(data: ChatInput):
    # Truyền message (string) vào hàm xử lý
    reply = await get_products(data.message, db)
    return {"reply": reply}

@processor.post("/register")
async def register_endpoint(user: RegisterForm):
    return await handle_register(user, db)

@processor.post("/login")
async def login_endpoint(user: LoginForm):
    return await handle_login(user, db)

@processor.post("/upload-avatar")
async def upload_avatar_endpoint(username: str = Form(...), file: UploadFile = File(...)):
    return await handle_upload_avatar(username, file, db)

@processor.get("/")
async def root():
    return {"status": "online"}
