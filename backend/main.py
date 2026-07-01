import os
import time
import httpx
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
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

# Define API request schemas
class MemoryPayload(BaseModel):
    events: List[ActivityEvent]

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

# 1. Local Memory Persistence APIs (Replacing Vite dev-only domodomo_knowledge.json writes)
@app.get("/api/memory", response_model=MemoryPayload)
def get_memory(session: Session = Depends(get_session)):
    # Retrieve the last 15 local events sorted by timestamp descending
    statement = select(ActivityEvent).order_by(ActivityEvent.timestamp.desc()).limit(15)
    events = session.exec(statement).all()
    # Return chronologically or keep it sorted
    return {"events": events}

@app.post("/api/memory")
def save_memory(payload: MemoryPayload, session: Session = Depends(get_session)):
    # Clear existing events to keep db clean (local mode is just a history cache like the original)
    session.query(ActivityEvent).delete()
    for ev in payload.events:
        # Create fresh DB entry
        db_event = ActivityEvent(
            timestamp=ev.timestamp,
            action=ev.action,
            category=ev.category,
            detail=ev.detail
        )
        session.add(db_event)
    session.commit()
    return {"status": "success"}

# 2. Local AI / Ollama Proxy & Caching
OLLAMA_BASE_URL = os.getenv("OLLAMA_HOST", "http://localhost:11434")

# In-memory prompt-response cache for local speedups
prompt_cache = {}

class ChatRequest(BaseModel):
    model: str
    prompt: str
    system_prompt: Optional[str] = None
    temperature: Optional[float] = 0.7

@app.post("/api/chat")
async def chat_proxy(req: ChatRequest):
    """Secure client calls by proxying and caching local Ollama LLM requests."""
    cache_key = f"{req.model}:{req.prompt}:{req.system_prompt}"
    if cache_key in prompt_cache:
        # Check simple cache TTL
        entry = prompt_cache[cache_key]
        if time.time() - entry["timestamp"] < 300: # 5 minutes TTL
            return {"response": entry["response"], "cached": True}

    # Prepare Ollama request payload
    system_instruction = req.system_prompt or "You are a helpful local assistant."
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
            
            # Cache the response
            prompt_cache[cache_key] = {
                "response": response_text,
                "timestamp": time.time()
            }
            
            return {"response": response_text, "cached": False}
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503, 
            detail=f"Unable to connect to Ollama at {OLLAMA_BASE_URL}. Ensure Ollama is running."
        )

# 3. CPU-bound Local Job Processing (OCR / Image Resize simulations)
@app.post("/api/ocr")
async def run_ocr(image_name: str, background_tasks: BackgroundTasks):
    """Offloads OCR scanning to local background processing to prevent thread-blocking."""
    def process_ocr(img_name: str):
        # Simulate local tesseract scan latency
        time.sleep(3)
        print(f"Finished local OCR on: {img_name}")

    background_tasks.add_task(process_ocr, image_name)
    return {"status": "processing", "message": "OCR job added to local background queue"}
