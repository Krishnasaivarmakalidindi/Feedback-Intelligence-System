from fastapi import FastAPI

from app.api.routes import router
from app.database.db import engine
from app.database.models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Feedback Intelligence System",
    version="1.0.0"
)

app.include_router(router)


@app.get("/")
def home():
    return {
        "message": "Feedback Intelligence System Running 🚀"
    }

