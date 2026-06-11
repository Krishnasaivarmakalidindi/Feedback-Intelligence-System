from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

from app.api.routes import router
from app.database.db import engine, ensure_feedback_schema
from app.database.models import Base

Base.metadata.create_all(bind=engine)
ensure_feedback_schema()

app = FastAPI(
    title="Feedback Intelligence System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def home():
    return {
        "message": "Feedback Intelligence System Running 🚀"
    }

