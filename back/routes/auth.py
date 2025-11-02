# auth.py
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, constr
from datetime import datetime
from passlib.context import CryptContext
import hashlib

from utils.validation import check_validation
from utils.jwt import create_access_token
from db.models import users
from db.db import database


router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ==========================
# Утилиты для паролей
# ==========================
def hash_password(password: str) -> str:
    return pwd_ctx.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_ctx.verify(password, hashed)



# ==========================
# Pydantic схемы
# ==========================
class RegisterUserSchema(BaseModel):
    email: EmailStr
    password: constr(min_length=8)
    phone: constr(min_length=11, max_length=12)
    type_account: int  # 0 - физ. лицо, 1 - юр. лицо, 2 - ИП
    first_name: constr(min_length=2)
    company_name: constr(min_length=2) | None = None
    inn: constr(min_length=10, max_length=12) | None = None
    kpp: constr(min_length=9, max_length=9) | None = None
    premium: bool = False
    premium_expiry: datetime | None = None
    is_admin: bool = False
    is_blocked: bool = False

class UserOut(BaseModel):
    id: int
    email: EmailStr


# ==========================
# Регистрация
# ==========================
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(data: RegisterUserSchema):
    """Регистрирует нового пользователя и выдает JWT в cookie"""
    
    is_valid, error = await check_validation(data)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    hashed_pwd = hash_password(data.password)

    query = users.insert().values(
        email=data.email,
        password_hash=hashed_pwd,
        phone=data.phone,
        type_account=data.type_account,
        first_name=data.first_name,
        company_name=data.company_name,
        inn=data.inn,
        kpp=data.kpp,
        premium=data.premium,
        premium_expiry=data.premium_expiry,
        is_admin=data.is_admin,
        is_blocked=data.is_blocked
    )
    user_id = await database.execute(query)

    token = create_access_token({"sub": data.email})

    response = JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={"id": user_id, "email": data.email, "message": "Регистрация успешна"}
    )
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,  
        samesite="lax",
        path="/",
        max_age=60 * 60 * 24 
    )
    return response
