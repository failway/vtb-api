from sqlalchemy import create_engine, MetaData
from databases import Database
import os

DB_URL = os.getenv("DB_URL", "sqlite:///./maptrack.db")
database = Database(DB_URL)
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
metadata = MetaData()
