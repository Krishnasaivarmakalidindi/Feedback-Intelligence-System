def calculate_priority_score(text: str, sentiment: str, category: str) -> int:
    """Calculates a ticket priority rating from 1 (lowest) to 5 (highest)."""
    normalized_text = text.lower()
    score = 1

    urgent_keywords = [
        "crash",
        "crashes",
        "error",
        "errors",
        "broken",
        "failure",
        "failures",
        "down",
        "cannot",
        "can't",
        "blocked",
        "urgent",
        "freeze",
        "freezes",
        "unresponsive",
    ]

    # Category Weights
    if category == "bug":
        score += 2
    elif category == "complaint":
        score += 1
    elif category == "feature_request":
        score += 1

    # Sentiment weights
    if sentiment == "negative":
        score += 1
    elif sentiment == "positive":
        score -= 1

    # Urgent keyword boosts
    if any(keyword in normalized_text for keyword in urgent_keywords):
        score += 1

    return max(1, min(5, score))
