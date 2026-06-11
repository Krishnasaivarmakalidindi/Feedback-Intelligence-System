from textblob import TextBlob


def analyze_sentiment(text: str) -> str:
    polarity = TextBlob(text).sentiment.polarity

    if polarity > 0:
        return "positive"
    elif polarity < 0:
        return "negative"
    return "neutral"


def calculate_priority_score(text: str, sentiment: str = None, category: str = None) -> int:
    normalized_text = text.lower()

    if sentiment is None:
        sentiment = analyze_sentiment(text)

    if category is None:
        category = categorize_feedback(text)

    score = 1

    urgent_keywords = [
        "crash",
        "error",
        "broken",
        "failure",
        "down",
        "cannot",
        "can't",
        "blocked",
        "urgent",
    ]

    if category == "bug":
        score += 2
    elif category == "complaint":
        score += 1
    elif category == "feature_request":
        score += 1

    if sentiment == "negative":
        score += 1
    elif sentiment == "positive":
        score -= 1

    if any(keyword in normalized_text for keyword in urgent_keywords):
        score += 1

    return max(1, min(5, score))


def categorize_feedback(text: str) -> str:
    text = text.lower()

    bug_keywords = [
        "bug",
        "crash",
        "error",
        "issue",
        "broken",
        "failure"
    ]

    feature_keywords = [
        "feature",
        "request",
        "enhancement",
        "improvement",
        "add"
    ]

    praise_keywords = [
        "great",
        "excellent",
        "love",
        "awesome",
        "amazing"
    ]

    complaint_keywords = [
        "slow",
        "bad",
        "poor",
        "terrible",
        "frustrating"
    ]

    if any(word in text for word in bug_keywords):
        return "bug"

    if any(word in text for word in feature_keywords):
        return "feature_request"

    if any(word in text for word in praise_keywords):
        return "praise"

    if any(word in text for word in complaint_keywords):
        return "complaint"

    return "general" 

