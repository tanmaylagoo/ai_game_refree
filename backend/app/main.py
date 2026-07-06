from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any

from app.graph.graph import referee_agent

app = FastAPI(
    title="AI Game Referee",
    version="1.0.0"
)

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # change to frontend URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RefereeRequest(BaseModel):
    game_id: str
    user_query: str
    game_state: Dict[str, Any] = Field(default_factory=dict)


@app.get("/")
def home():
    return {
        "message": "AI Game Referee API Running"
    }


@app.post("/referee")
def referee(request: RefereeRequest):

    state = {
        "game_id": request.game_id,
        "user_query": request.user_query,
        "game_state": request.game_state,
        "retrieved_rules": [],
        "engine_validation": {},
        "final_decision": "",
    }

    result = referee_agent.invoke(state)

    return {
        "decision": result["final_decision"],
        "validation": result["engine_validation"],
        "rules": result["retrieved_rules"],
    }