import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env configurations
load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

from src.api.endpoints import router
from src.database import engine, ensure_feedback_schema
from src.models import Base
from src.api.middleware import RequestTimingMiddleware

# Initialize databases
Base.metadata.create_all(bind=engine)
ensure_feedback_schema()

app = FastAPI(
    title="Feedback Intelligence System",
    version="1.0.0"
)

# Custom metrics middleware
app.add_middleware(RequestTimingMiddleware)

# Setup CORS origin allowances
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
        "message": "Feedback Intelligence System Running 🚀",
        "structure": "Aligned feedback_intelligence package"
    }
