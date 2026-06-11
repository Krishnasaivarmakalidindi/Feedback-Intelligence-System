from sqlalchemy.orm import Session
from src.models import Feedback
from src.api.schemas import FeedbackCreate
from src.processing.cleaner import clean_text
from src.processing.analyzer import calculate_priority_score
from src.processing.categorizer import categorize_feedback
from src.intelligence.ml_models import analyze_sentiment


def process_incoming_feedback(db: Session, feedback_in: FeedbackCreate) -> Feedback:
    """Ingests a webhook feedback payload, processes it through the pipeline, and stores it."""
    # Clean & normalize text fields
    cleaned_name = clean_text(feedback_in.customer_name)
    cleaned_email = clean_text(feedback_in.email).lower()
    cleaned_message = clean_text(feedback_in.message)

    # Multi-method pipeline analysis
    sentiment = analyze_sentiment(cleaned_message)
    category = categorize_feedback(cleaned_message)
    priority = calculate_priority_score(cleaned_message, sentiment, category)

    db_feedback = Feedback(
        customer_name=cleaned_name,
        email=cleaned_email,
        message=cleaned_message,
        sentiment=sentiment,
        category=category,
        priority_score=priority
    )

    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback


def get_feedback_by_id(db: Session, feedback_id: int) -> Feedback:
    return db.query(Feedback).filter(Feedback.id == feedback_id).first()


def get_all_feedback(db: Session) -> list[Feedback]:
    return db.query(Feedback).order_by(Feedback.created_at.desc()).all()


def search_feedback(
    db: Session,
    search=None,
    sentiment=None,
    category=None,
    min_priority=None,
    max_priority=None,
) -> list[Feedback]:
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


def update_feedback(db: Session, feedback_id: int, feedback_data) -> Feedback:
    feedback = get_feedback_by_id(db, feedback_id)
    if not feedback:
        return None

    if feedback_data.customer_name is not None:
        feedback.customer_name = clean_text(feedback_data.customer_name)

    if feedback_data.email is not None:
        feedback.email = clean_text(feedback_data.email).lower()

    if feedback_data.message is not None:
        feedback.message = clean_text(feedback_data.message)
        feedback.sentiment = analyze_sentiment(feedback.message)
        feedback.category = categorize_feedback(feedback.message)
        feedback.priority_score = calculate_priority_score(
            feedback.message,
            sentiment=feedback.sentiment,
            category=feedback.category
        )

    # Allow direct overrides for category and priority if provided
    if hasattr(feedback_data, 'category') and feedback_data.category is not None:
        feedback.category = feedback_data.category

    if hasattr(feedback_data, 'priority_score') and feedback_data.priority_score is not None:
        feedback.priority_score = feedback_data.priority_score

    db.commit()
    db.refresh(feedback)
    return feedback


def delete_feedback(db: Session, feedback_id: int) -> Feedback:
    feedback = get_feedback_by_id(db, feedback_id)
    if not feedback:
        return None

    db.delete(feedback)
    db.commit()
    return feedback

