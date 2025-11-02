from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.events import attach_db_events
from routes import auth

app = FastAPI(title="MapTrack API", version="0.1.0")

attach_db_events(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000"
    ],  # 👈 Укажи свой фронт
    allow_credentials=True,                   # 👈 обязательно для cookie
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")

@app.get("/")
def root():
    return {"message": "MapTrack running 🚀"}