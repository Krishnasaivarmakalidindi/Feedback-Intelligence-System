import re
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from src.models import Feedback
from src.actions.alerts import detect_volume_anomaly_with_severity

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from",
    "has", "have", "i", "if", "in", "is", "it", "my", "of", "on", "or",
    "our", "so", "that", "the", "their", "this", "to", "was", "we", "with",
    "you", "your"
}

WORD_PATTERN = re.compile(r"[a-zA-Z][a-zA-Z']+")


def extract_keywords(texts, limit: int = 10):
    """Parses raw text lists and extracts unique frequency word counts, skipping stopwords."""
    counter = Counter()

    for text in texts:
        tokens = WORD_PATTERN.findall((text or "").lower())
        for token in tokens:
            if len(token) < 3 or token in STOPWORDS:
                continue
            counter[token] += 1

    return [
        {"word": word, "count": count}
        for word, count in counter.most_common(limit)
    ]


def build_daily_trend(feedback_items, days: int):
    """Constructs a daily frequency history timeline of ingested feedback count lists."""
    start_date = (datetime.utcnow() - timedelta(days=days - 1)).date()
    daily_counts = defaultdict(int)

    for item in feedback_items:
        if item.created_at is None:
            continue
        daily_counts[item.created_at.date()] += 1

    trend = []
    for offset in range(days):
        current_date = start_date + timedelta(days=offset)
        trend.append(
            {
                "date": current_date.isoformat(),
                "count": daily_counts[current_date],
            }
        )

    return trend


def categorize_feedback_topics(feedback_items):
    """Auto-groups feedback message structures into topic segments (performance, UI, bugs)."""
    topics = {
        "Performance Issues": 0,
        "UI/UX Issues": 0,
        "Feature Requests": 0,
        "Bugs & Crashes": 0,
        "Positive Feedback": 0,
        "Other": 0,
    }

    performance_keywords = ["slow", "lag", "delay", "hang", "freeze", "timeout", "performance"]
    ui_keywords = ["ui", "ux", "interface", "button", "design", "layout", "color", "theme", "font"]
    feature_keywords = ["feature", "request", "enhancement", "improvement", "add", "implement"]
    bug_keywords = ["bug", "crash", "error", "broken", "failure", "issue", "exception"]
    positive_keywords = ["great", "excellent", "love", "awesome", "amazing", "good", "perfect", "best"]

    for item in feedback_items:
        text = (item.message or "").lower()

        if any(kw in text for kw in bug_keywords):
            topics["Bugs & Crashes"] += 1
        elif any(kw in text for kw in performance_keywords):
            topics["Performance Issues"] += 1
        elif any(kw in text for kw in ui_keywords):
            topics["UI/UX Issues"] += 1
        elif any(kw in text for kw in feature_keywords):
            topics["Feature Requests"] += 1
        elif item.sentiment == "positive" or any(kw in text for kw in positive_keywords):
            topics["Positive Feedback"] += 1
        else:
            topics["Other"] += 1

    return topics


def get_sentiment_trend(feedback_items, days: int):
    """Assembles a daily timeline distribution breakdown of positive, negative, and neutral items."""
    start_date = (datetime.utcnow() - timedelta(days=days - 1)).date()
    sentiment_by_day = defaultdict(lambda: Counter())

    for item in feedback_items:
        if item.created_at is None:
            continue
        sentiment_by_day[item.created_at.date()][item.sentiment] += 1

    trend = []
    for offset in range(days):
        current_date = start_date + timedelta(days=offset)
        day_sentiments = sentiment_by_day[current_date]
        trend.append(
            {
                "date": current_date.isoformat(),
                "positive": day_sentiments.get("positive", 0),
                "negative": day_sentiments.get("negative", 0),
                "neutral": day_sentiments.get("neutral", 0),
            }
        )

    return trend


def get_analytics_overview(db: Session, days: int = 30, keyword_limit: int = 10):
    """Gathers all daily timelines, keyword metrics, and anomaly outputs into a single payload."""
    cutoff = datetime.utcnow() - timedelta(days=days)
    feedback_items = (
        db.query(Feedback)
        .filter(Feedback.created_at >= cutoff)
        .order_by(Feedback.created_at.asc())
        .all()
    )

    sentiment_distribution = Counter(item.sentiment for item in feedback_items)
    category_distribution = Counter(item.category for item in feedback_items)
    priority_distribution = Counter(str(item.priority_score) for item in feedback_items)
    daily_trend = build_daily_trend(feedback_items, days)
    sentiment_trend = get_sentiment_trend(feedback_items, days)
    top_keywords = extract_keywords((item.message for item in feedback_items), limit=keyword_limit)
    anomaly_severity, anomaly_message = detect_volume_anomaly_with_severity(daily_trend)
    topics = categorize_feedback_topics(feedback_items)

    return {
        "total_feedback": len(feedback_items),
        "sentiment_distribution": dict(sentiment_distribution),
        "category_distribution": dict(category_distribution),
        "priority_distribution": dict(priority_distribution),
        "daily_trend": daily_trend,
        "sentiment_trend": sentiment_trend,
        "top_keywords": top_keywords,
        "topic_distribution": topics,
        "anomaly_severity": anomaly_severity,
        "anomaly_message": anomaly_message,
        "generated_at": datetime.utcnow(),
    }


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

