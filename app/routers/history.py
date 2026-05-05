# app/routers/history.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import JWTError

from app.models import SearchHistory, User
from app.schemas import SearchHistoryOut
from app.database import get_db
from app.services.auth_service import decode_access_token

router = APIRouter(prefix="/history", tags=["history"])


def get_current_user(token: str, db: Session) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.get("/", response_model=list[SearchHistoryOut])
def get_history(token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    return user.search_history


@router.post("/add")
def add_history(place_name: str, token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)

    entry = SearchHistory(user_id=user.id, place_name=place_name)
    db.add(entry)
    db.commit()

    return {"message": "Added to history"}
