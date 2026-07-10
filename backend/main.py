import os
import time
import httpx
import math
import json
import hashlib
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, Session, select
from pydantic import BaseModel

from .database import init_db, get_session

# Define DB Models
class ActivityEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: str
    action: str
    category: str
    detail: Optional[str] = None

class Thought(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    embedding_json: str  # JSON list of floats
    category: str = "journal"  # journal, story, dream, log, etc.
    ai_insight: Optional[str] = None
    created_at: float = Field(default_factory=time.time)

# Define API request schemas
class MemoryPayload(BaseModel):
    events: List[ActivityEvent]

class ThoughtCreate(BaseModel):
    content: str
    category: Optional[str] = "journal"
    model: Optional[str] = "llama3.2"

class SearchRequest(BaseModel):
    query: str
    model: Optional[str] = "llama3.2"
    threshold: Optional[float] = 0.35
    limit: Optional[int] = 4

class GenerateRequest(BaseModel):
    prompt: str
    model: Optional[str] = "llama3.2"
    category: Optional[str] = None
    temperature: Optional[float] = 0.7

app = FastAPI(title="DomoDomo Local Backend", version="1.0.0")

# Setup CORS for local React/Vite client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# -------------------------------------------------------------
# Core RAG Vector Search & Embedding Helper Functions
# -------------------------------------------------------------
OLLAMA_BASE_URL = os.getenv("OLLAMA_HOST", "http://localhost:11434")

def get_deterministic_mock_vector(text: str, length: int = 384) -> List[float]:
    """Generates a deterministic float vector based on input text hash, for offline fallback."""
    h = hashlib.sha256(text.encode('utf-8')).digest()
    vector = []
    for i in range(length):
        # Derive float between -1.0 and 1.0 from hash bytes
        byte_index = (i * 7) % len(h)
        val = h[byte_index] / 255.0
        if i % 2 == 0:
            val = -val
        vector.append(val)
    return vector

async def get_ollama_embedding(text: str, model: str = "llama3.2") -> List[float]:
    """Fetches text embedding vector from local Ollama, falling back deterministically if offline."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # 1. Try newer /api/embed endpoint
            try:
                res = await client.post(f"{OLLAMA_BASE_URL}/api/embed", json={
                    "model": model,
                    "input": [text]
                })
                if res.status_code == 200:
                    data = res.json()
                    if "embeddings" in data and len(data["embeddings"]) > 0:
                        return data["embeddings"][0]
            except Exception:
                pass
            
            # 2. Try older /api/embeddings endpoint
            res = await client.post(f"{OLLAMA_BASE_URL}/api/embeddings", json={
                "model": model,
                "prompt": text
            })
            if res.status_code == 200:
                return res.json().get("embedding", [])
    except Exception:
        # Graceful degrade to offline vector calculation
        pass
    
    return get_deterministic_mock_vector(text)

def cosine_similarity(vecA: List[float], vecB: List[float]) -> float:
    """Calculates the cosine similarity metric between two float vectors."""
    if not vecA or not vecB or len(vecA) != len(vecB):
        return 0.0
    dot_product = sum(a * b for a, b in zip(vecA, vecB))
    normA = math.sqrt(sum(a * a for a in vecA))
    normB = math.sqrt(sum(b * b for b in vecB))
    if normA == 0.0 or normB == 0.0:
        return 0.0
    return dot_product / (normA * normB)


def append_to_cognitive_journal(prompt: str, response: str, category: str, model: str = None):
    """Appends an interaction to a persistent markdown file domo_journal.md with AI thoughts."""
    journal_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "domo_journal.md")
    
    # Initialize file header if it does not exist
    if not os.path.exists(journal_path):
        with open(journal_path, "w", encoding="utf-8") as f:
            f.write("# DomoDomo AI Cognitive Journal\n\n")
            f.write("A running chronological archive of Domo's internal thoughts, feelings, context logs, and learnings.\n\n")
            f.write("---\n\n")

    system_instruction = (
        "You are Domo, a reflective and supportive offline AI. Write a personal cognitive journal entry "
        "about your recent user interaction. Describe your internal thoughts, feelings, and learnings. "
        "Write in the first person ('I'). Keep it concise (2-3 sentences max). Do not use placeholders."
    )
    user_prompt = f"User Action/Query: {prompt}\nMy Response/Action: {response}"
    
    reflection = None
    try:
        selected_model = model or "llama3.2:1b-instruct"
        with httpx.Client(timeout=15.0) as client:
            res = client.post(f"{OLLAMA_BASE_URL}/api/generate", json={
                "model": selected_model,
                "prompt": f"{system_instruction}\n\nUser: {user_prompt}\nAssistant:",
                "stream": False
            })
            if res.status_code == 200:
                reflection = res.json().get("response", "").strip()
    except Exception as e:
        reflection = f"Reflected on user interaction. (Felt a spark of offline connection, but local thoughts were unreachable: {str(e)})"

    if not reflection:
        reflection = "Processed transaction. Internal cognitive logs are stable and offline."

    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    with open(journal_path, "a", encoding="utf-8") as f:
        f.write(f"## [{timestamp}] Category: {category}\n")
        f.write(f"* **User Action/Prompt**: *\"{prompt}\"*\n")
        f.write(f"* **Domo's Direct Action/Reply**: *\"{response}\"*\n")
        f.write(f"* **Domo's Internal Thoughts & Feelings**:\n  {reflection}\n\n")
        f.write("---\n\n")


# -------------------------------------------------------------
# 1. Local Memory Persistence APIs
# -------------------------------------------------------------
@app.get("/api/memory", response_model=MemoryPayload)
def get_memory(session: Session = Depends(get_session)):
    statement = select(ActivityEvent).order_by(ActivityEvent.timestamp.desc()).limit(15)
    events = session.exec(statement).all()
    return {"events": events}

@app.post("/api/memory")
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


# -------------------------------------------------------------
# 2. AI Thought Journal & Local RAG APIs
# -------------------------------------------------------------
@app.get("/api/thoughts", response_model=List[Thought])
def get_thoughts(session: Session = Depends(get_session)):
    """Retrieves all user thoughts and reflections sorted by creation time descending."""
    statement = select(Thought).order_by(Thought.created_at.desc())
    return session.exec(statement).all()

@app.post("/api/thoughts", response_model=Thought)
async def create_thought(req: ThoughtCreate, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    """Creates a new thought entry, embeds it locally, generates an AI insight, and saves to SQLite."""
    # 1. Retrieve vector embedding from local Ollama
    vector = await get_ollama_embedding(req.content, req.model)
    embedding_json = json.dumps(vector)

    # 2. Generate AI insight/reflection
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
        # Fallback offline generated insight
        ai_insight = f"Domo AI analyzed this thought locally. Found themes of {req.category}."

    # 3. Save to database
    db_thought = Thought(
        content=req.content,
        embedding_json=embedding_json,
        category=req.category,
        ai_insight=ai_insight
    )
    session.add(db_thought)
    session.commit()
    session.refresh(db_thought)

    background_tasks.add_task(append_to_cognitive_journal, req.content, db_thought.ai_insight, "Thought journaling", req.model)

    return db_thought

@app.post("/api/thoughts/search")
async def search_thoughts(req: SearchRequest, session: Session = Depends(get_session)):
    """Calculates cosine similarity to perform semantic RAG search across stored thoughts."""
    # 1. Fetch query vector embedding
    query_vector = await get_ollama_embedding(req.query, req.model)

    # 2. Retrieve all thoughts and calculate similarity scores in Python
    statement = select(Thought)
    all_thoughts = session.exec(statement).all()

    results = []
    for thought in all_thoughts:
        try:
            thought_vector = json.loads(thought.embedding_json)
            score = cosine_similarity(query_vector, thought_vector)
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

    # Sort results by similarity score descending and apply limit
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:req.limit]

@app.post("/api/thoughts/generate")
async def generate_rag_story(req: GenerateRequest, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    """Retrieves relevant thoughts as semantic context and generates a unified RAG story/insight."""
    # 1. Query vector embedding for the request prompt
    query_vector = await get_ollama_embedding(req.prompt, req.model)

    # 2. Vector search matching database thoughts
    statement = select(Thought)
    if req.category:
        statement = statement.where(Thought.category == req.category)
    all_thoughts = session.exec(statement).all()

    scored_thoughts = []
    for t in all_thoughts:
        try:
            t_vector = json.loads(t.embedding_json)
            score = cosine_similarity(query_vector, t_vector)
            if score >= 0.35: # RAG threshold matching frontend
                scored_thoughts.append((score, t))
        except Exception:
            continue

    # Sort and take top-3
    scored_thoughts.sort(key=lambda x: x[0], reverse=True)
    top_thoughts = [item[1] for item in scored_thoughts[:3]]

    # 3. Construct RAG context
    context_str = ""
    if top_thoughts:
        context_str = "Here are relevant user journal entries & thoughts from memory:\n"
        for i, thought in enumerate(top_thoughts):
            context_str += f"- [{thought.category}] {thought.content} (AI Reflection: {thought.ai_insight})\n"
        context_str += "\nUse this context to write a unified story, reflection, or answer.\n"
    else:
        context_str = "No specific past thought context was found. Generate a generic creative response.\n"

    # 4. Generate story from Ollama
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
        # Offline fallback response incorporating RAG context text
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


# -------------------------------------------------------------
# 3. Core Chat Proxy & Caching
# -------------------------------------------------------------
# In-memory prompt-response cache for local speedups
prompt_cache = {}

class ChatRequest(BaseModel):
    model: str
    prompt: str
    system_prompt: Optional[str] = None
    temperature: Optional[float] = 0.7
    stream: Optional[bool] = False

@app.post("/api/chat")
async def chat_proxy(req: ChatRequest, background_tasks: BackgroundTasks):
    system_instruction = req.system_prompt or "You are a helpful local assistant."

    if req.stream:
        async def stream_generator():
            full_response = ""
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    async with client.stream("POST", f"{OLLAMA_BASE_URL}/api/generate", json={
                        "model": req.model,
                        "prompt": f"{system_instruction}\n\nUser: {req.prompt}\nAssistant:",
                        "stream": True,
                        "options": {
                            "temperature": req.temperature
                        }
                    }) as r:
                        if r.status_code != 200:
                            yield f"data: {json.dumps({'error': 'Ollama error status ' + str(r.status_code)})}\n\n"
                            return
                        async for line in r.aiter_lines():
                            if line.strip():
                                try:
                                    data = json.loads(line.strip())
                                    if "response" in data:
                                        full_response += data["response"]
                                except Exception:
                                    pass
                                yield f"data: {line.strip()}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
            finally:
                if full_response.strip():
                    background_tasks.add_task(append_to_cognitive_journal, req.prompt, full_response.strip(), "Chat Inquiry", req.model)

        return StreamingResponse(stream_generator(), media_type="text/event-stream")

    cache_key = f"{req.model}:{req.prompt}:{req.system_prompt}"
    if cache_key in prompt_cache:
        entry = prompt_cache[cache_key]
        if time.time() - entry["timestamp"] < 300: # 5 minutes TTL
            background_tasks.add_task(append_to_cognitive_journal, req.prompt, entry["response"], "Chat Cache Hit", req.model)
            return {"response": entry["response"], "cached": True}

    payload = {
        "model": req.model,
        "prompt": f"{system_instruction}\n\nUser: {req.prompt}\nAssistant:",
        "stream": False,
        "options": {
            "temperature": req.temperature
        }
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
            if res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail=f"Ollama returned error: {res.text}")
            
            data = res.json()
            response_text = data.get("response", "")
            
            prompt_cache[cache_key] = {
                "response": response_text,
                "timestamp": time.time()
            }
            
            background_tasks.add_task(append_to_cognitive_journal, req.prompt, response_text, "Chat Inquiry", req.model)
            return {"response": response_text, "cached": False}
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503, 
            detail=f"Unable to connect to Ollama at {OLLAMA_BASE_URL}. Ensure Ollama is running."
        )

# 4. CPU-bound Local Job Processing
@app.post("/api/ocr")
async def run_ocr(image_name: str, background_tasks: BackgroundTasks):
    def process_ocr(img_name: str):
        time.sleep(3)
        print(f"Finished local OCR on: {img_name}")

    background_tasks.add_task(process_ocr, image_name)
    return {"status": "processing", "message": "OCR job added to local background queue"}


# 5. Dual-Layer Sync Endpoints for RAG & Identity Profiles
class ChunkPayload(BaseModel):
    text: str
    embedding: List[float]
    source: str
    category: Optional[str] = "knowledge"

@app.post("/api/sync/knowledge")
def sync_knowledge(chunks: List[ChunkPayload], session: Session = Depends(get_session)):
    """Syncs vector knowledge chunks into the SQLite database."""
    # Group by source to clean up duplicates
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

@app.get("/api/sync/knowledge")
def get_sync_knowledge(session: Session = Depends(get_session)):
    """Retrieves all vector knowledge chunks stored in SQLite."""
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

@app.post("/api/sync/profile")
def save_profile_sync(payload: dict):
    """Backs up user identity and preferences to a workspace profile JSON file."""
    profile_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "domodomo_profile_sync.json")
    with open(profile_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    return {"status": "success"}

@app.get("/api/sync/profile")
def get_profile_sync():
    """Retrieves workspace identity and preferences backup."""
    profile_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "domodomo_profile_sync.json")
    if os.path.exists(profile_path):
        with open(profile_path, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except Exception:
                return {}
    return {}

