from fastapi import FastAPI

app = FastAPI(
    title="Feedback Intelligence System",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "Feedback Intelligence System Running 🚀"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

