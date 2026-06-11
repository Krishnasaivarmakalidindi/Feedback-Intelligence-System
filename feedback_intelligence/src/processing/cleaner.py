import re


def clean_text(text: str) -> str:
    """Cleans raw text by removing duplicate spaces and normalizing formatting."""
    if not text:
        return ""
    # Standardize spaces and strips padding whitespace
    cleaned = re.sub(r'\s+', ' ', text)
    return cleaned.strip()
