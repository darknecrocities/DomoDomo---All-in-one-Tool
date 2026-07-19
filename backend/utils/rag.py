import os
import time
import json
import math
import hashlib
import httpx
from typing import List, Tuple

OLLAMA_BASE_URL = os.getenv("OLLAMA_HOST", "http://localhost:11434")

def get_deterministic_mock_vector(text: str, length: int = 384) -> List[float]:
    """Generates a deterministic float vector based on input text hash for offline fallback."""
    h = hashlib.sha256(text.encode('utf-8')).digest()
    vector = []
    for i in range(length):
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
            
            res = await client.post(f"{OLLAMA_BASE_URL}/api/embeddings", json={
                "model": model,
                "prompt": text
            })
            if res.status_code == 200:
                return res.json().get("embedding", [])
    except Exception:
        pass
    
    return get_deterministic_mock_vector(text)

embedding_cache = {}

def get_cached_thought_vector(thought_id: int, embedding_json: str) -> Tuple[List[float], float]:
    if thought_id in embedding_cache:
        return embedding_cache[thought_id]
    try:
        vec = json.loads(embedding_json)
        norm = math.sqrt(sum(x * x for x in vec))
        embedding_cache[thought_id] = (vec, norm)
        return vec, norm
    except Exception:
        return [], 0.0

def cosine_similarity(vecA: List[float], vecB: List[float]) -> float:
    if not vecA or not vecB or len(vecA) != len(vecB):
        return 0.0
    dot_product = sum(a * b for a, b in zip(vecA, vecB))
    normA = math.sqrt(sum(a * a for a in vecA))
    normB = math.sqrt(sum(b * b for b in vecB))
    if normA == 0.0 or normB == 0.0:
        return 0.0
    return dot_product / (normA * normB)

def append_to_cognitive_journal(prompt: str, response: str, category: str, model: str = None):
    journal_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "domo_journal.md")
    
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
