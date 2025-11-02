from db.models import users
from db.db import database

async def check_validation(data):
    """Проверка уникальности email, телефона и ИНН"""

    query = users.select().where(users.c.email == data.email)
    user = await database.fetch_one(query)
    if user:
        return False, "Пользователь с таким email уже существует"

    query = users.select().where(users.c.phone == data.phone)
    user = await database.fetch_one(query)
    if user:
        return False, "Пользователь с таким телефоном уже существует"

    if data.type_account in (1, 2) and data.inn:
        query = users.select().where(users.c.inn == data.inn)
        user = await database.fetch_one(query)
        if user:
            return False, "Компания с таким ИНН уже зарегистрирована"

    return True, None
