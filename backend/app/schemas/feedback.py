from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class FeedbackCreate(BaseModel):
    customer_name: str
    email: EmailStr
    message: str


class FeedbackUpdate(BaseModel):
    customer_name: Optional[str] = None
    email: Optional[EmailStr] = None
    message: Optional[str] = None


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

