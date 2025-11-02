from datetime import datetime, timedelta
from jose import jwt,JWTError
from typing import Optional, Dict, Any

SECRET_KEY = "8b0dd7094d40a71da5bf497584e2a28b32036c0388f28b2bae4f2eb0f47bf425"
ALGORITHM = "HS256"

def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[int] = 60 * 24 * 7  # 7 дней по умолчанию
) -> str:
    """
    Создание JWT токена.

    :param data: словарь с данными (например {"sub": email})
    :param expires_delta: время жизни токена в минутах
    :return: строка с JWT токеном
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict | None:
    """
    Декодирует JWT и возвращает payload (например {"sub": email}).
    Если токен недействителен или истёк — возвращает None.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None