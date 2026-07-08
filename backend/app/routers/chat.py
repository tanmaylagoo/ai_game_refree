from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any

from app.graph.graph import referee_agent

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


class QueryRequest(BaseModel):
    game_id: str = Field(
        ...,
        json_schema_extra={"example": "chess"},
        description="Game ID (chess, uno, monopoly)"
    )

    user_query: str = Field(
        ...,
        json_schema_extra={"example": "Nf3"},
        description="Move or question from the player"
    )

    game_state: Dict[str, Any] = Field(
        default_factory=dict,
        description="Current game state (FEN, UNO hand, Monopoly state, etc.)"
    )


@router.post("/query")
async def process_referee_inquiry(payload: QueryRequest):
    """
    Executes the AI referee workflow:
    1. Retrieve relevant rules
    2. Validate using deterministic engine
    3. Generate explanation using Gemini
    """

    try:
        initial_state = {
            "game_id": payload.game_id.lower().strip(),
            "user_query": payload.user_query.strip(),
            "game_state": payload.game_state,

            "retrieved_rules": [],
            "engine_validation": {},
            "final_decision": ""
        }

        output_state = referee_agent.invoke(initial_state)

        return {
            "decision": output_state["final_decision"],
            "engine_validation": output_state["engine_validation"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Graph execution failed: {str(e)}"
        )