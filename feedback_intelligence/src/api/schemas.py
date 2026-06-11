from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr


# --- Feedback Schemas ---
class FeedbackCreate(BaseModel):
    customer_name: str
    email: EmailStr
    message: str


class FeedbackUpdate(BaseModel):
    customer_name: Optional[str] = None
    email: Optional[EmailStr] = None
    message: Optional[str] = None
    category: Optional[str] = None
    priority_score: Optional[int] = None


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    email: EmailStr
    message: str
    sentiment: str
    category: str
    priority_score: int
    created_at: datetime


# --- Analytics Schemas ---
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


# --- Dashboard Schemas ---
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


# --- AI Insights Schemas ---
class AIInsightsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    insights: str
    generated_at: datetime
    model: str = "gemini-1.5-flash"


class ExecutiveSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    summary: str
    generated_at: datetime
    model: str = "gemini-1.5-flash"


class ActionItem(BaseModel):
    action: str
    priority: Optional[str] = None
    impact: Optional[str] = None
    status: str = "pending"
    created_at: str


class ActionItemsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: list[ActionItem]
    generated_at: datetime
    total_items: int
    model: str = "gemini-1.5-flash"
