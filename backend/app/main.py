#updated main.py

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import chat
from app.routers import monopoly

app = FastAPI(
    title="AI Tabletop Referee API",
    description="""
An AI-powered tabletop referee capable of validating moves and explaining
official rules for multiple board games using:

- LangGraph
- RAG (ChromaDB)
- Gemini
- Deterministic Game Engines
- SQLite Session Management (Monopoly)
""",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(chat.router, prefix="/api")
app.include_router(monopoly.router, prefix="/api")


@app.get("/", tags=["System"])
async def root():
    return {
        "message": "AI Tabletop Referee API is running.",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", tags=["System"])
async def health():
    return {
        "status": "healthy",
        "service": "AI Tabletop Referee API"
    }