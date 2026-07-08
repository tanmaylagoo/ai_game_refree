from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat
from app.routers import monopoly

from app.routers import chat

app = FastAPI(
    title="AI Tabletop Referee API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")


app.include_router(monopoly.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "AI Tabletop Referee API is running."
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }