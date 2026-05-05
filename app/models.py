# app/models.py
from datetime import datetime

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from .database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    start_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)

    is_recurring = Column(Boolean, default=False)
    recurrence_rule = Column(String(255), nullable=True)

    notifications_enabled = Column(Boolean, default=False)
    reminder_minutes_before = Column(Integer, default=30)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
