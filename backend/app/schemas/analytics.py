from datetime import datetime

from pydantic import BaseModel, ConfigDict


class KeywordItem(BaseModel):
    word: str
    count: int


class DailyCountItem(BaseModel):
    date: str
    count: int


class SentimentTrendItem(BaseModel):
    date: str
    positive: int
    negative: int
    neutral: int


class AnalyticsOverviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_feedback: int
    sentiment_distribution: dict[str, int]
    category_distribution: dict[str, int]
    priority_distribution: dict[str, int]
    daily_trend: list[DailyCountItem]
    sentiment_trend: list[SentimentTrendItem]
    top_keywords: list[KeywordItem]
    topic_distribution: dict[str, int]
    anomaly_severity: str
    anomaly_message: str
    generated_at: datetime
