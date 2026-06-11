from datetime import datetime
from pydantic import BaseModel, ConfigDict


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
    priority: str | None = None
    impact: str | None = None
    status: str = "pending"
    created_at: str


class ActionItemsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: list[ActionItem]
    generated_at: datetime
    total_items: int
    model: str = "gemini-1.5-flash"
