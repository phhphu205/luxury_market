import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.future.register import RegisterForm, handle_register
from services.future.login import LoginForm, handle_login 
from services.future.AI_assitant import ChatInput, get_products
from services.repositories.Product_db import db

processor = FastAPI()

processor.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@processor.get("/")
async def root():
    return {"status": "online"}
