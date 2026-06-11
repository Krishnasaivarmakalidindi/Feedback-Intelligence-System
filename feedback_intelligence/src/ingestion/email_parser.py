from typing import Optional
from src.api.schemas import FeedbackCreate


def parse_feedback_email(subject: str, body: str, sender_email: str, sender_name: Optional[str] = None) -> FeedbackCreate:
    """Parses raw fields from an email payload and normalizes them into a FeedbackCreate schema."""
    name = sender_name or sender_email.split("@")[0].title()
    message = f"Subject: {subject}\n\n{body}"
    return FeedbackCreate(
        customer_name=name,
        email=sender_email,
        message=message
    )
