import os
from pathlib import Path
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from sqlalchemy import inspect, text
from starlette.concurrency import run_in_threadpool

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.routers import chat
from app.routers import auth
from app.routers import monopoly
from app.database.mongodb import ensure_mongodb_indexes, get_db as get_mongo_db, ping_mongodb
from app.database.database import Base, engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    if not os.getenv("GROQ_API_KEY"):
        raise RuntimeError("GROQ_API_KEY must be configured")
    mongo_db = get_mongo_db()
    ok, _ = await ping_mongodb()
    if not ok:
        raise RuntimeError("MongoDB is unavailable")
    await mongo_db.get_collection("users").create_index("email", unique=True)
    await mongo_db.get_collection("users").create_index("username", unique=True)
    await ensure_mongodb_indexes()
    Base.metadata.create_all(bind=engine)
    if "user_id" not in {column["name"] for column in inspect(engine).get_columns("game_sessions")}:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE game_sessions ADD COLUMN user_id VARCHAR"))
    chroma_dir = Path(os.getenv("CHROMA_PERSIST_DIR", "./chroma_db"))
    chroma_dir.mkdir(parents=True, exist_ok=True)
    if not (chroma_dir / "chroma.sqlite3").exists():
        await run_in_threadpool(_ingest_rulebooks)
    yield


def _ingest_rulebooks():
    from app.rag.load_rules import load_rulebook
    from app.rag.ingest import ingest_documents

    base_dir = Path(__file__).resolve().parent
    rulebooks = {
        "chess": base_dir / "rulebooks" / "chess" / "Chess.pdf",
        "uno": base_dir / "rulebooks" / "uno" / "uno.pdf",
        "monopoly": base_dir / "rulebooks" / "monopoly" / "monopoly.pdf",
    }
    for game, pdf_path in rulebooks.items():
        if not pdf_path.is_file():
            raise RuntimeError(f"Required rulebook is missing: {pdf_path.name}")
        ingest_documents(game, load_rulebook(str(pdf_path)))

production = os.getenv("APP_ENV", "development").lower() == "production"

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
    lifespan=lifespan,
    docs_url=None if production else "/docs",
    redoc_url=None if production else "/redoc",
    openapi_url=None if production else "/openapi.json",
)

# CORS Configuration
cors_origins_env = os.getenv("CORS_ORIGINS", "").strip()
if cors_origins_env and "*" not in cors_origins_env:
    allowed_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
elif production:
    raise RuntimeError("CORS_ORIGINS must contain the exact deployed frontend origin(s)")
else:
    allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Register API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(monopoly.router, prefix="/api")

@app.get("/", tags=["System"])
async def root():
    return {
        "message": "FairPlay AI API is running.",
        "docs": None if production else "/docs",
        "health": "/health"
    }

@app.get("/health", tags=["System"])
async def health():
    ok, _ = await ping_mongodb()
    if not ok:
        raise HTTPException(status_code=503, detail="Service unavailable")
    return {"status": "healthy", "service": "FairPlay AI API"}
