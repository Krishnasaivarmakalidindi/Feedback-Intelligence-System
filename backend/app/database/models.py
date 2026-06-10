from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

from app.database.db import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)

    customer_name = Column(String, nullable=False)

    email = Column(String, nullable=False)

    message = Column(Text, nullable=False)

    sentiment = Column(String, default="pending")

    category = Column(String, default="general")

    created_at = Column(DateTime, default=datetime.utcnow)

