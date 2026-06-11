from sqlalchemy.orm import Session

from app.database.models import Feedback
from app.services.analyzer import (
    analyze_sentiment,
    calculate_priority_score,
    categorize_feedback,
)


def create_feedback(db: Session, feedback_data):
    sentiment = analyze_sentiment(feedback_data.message)
    category = categorize_feedback(feedback_data.message)
    priority_score = calculate_priority_score(
        feedback_data.message,
        sentiment=sentiment,
        category=category,
    )

    feedback = Feedback(
        customer_name=feedback_data.customer_name,
        email=feedback_data.email,
        message=feedback_data.message,
        sentiment=sentiment,
        category=category,
        priority_score=priority_score,
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return feedback


def get_feedback_by_id(db: Session, feedback_id: int):
    return db.query(Feedback).filter(Feedback.id == feedback_id).first()


def get_all_feedback(db: Session):
    return db.query(Feedback).order_by(Feedback.created_at.desc()).all()


def search_feedback(
    db: Session,
    search=None,
    sentiment=None,
    category=None,
    min_priority=None,
    max_priority=None,
):
    query = db.query(Feedback)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (Feedback.customer_name.ilike(pattern))
            | (Feedback.email.ilike(pattern))
            | (Feedback.message.ilike(pattern))
        )

    if sentiment:
        query = query.filter(Feedback.sentiment == sentiment)

    if category:
        query = query.filter(Feedback.category == category)

    if min_priority is not None:
        query = query.filter(Feedback.priority_score >= min_priority)

    if max_priority is not None:
        query = query.filter(Feedback.priority_score <= max_priority)

    return query.order_by(Feedback.created_at.desc()).all()


def update_feedback(db: Session, feedback_id: int, feedback_data):
    feedback = get_feedback_by_id(db, feedback_id)

    if not feedback:
        return None

    if feedback_data.customer_name is not None:
        feedback.customer_name = feedback_data.customer_name

    if feedback_data.email is not None:
        feedback.email = feedback_data.email

    if feedback_data.message is not None:
        feedback.message = feedback_data.message
        feedback.sentiment = analyze_sentiment(feedback_data.message)
        feedback.category = categorize_feedback(feedback_data.message)
        feedback.priority_score = calculate_priority_score(
            feedback_data.message,
            sentiment=feedback.sentiment,
            category=feedback.category,
        )

    db.commit()
    db.refresh(feedback)

    return feedback


def delete_feedback(db: Session, feedback_id: int):
    feedback = get_feedback_by_id(db, feedback_id)

    if not feedback:
        return None

    db.delete(feedback)
    db.commit()

    return feedback

