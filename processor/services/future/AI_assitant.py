import os
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as ai
from pydantic import BaseModel

# Load file ad.env từ thư mục gốc của processor
env_path = Path(__file__).resolve().parent.parent.parent / "ad.env"
load_dotenv(dotenv_path=env_path)

# Lấy API Key từ biến môi trường
ai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = ai.GenerativeModel("models/gemini-2.5-flash")

class ChatInput(BaseModel):
    message: str
    
async def get_products(mess: str, db):
    try:
        query = db.products.find({}, {"_id": 0})
        get = await query.to_list(length=100)
        product_context = "Danh sách sản phẩm hiện có:\n"
        product_list_str = "\n".join([f"- {p['name']}: {p['price']}đ ({p.get('desc', '...')})" for p in get])
        
        full_prompt = f"""
        Bạn là trợ lý của Luxury_market với tên là Luxy. 
        Dựa vào danh sách sau:
        {product_list_str} 
        
        Câu hỏi của khách: {mess}
        Trả lời"""
        
        reponse = model.generate_content(full_prompt)
        
        return reponse.text     
    except Exception as e:
        print(f"Lỗi {e}")
        
