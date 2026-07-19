import json
import math
import httpx
from typing import List
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlmodel import Session, select
from ..database import get_session
from ..models import Thought, ThoughtCreate, SearchRequest, GenerateRequest
from ..utils.rag import get_ollama_embedding, embedding_cache, get_cached_thought_vector, append_to_cognitive_journal, OLLAMA_BASE_URL

router = APIRouter(prefix="/api/thoughts", tags=["thoughts"])

@router.get("", response_model=List[Thought])
def get_thoughts(session: Session = Depends(get_session)):
    statement = select(Thought).order_by(Thought.created_at.desc())
    return session.exec(statement).all()

@router.post("", response_model=Thought)
async def create_thought(req: ThoughtCreate, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    vector = await get_ollama_embedding(req.content, req.model)
    embedding_json = json.dumps(vector)

    system_prompt = (
        "You are the Domo AI Brain, a cognitive assistant. Reflect on this user's journal entry, "
        "thought, or story. Provide a constructive, deep insight or story continuation. Keep it "
        "concise (maximum 2-3 sentences)."
    )
    ai_insight = None
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json={
                "model": req.model,
                "prompt": f"{system_prompt}\n\nInput: {req.content}\nInsight:",
                "stream": False
            })
            if res.status_code == 200:
                ai_insight = res.json().get("response", "").strip()
    except Exception:
        pass

    if not ai_insight:
        ai_insight = f"Domo AI analyzed this thought locally. Found themes of {req.category}."

    db_thought = Thought(
        content=req.content,
        embedding_json=embedding_json,
        category=req.category,
        ai_insight=ai_insight
    )
    session.add(db_thought)
    session.commit()
    session.refresh(db_thought)

    if db_thought.id:
        embedding_cache[db_thought.id] = (vector, math.sqrt(sum(x*x for x in vector)))

    background_tasks.add_task(append_to_cognitive_journal, req.content, db_thought.ai_insight, "Thought journaling", req.model)
    return db_thought

@router.post("/search")
async def search_thoughts(req: SearchRequest, session: Session = Depends(get_session)):
    query_vector = await get_ollama_embedding(req.query, req.model)
    query_norm = math.sqrt(sum(x * x for x in query_vector))

    statement = select(Thought)
    all_thoughts = session.exec(statement).all()

    results = []
    for thought in all_thoughts:
        if not thought.id:
            continue
        try:
            thought_vector, thought_norm = get_cached_thought_vector(thought.id, thought.embedding_json)
            if not thought_vector or thought_norm == 0.0 or query_norm == 0.0:
                continue
            
            dot_product = sum(a * b for a, b in zip(query_vector, thought_vector))
            score = dot_product / (query_norm * thought_norm)
            
            if score >= req.threshold:
                results.append({
                    "id": thought.id,
                    "content": thought.content,
                    "category": thought.category,
                    "ai_insight": thought.ai_insight,
                    "created_at": thought.created_at,
                    "score": score
                })
        except Exception:
            continue

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:req.limit]

@router.post("/generate")
async def generate_rag_story(req: GenerateRequest, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    query_vector = await get_ollama_embedding(req.prompt, req.model)
    query_norm = math.sqrt(sum(x * x for x in query_vector))

    statement = select(Thought)
    if req.category:
        statement = statement.where(Thought.category == req.category)
    all_thoughts = session.exec(statement).all()

    scored_thoughts = []
    for t in all_thoughts:
        if not t.id:
            continue
        try:
            t_vector, t_norm = get_cached_thought_vector(t.id, t.embedding_json)
            if not t_vector or t_norm == 0.0 or query_norm == 0.0:
                continue
            
            dot_product = sum(a * b for a, b in zip(query_vector, t_vector))
            score = dot_product / (query_norm * t_norm)
            
            if score >= 0.35:
                scored_thoughts.append((score, t))
        except Exception:
            continue

    scored_thoughts.sort(key=lambda x: x[0], reverse=True)
    top_thoughts = [item[1] for item in scored_thoughts[:3]]

    context_str = ""
    if top_thoughts:
        context_str = "Here are relevant user journal entries & thoughts from memory:\n"
        for thought in top_thoughts:
            context_str += f"- [{thought.category}] {thought.content} (AI Reflection: {thought.ai_insight})\n"
        context_str += "\nUse this context to write a unified story, reflection, or answer.\n"
    else:
        context_str = "No specific past thought context was found. Generate a generic creative response.\n"

    system_prompt = (
        "You are the Domo AI Thought Synthesizer. Combine the user's past journal entries and the "
        "current prompt to write a coherent, personalized story or reflection. Be highly descriptive."
    )
    
    story = None
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json={
                "model": req.model,
                "prompt": f"{system_prompt}\n\nContext:\n{context_str}\nUser Prompt: {req.prompt}\nSynthesized Story:",
                "stream": False,
                "options": {
                    "temperature": req.temperature
                }
            })
            if res.status_code == 200:
                story = res.json().get("response", "").strip()
    except Exception:
        pass

    if not story:
        story_parts = [f"Synthesized RAG story for: '{req.prompt}'."]
        if top_thoughts:
            story_parts.append("Incorporated context:")
            for t in top_thoughts:
                story_parts.append(f"- Remembered your thought: '{t.content}' ({t.ai_insight})")
        else:
            story_parts.append("No context matched to combine.")
        story = "\n".join(story_parts)
    
    background_tasks.add_task(append_to_cognitive_journal, req.prompt, story, "Story Synthesis", req.model)
    return {"story": story, "context_used": [t.content for t in top_thoughts]}
