from pydantic import BaseModel

class LoginForm(BaseModel):
    inputUsername: str
    inputPassword: str

async def handle_login(data: LoginForm, db):
    try:
        user = await db.users.find_one({
            "username": data.inputUsername,
            "password": data.inputPassword
        })

        if user:
            return {
                "status": "success",
                "message": "Đăng nhập thành công!",
                "user_info": {
                    "username": user["username"],
                    "fullname": user.get("inputFullname", ""),
                    "avatar": user.get("avatar", "")
                }
            }
        return {"status": "error", "message": "Sai tài khoản hoặc mật khẩu!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}