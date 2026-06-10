from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.schemas.feedback import FeedbackCreate
from app.services.feedback import create_feedback, get_all_feedback

router = APIRouter()


@router.get("/health")
def health():
    return {
        "status": "healthy"
    }


@router.post("/feedback")
def submit_feedback(
    feedback: FeedbackCreate,
    db: Session = Depends(get_db)
):
    saved_feedback = create_feedback(db, feedback)

    return {
        "message": "Feedback submitted successfully",
        "feedback_id": saved_feedback.id
    }


@router.get("/feedback")
def list_feedback(
    db: Session = Depends(get_db)
):
    feedback_list = get_all_feedback(db)

    return feedback_list



