from sqlalchemy.orm import Session

from app.database.models import Feedback
from app.services.analyzer import analyze_sentiment


def create_feedback(db: Session, feedback_data):
    sentiment = analyze_sentiment(feedback_data.message)

    feedback = Feedback(
        customer_name=feedback_data.customer_name,
        email=feedback_data.email,
        message=feedback_data.message,
        sentiment=sentiment
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return feedback


def get_all_feedback(db: Session):
    return db.query(Feedback).all() 

