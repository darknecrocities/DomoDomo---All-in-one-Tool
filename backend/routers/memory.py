from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from ..database import get_session
from ..models import ActivityEvent, MemoryPayload

router = APIRouter(prefix="/api/memory", tags=["memory"])

@router.get("", response_model=MemoryPayload)
def get_memory(session: Session = Depends(get_session)):
    statement = select(ActivityEvent).order_by(ActivityEvent.timestamp.desc()).limit(15)
    events = session.exec(statement).all()
    return {"events": events}

@router.post("")
def save_memory(payload: MemoryPayload, session: Session = Depends(get_session)):
    session.query(ActivityEvent).delete()
    for ev in payload.events:
        db_event = ActivityEvent(
            timestamp=ev.timestamp,
            action=ev.action,
            category=ev.category,
            detail=ev.detail
        )
        session.add(db_event)
    session.commit()
    return {"status": "success"}
