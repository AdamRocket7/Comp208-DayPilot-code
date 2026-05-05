from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.database import get_db
from app.services import timetable_service
from typing import List
from app.schemas import EventCreate, Event
from app.database import get_db
from app.services.timetable_service import (
    add_event,
    get_events_for_day,
    delete_event,
    detect_conflicts,
    find_gaps,
)


router = APIRouter(tags=["events"])
@router.post("/", response_model=Event)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    return add_event(db, event)


@router.get("/", response_model=List[Event])
def list_events(day: datetime, db: Session = Depends(get_db)):
    return get_events_for_day(db, day)


@router.delete("/{event_id}")
def remove_event(event_id: int, db: Session = Depends(get_db)):
    ok = delete_event(db, event_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"status": "deleted"}


@router.get("/gaps")
def get_gaps(day: datetime, db: Session = Depends(get_db)):
    events = get_events_for_day(db, day)
    gaps = find_gaps(events)
    conflicts = detect_conflicts(events)

    return {
        "gaps": gaps,
        "conflicts": [{"a": c[0], "b": c[1]} for c in conflicts],
    }

@router.put("/{event_id}", response_model=schemas.Event)
def update_event_route(event_id: int, event: schemas.EventCreate, db: Session = Depends(get_db)):
    updated = timetable_service.update_event(db, event_id, event)
    if not updated:
        raise HTTPException(status_code=404, detail="Event not found")
    return updated
