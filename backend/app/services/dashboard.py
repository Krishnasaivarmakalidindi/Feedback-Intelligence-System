from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database.models import Feedback


def get_kpi_metrics(db: Session, days: int = 30) -> dict:
    """Calculate key performance indicators from feedback data."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    items = db.query(Feedback).filter(Feedback.created_at >= cutoff).all()

    if not items:
        return {
            "total_feedback": 0,
            "avg_priority_score": 0,
            "sentiment_positive_pct": 0,
            "sentiment_negative_pct": 0,
            "sentiment_neutral_pct": 0,
            "bug_count": 0,
            "feature_request_count": 0,
            "avg_feedback_per_day": 0,
            "critical_feedback_count": 0,
        }

    total = len(items)
    positive = sum(1 for item in items if item.sentiment == "positive")
    negative = sum(1 for item in items if item.sentiment == "negative")
    neutral = sum(1 for item in items if item.sentiment == "neutral")
    bugs = sum(1 for item in items if item.category == "bug")
    features = sum(1 for item in items if item.category == "feature_request")
    critical = sum(1 for item in items if item.priority_score >= 4)

    return {
        "total_feedback": total,
        "avg_priority_score": sum(item.priority_score for item in items) / total if total > 0 else 0,
        "sentiment_positive_pct": (positive / total * 100) if total > 0 else 0,
        "sentiment_negative_pct": (negative / total * 100) if total > 0 else 0,
        "sentiment_neutral_pct": (neutral / total * 100) if total > 0 else 0,
        "bug_count": bugs,
        "feature_request_count": features,
        "avg_feedback_per_day": total / max(days, 1),
        "critical_feedback_count": critical,
    }


def get_dashboard_data(db: Session, days: int = 30) -> dict:
    """Aggregate all dashboard-relevant data."""
    from app.services.analytics import get_analytics_overview

    analytics = get_analytics_overview(db, days=days, keyword_limit=5)
    kpis = get_kpi_metrics(db, days=days)

    return {
        "kpis": kpis,
        "analytics": analytics,
        "generated_at": datetime.utcnow().isoformat(),
    }


def get_sentiment_timeline(db: Session, days: int = 30) -> list[dict]:
    """Get daily sentiment data for timeline visualization."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    start_date = (datetime.utcnow() - timedelta(days=days - 1)).date()
    
    items = (
        db.query(Feedback)
        .filter(Feedback.created_at >= cutoff)
        .order_by(Feedback.created_at.asc())
        .all()
    )

    daily_sentiment = {}
    for item in items:
        date = item.created_at.date() if item.created_at else start_date
        if date not in daily_sentiment:
            daily_sentiment[date] = {"positive": 0, "negative": 0, "neutral": 0}
        daily_sentiment[date][item.sentiment] += 1

    timeline = []
    for offset in range(days):
        date = start_date + timedelta(days=offset)
        sentiment = daily_sentiment.get(date, {"positive": 0, "negative": 0, "neutral": 0})
        timeline.append({
            "date": date.isoformat(),
            "positive": sentiment.get("positive", 0),
            "negative": sentiment.get("negative", 0),
            "neutral": sentiment.get("neutral", 0),
            "total": sum(sentiment.values()),
        })

    return timeline


def get_priority_breakdown(db: Session, days: int = 30) -> dict:
    """Get breakdown of feedback by priority score."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    items = db.query(Feedback).filter(Feedback.created_at >= cutoff).all()

    breakdown = {
        "1": {"count": 0, "percentage": 0},
        "2": {"count": 0, "percentage": 0},
        "3": {"count": 0, "percentage": 0},
        "4": {"count": 0, "percentage": 0},
        "5": {"count": 0, "percentage": 0},
    }

    total = len(items)
    for item in items:
        key = str(item.priority_score)
        breakdown[key]["count"] += 1

    if total > 0:
        for key in breakdown:
            breakdown[key]["percentage"] = (breakdown[key]["count"] / total * 100)

    return breakdown
