def categorize_feedback(text: str) -> str:
    """Classifies a feedback log string into its corresponding category label."""
    text = text.lower()

    bug_keywords = [
        "bug",
        "crash",
        "crashes",
        "error",
        "errors",
        "issue",
        "issues",
        "broken",
        "failure",
        "failures",
        "freeze",
        "freezes",
        "unresponsive",
        "fails",
        "failing",
        "not working",
        "hang",
        "hangs",
        "loop",
        "loops",
        "stuck"
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
