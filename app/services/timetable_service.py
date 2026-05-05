# app/services/timetable_service.py
from datetime import datetime, timedelta
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session

from app import models, schemas


def add_event(db: Session, event: schemas.EventCreate) -> models.Event:
    db_event = models.Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def delete_event(db: Session, event_id: int) -> bool:
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        return False
    db.delete(event)
    db.commit()
    return True

def update_event(db: Session, event_id: int, event_update: schemas.EventCreate) -> Optional[models.Event]:
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        return None

    for key, value in event_update.dict().items():
        setattr(event, key, value)

    db.commit()
    db.refresh(event)
    return event


def get_events_for_day(db: Session, day: datetime) -> List[models.Event]:
    start = datetime(day.year, day.month, day.day)
    end = start + timedelta(days=1)

    return (
        db.query(models.Event)
        .filter(models.Event.start_time >= start)
        .filter(models.Event.start_time < end)
        .order_by(models.Event.start_time)
        .all()
    )


def detect_conflicts(events: List[schemas.Event]) -> List[Tuple[schemas.Event, schemas.Event]]:
    conflicts = []
    events_sorted = sorted(events, key=lambda e: e.start_time)

    for i in range(len(events_sorted)):
        for j in range(i + 1, len(events_sorted)):
            a, b = events_sorted[i], events_sorted[j]

            a_end = a.start_time + timedelta(minutes=a.duration_minutes)
            b_end = b.start_time + timedelta(minutes=b.duration_minutes)

            if a.start_time < b_end and b.start_time < a_end:
                conflicts.append((a, b))

    return conflicts


def find_gaps(events: List[schemas.Event]) -> List[schemas.Gap]:
    gaps: List[schemas.Gap] = []
    if not events:
        return gaps

    events_sorted = sorted(events, key=lambda e: e.start_time)

    for i in range(len(events_sorted) - 1):
        current = events_sorted[i]
        nxt = events_sorted[i + 1]

        current_end = current.start_time + timedelta(minutes=current.duration_minutes)

        if current_end < nxt.start_time:
            diff = int((nxt.start_time - current_end).total_seconds() // 60)
            gaps.append(
                schemas.Gap(
                    start_time=current_end,
                    end_time=nxt.start_time,
                    duration_minutes=diff,
                )
            )

    return gaps


def sort_events(events: List[schemas.Event]) -> List[schemas.Event]:
    return sorted(events, key=lambda e: e.start_time)


def next_gap_after(events: List[schemas.Event], time_point: datetime) -> Optional[schemas.Gap]:
    for gap in find_gaps(events):
        if gap.start_time >= time_point:
            return gap
    return None
