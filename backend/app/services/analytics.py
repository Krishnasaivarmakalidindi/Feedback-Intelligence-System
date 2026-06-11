from collections import Counter, defaultdict
from datetime import datetime, timedelta
import re

from sqlalchemy.orm import Session

from app.database.models import Feedback

STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "but",
    "by",
    "for",
    "from",
    "has",
    "have",
    "i",
    "if",
    "in",
    "is",
    "it",
    "my",
    "of",
    "on",
    "or",
    "our",
    "so",
    "that",
    "the",
    "their",
    "this",
    "to",
    "was",
    "we",
    "with",
    "you",
    "your",
}

WORD_PATTERN = re.compile(r"[a-zA-Z][a-zA-Z']+")


def extract_keywords(texts, limit: int = 10):
    counter = Counter()

    for text in texts:
        tokens = WORD_PATTERN.findall((text or "").lower())
        for token in tokens:
            if len(token) < 3:
                continue
            if token in STOPWORDS:
                continue
            counter[token] += 1

    return [
        {"word": word, "count": count}
        for word, count in counter.most_common(limit)
    ]


def build_daily_trend(feedback_items, days: int):
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


def detect_volume_anomaly_with_severity(daily_trend):
    if len(daily_trend) < 14:
        return "none", "Not enough data for anomaly detection"

    recent_period = daily_trend[-7:]
    previous_period = daily_trend[-14:-7]

    recent_average = sum(item["count"] for item in recent_period) / 7
    previous_average = sum(item["count"] for item in previous_period) / 7

    if previous_average == 0:
        if recent_average >= 5:
            return "high", "Feedback volume surged from low baseline"
        if recent_average >= 3:
            return "medium", "Recent feedback volume elevated from low baseline"
        return "none", "No anomaly detected"

    ratio = recent_average / previous_average if previous_average > 0 else 1

    if ratio >= 2.0 and recent_average >= 5:
        return "high", "Critical feedback volume spike detected"
    if ratio >= 1.5 and recent_average >= 3:
        return "medium", "Feedback volume increased significantly"
    if ratio <= 0.5 and previous_average >= 3:
        return "low", "Feedback volume decreased"

    return "none", "No anomaly detected"


def categorize_feedback_topics(feedback_items):
    topics = {
        "Performance Issues": 0,
        "UI/UX Issues": 0,
        "Feature Requests": 0,
        "Bugs & Crashes": 0,
        "Positive Feedback": 0,
        "Other": 0,
    }

    performance_keywords = ["slow", "lag", "delay", "hang", "freeze", "timeout", "timeout", "performance"]
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
