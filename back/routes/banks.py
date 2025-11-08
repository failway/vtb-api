# routes/banks.py
from fastapi import APIRouter, HTTPException, Depends,  Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select, insert, update, and_
from datetime import datetime, timedelta
import httpx, os, json

from db.models import bank_tokens, bank_consents, users
from db.db import database
from utils.jwt import verify_token

router = APIRouter(prefix="/banks", tags=["Banks"])

BANK_URLS = {
    "vbank": "https://vbank.open.bankingapi.ru",
    "abank": "https://abank.open.bankingapi.ru",
    "sbank": "https://sbank.open.bankingapi.ru",
}

CLIENT_ID = os.getenv("CLIENT_ID", "team239")
CLIENT_SECRET = os.getenv("CLIENT_SECRET", "F1cVm5XwPoWquHf70R9VC8437ofbrQi0")


# ---------- AUTH ----------

async def get_current_user(request: Request):
    # 1. Пробуем взять токен из cookie
    token = request.cookies.get("access_token")

    # 2. Если в cookie нет — пробуем из заголовка Authorization
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Отсутствует токен пользователя",
        )

    payload = verify_token(token, token_type="access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный токен пользователя",
        )

    q = select(users).where(users.c.email == payload["sub"])
    user = await database.fetch_one(q)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    return user

# ---------- DB helpers ----------
async def get_cached_token(user_id: int, bank: str):
    q = select(bank_tokens).where(
        and_(bank_tokens.c.user_id == user_id, bank_tokens.c.bank_name == bank)
    )
    rec = await database.fetch_one(q)
    if rec and rec["expires_at"] and rec["expires_at"] > datetime.utcnow() + timedelta(minutes=5):
        return rec["access_token"]
    return None


async def save_token(user_id: int, bank: str, token: str, expires_in: int):
    expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
    existing = await database.fetch_one(
        select(bank_tokens).where(
            and_(bank_tokens.c.user_id == user_id, bank_tokens.c.bank_name == bank)
        )
    )
    if existing:
        q = (
            update(bank_tokens)
            .where(bank_tokens.c.id == existing["id"])
            .values(access_token=token, expires_at=expires_at)
        )
    else:
        q = insert(bank_tokens).values(
            user_id=user_id, bank_name=bank, access_token=token, expires_at=expires_at
        )
    await database.execute(q)


async def get_cached_consent(user_id: int, bank: str):
    q = select(bank_consents).where(
        and_(bank_consents.c.user_id == user_id, bank_consents.c.bank_name == bank)
    )
    return await database.fetch_one(q)


async def save_consent(user_id: int, bank: str, consent_id: str, client_id: str, status: str):
    q = insert(bank_consents).values(
        user_id=user_id,
        bank_name=bank,
        consent_id=consent_id,
        client_id=client_id,
        status=status,
        created_at=datetime.utcnow(),
    )
    await database.execute(q)


# ---------- Network ----------
async def request_bank(method: str, url: str, *, headers=None, params=None, json_body=None):
    try:
        async with httpx.AsyncClient(verify=False, trust_env=True, timeout=15.0) as client:
            resp = await client.request(method, url, headers=headers, params=params, json=json_body)
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Ошибка при обращении к банку: {e!s}")

    if resp.status_code >= 400:
        try:
            detail = resp.json()
        except Exception:
            detail = resp.text
        raise HTTPException(status_code=resp.status_code, detail=detail)

    try:
        return resp.json()
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Банк вернул не-JSON ответ")


# ---------- Token ----------
async def get_or_refresh_token(user_id: int, bank: str):
    if bank not in BANK_URLS:
        raise HTTPException(status_code=400, detail="Неверный банк")
    cached = await get_cached_token(user_id, bank)
    if cached:
        return cached

    url = f"{BANK_URLS[bank]}/auth/bank-token"
    data = await request_bank(
        "POST", url, params={"client_id": CLIENT_ID, "client_secret": CLIENT_SECRET}
    )

    token = data.get("access_token")
    exp = int(data.get("expires_in", 86400))
    if not token:
        raise HTTPException(status_code=502, detail="Банк не вернул access_token")

    await save_token(user_id, bank, token, exp)
    return token


# ---------- Endpoints ----------
@router.post("/{bank}/connect")
async def connect_bank(bank: str, user=Depends(get_current_user)):
    """Создаёт согласие и сохраняет request_id (req_id), если его ещё нет"""
    if bank not in BANK_URLS:
        raise HTTPException(status_code=400, detail="Неверный банк")

    existing = await database.fetch_one(
        select(bank_consents).where(
            (bank_consents.c.user_id == user.id) &
            (bank_consents.c.bank_name == bank)
        )
    )

    if existing:
        status = existing["status"]
        if status in ["pending", "AwaitingAuthorization"]:
            return {
                "message": "Согласие уже ожидает подтверждения",
                "bank": bank,
                "status": status,
                "req_id": existing["req_id"],
                "consent_id": existing["consent_id"],
                "connected": False
            }
        if status in ["approved", "Authorized"]:
            return {
                "message": "Банк уже подключен",
                "bank": bank,
                "status": status,
                "req_id": existing["req_id"],
                "consent_id": existing["consent_id"],
                "connected": True
            }

    token = await get_or_refresh_token(user.id, bank)
    headers = {"Authorization": f"Bearer {token}", "X-Requesting-Bank": CLIENT_ID}

    body = {
        "client_id": f"{CLIENT_ID}-{user.id}",
        "permissions": ["ReadAccountsDetail", "ReadBalances","ReadTransactionsDetail"],
        "reason": "Агрегация счетов для MapTrack",
        "requesting_bank": CLIENT_ID,
        "requesting_bank_name": "MapTrack",
    }

    async with httpx.AsyncClient(verify=False) as client:
        resp = await client.post(f"{BANK_URLS[bank]}/account-consents/request", headers=headers, json=body)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()
    req_id = data.get("request_id")
    consent_id = data.get("consent_id")
    status = data.get("status", "pending")

    await database.execute(
        insert(bank_consents).values(
            user_id=user.id,
            bank_name=bank,
            req_id=req_id,
            consent_id=consent_id,
            client_id=f"{CLIENT_ID}-{user.id}",
            status=status,
        )
    )

    return {
        "message": "Согласие создано",
        "bank": bank,
        "req_id": req_id,
        "consent_id": consent_id,
        "status": status,
        "connected": status in ["approved", "Authorized"]
    }

@router.get("/{bank}/status")
async def get_bank_status(bank: str, user=Depends(get_current_user)):
    """Проверяет статус согласия в банке и синхронизирует с БД"""
    print("🔥 [DEBUG] get_bank_status START", bank)
    if bank not in BANK_URLS:
        raise HTTPException(status_code=400, detail="Неверный банк")

    record = await database.fetch_one(
        select(bank_consents).where(
            (bank_consents.c.user_id == user.id) &
            (bank_consents.c.bank_name == bank)
        )
    )
    print("🔥 [DEBUG] found record:", record)
    if not record:
        return {
            "bank": bank,
            "status": "not_connected",
            "connected": False
        }
    consent_id = record["consent_id"] or record["req_id"]
    local_status = record["status"]

    token = await get_or_refresh_token(user.id, bank)
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Requesting-Bank": CLIENT_ID,
    }

    url = f"{BANK_URLS[bank]}/account-consents/{consent_id}"
    try:
        async with httpx.AsyncClient(verify=False, timeout=10.0) as client:
            resp = await client.get(url, headers=headers)
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Ошибка при обращении к банку: {str(e)}")

    if resp.status_code == 404:
        await database.execute(bank_consents.delete().where(bank_consents.c.id == record["id"]))
        return {
            "bank": bank,
            "status": "revoked",
            "connected": False,
            "message": "Согласие отозвано (404) и удалено локально"
        }

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    data = resp.json().get("data", {})
    new_status = data.get("status", local_status)
    new_consent_id = data.get("consentId", consent_id)

    if new_status.lower() in ["revoked", "rejected"]:
        await database.execute(bank_consents.delete().where(bank_consents.c.id == record["id"]))
        return {
            "bank": bank,
            "status": new_status,
            "connected": False,
            "message": f"Согласие {new_status.lower()} и удалено из базы"
        }

    if new_status != local_status or new_consent_id != consent_id:
        await database.execute(
            update(bank_consents)
            .where(bank_consents.c.id == record["id"])
            .values(status=new_status, consent_id=new_consent_id)
        )

    connected = new_status in ["approved", "Authorized"]

    return {
        "bank": bank,
        "status": new_status,
        "req_id": record["req_id"],
        "consent_id": new_consent_id,
        "connected": connected
    }

@router.delete("/{bank}/revoke")
async def revoke_consent(bank: str, user=Depends(get_current_user)):
    """Отзывает согласие у банка и удаляет локальную запись"""
    if bank not in BANK_URLS:
        raise HTTPException(status_code=400, detail="Неверный банк")

    record = await database.fetch_one(
        select(bank_consents).where(
            (bank_consents.c.user_id == user.id) &
            (bank_consents.c.bank_name == bank)
        )
    )

    if not record:
        raise HTTPException(status_code=404, detail="Согласие не найдено")

    consent_id = record["consent_id"] or record["req_id"]
    if not consent_id:
        raise HTTPException(status_code=400, detail="Нет доступного идентификатора согласия")

    url = f"{BANK_URLS[bank]}/account-consents/{consent_id}"
    headers = {
        "x-fapi-interaction-id": CLIENT_ID,  # может быть team239
    }

    async with httpx.AsyncClient(verify=False, timeout=10.0) as client:
        resp = await client.delete(url, headers=headers)

    if resp.status_code == 204:
        await database.execute(
            bank_consents.delete().where(bank_consents.c.id == record["id"])
        )
        return {
            "message": "Согласие успешно отозвано",
            "bank": bank,
            "consent_id": consent_id,
            "status": "revoked",
            "connected": False
        }

    elif resp.status_code == 404:
        await database.execute(
            bank_consents.delete().where(bank_consents.c.id == record["id"])
        )
        return {
            "message": "Согласие не найдено у банка, локальная запись удалена",
            "bank": bank,
            "status": "revoked",
            "connected": False
        }

    else:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Ошибка при отзыве согласия: {resp.text}"
        )
