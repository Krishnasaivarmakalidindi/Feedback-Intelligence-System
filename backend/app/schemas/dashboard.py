from datetime import datetime
from pydantic import BaseModel, ConfigDict


class KPIMetrics(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_feedback: int
    avg_priority_score: float
    sentiment_positive_pct: float
    sentiment_negative_pct: float
    sentiment_neutral_pct: float
    bug_count: int
    feature_request_count: int
    avg_feedback_per_day: float
    critical_feedback_count: int


class DashboardDataResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    kpis: KPIMetrics
    analytics: dict
    generated_at: str


class SentimentTimelineItem(BaseModel):
    date: str
    positive: int
    negative: int
    neutral: int
    total: int


class PriorityBreakdownItem(BaseModel):
    count: int
    percentage: float


class PriorityBreakdownResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    priority_1: PriorityBreakdownItem
    priority_2: PriorityBreakdownItem
    priority_3: PriorityBreakdownItem
    priority_4: PriorityBreakdownItem
    priority_5: PriorityBreakdownItem
