import time
from typing import List, Optional
from sqlmodel import SQLModel, Field
from pydantic import BaseModel

# Database Models
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

# Pydantic Schemas
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

class ChatRequest(BaseModel):
    model: str
    prompt: str
    system_prompt: Optional[str] = None
    temperature: Optional[float] = 0.7
    stream: Optional[bool] = False

class ChunkPayload(BaseModel):
    text: str
    embedding: List[float]
    source: str
    category: Optional[str] = "knowledge"

class MLEvalRequest(BaseModel):
    y_true: List[str]
    y_pred: List[str]
