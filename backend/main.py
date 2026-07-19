from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routers import memory, thoughts, chat, sync, ml, ocr

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

# Include Modular Routers
app.include_router(memory.router)
app.include_router(thoughts.router)
app.include_router(chat.router)
app.include_router(sync.router)
app.include_router(ml.router)
app.include_router(ocr.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "DomoDomo FastAPI Local Backend",
        "version": "1.0.0"
    }
