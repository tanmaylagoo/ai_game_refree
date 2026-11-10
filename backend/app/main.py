import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import chat
from app.routers import auth
from app.routers import monopoly
from app.database.mongodb import ensure_mongodb_indexes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database indexes (like TTL blacklist) are configured
    await ensure_mongodb_indexes()
    yield

app = FastAPI(
    title="FairPlay AI API",
    description="""
An AI-powered tabletop referee capable of validating moves and explaining
official rules for multiple board games using:

- LangGraph
- RAG (ChromaDB)
- GROQ
- Deterministic Game Engines
""",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
cors_origins_env = os.getenv("CORS_ORIGINS", "").strip()
if cors_origins_env and cors_origins_env != "*":
    allowed_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
else:
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(monopoly.router, prefix="/api")

@app.get("/", tags=["System"])
async def root():
    return {
        "message": "FairPlay AI API is running.",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", tags=["System"])
async def health():
    return {
        "status": "healthy",
        "service": "FairPlay AI API"
    }
