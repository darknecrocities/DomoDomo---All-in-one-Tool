import os
import json
from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from ..database import get_session
from ..models import Thought, ChunkPayload

router = APIRouter(prefix="/api/sync", tags=["sync"])

@router.post("/knowledge")
def sync_knowledge(chunks: List[ChunkPayload], session: Session = Depends(get_session)):
    sources = list(set(c.source for c in chunks))
    for src in sources:
        statement = select(Thought).where(Thought.category == "knowledge", Thought.ai_insight == src)
        existing = session.exec(statement).all()
        for item in existing:
            session.delete(item)
    
    for c in chunks:
        thought = Thought(
            content=c.text,
            embedding_json=json.dumps(c.embedding),
            category=c.category,
            ai_insight=c.source
        )
        session.add(thought)
    session.commit()
    return {"status": "success", "count": len(chunks)}

@router.get("/knowledge")
def get_sync_knowledge(session: Session = Depends(get_session)):
    statement = select(Thought).where(Thought.category == "knowledge")
    results = session.exec(statement).all()
    out = []
    for t in results:
        try:
            emb = json.loads(t.embedding_json) if t.embedding_json else []
        except Exception:
            emb = []
        out.append({
            "text": t.content,
            "embedding": emb,
            "source": t.ai_insight,
            "category": t.category
        })
    return out

@router.post("/profile")
def save_profile_sync(payload: dict):
    profile_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "domodomo_profile_sync.json")
    with open(profile_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    return {"status": "success"}

@router.get("/profile")
def get_profile_sync():
    profile_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "domodomo_profile_sync.json")
    if os.path.exists(profile_path):
        with open(profile_path, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except Exception:
                return {}
    return {}
