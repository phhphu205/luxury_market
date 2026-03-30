import google.generativeai as ai
from pydantic import BaseModel
ai.configure(api_key="AIzaSyCNwxuiyZL-rBP3g_Yl-1owcbQhv4abk6E")
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
        Bạn là trợ lý bán hàng chuyên nghiệp. 
        Dựa vào danh sách sau:
        {product_list_str} 
        
        Câu hỏi của khách: {mess}
        Trả lời"""
        
        reponse = model.generate_content(full_prompt)
        
        return reponse.text     
    except Exception as e:
        print(f"Lỗi {e}")
        
