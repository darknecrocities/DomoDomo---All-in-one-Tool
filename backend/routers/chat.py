import time
import json
import httpx
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from ..models import ChatRequest
from ..utils.rag import append_to_cognitive_journal, OLLAMA_BASE_URL

router = APIRouter(prefix="/api/chat", tags=["chat"])

prompt_cache = {}

@router.post("")
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
        if time.time() - entry["timestamp"] < 300:
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
