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

# Cấu hình để serve các file ảnh được upload
os.makedirs("uploads", exist_ok=True)
processor.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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
