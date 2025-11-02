from fastapi import FastAPI
from db.db import database

def attach_db_events(app: FastAPI):
    @app.on_event("startup")
    async def startup():
        await database.connect()
    @app.on_event("shutdown")
    async def shutdown():
        await database.disconnect()
