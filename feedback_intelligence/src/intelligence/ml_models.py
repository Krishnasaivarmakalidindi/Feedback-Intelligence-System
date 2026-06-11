from textblob import TextBlob


def analyze_sentiment(text: str) -> str:
    """Invokes TextBlob to compute polarity score and maps it to a sentiment label."""
    polarity = TextBlob(text).sentiment.polarity

    if polarity > 0.05:
        return "positive"
    elif polarity < -0.05:
        return "negative"

    # Check for negative triggers if the sentiment is borderline
    text_lower = text.lower()
    negative_triggers = [
        "freeze", "freezes", "unresponsive", "crash", "crashes", "fails", "failing",
        "broken", "issue", "issues", "error", "errors", "slow", "bad", "poor",
        "terrible", "frustrating", "not working", "stuck", "failure", "failures",
        "cannot", "can't", "unable", "lock", "locks", "block", "blocked"
    ]
    if any(trigger in text_lower for trigger in negative_triggers):
        return "negative"

    if polarity > 0:
        return "positive"
    elif polarity < 0:
        return "negative"
    return "neutral"
