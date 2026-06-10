from sqlalchemy.orm import Session
from app.database.models import Feedback


def create_feedback(db: Session, feedback_data):
    feedback = Feedback(
        customer_name=feedback_data.customer_name,
        email=feedback_data.email,
        message=feedback_data.message
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return feedback


def get_all_feedback(db: Session):
    return db.query(Feedback).all() 

