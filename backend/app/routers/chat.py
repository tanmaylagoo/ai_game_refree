from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, Literal
from starlette.concurrency import run_in_threadpool

from app.graph.graph import referee_agent
from app.routers.auth import get_current_user
from app.database.mongodb import enforce_user_rate_limit

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


class QueryRequest(BaseModel):
    game_id: Literal["chess", "uno", "monopoly"] = Field(
        ...,
        json_schema_extra={"example": "chess"},
        description="Game ID (chess, uno, monopoly)"
    )

    user_query: str = Field(
        ...,
        json_schema_extra={"example": "Nf3"},
        description="Move or question from the player",
        min_length=1,
        max_length=2000
    )

    game_state: Dict[str, Any] = Field(
        default_factory=dict,
        description="Current game state (FEN, UNO hand, Monopoly state, etc.)"
    )


@router.post("/query")
async def process_referee_inquiry(
    payload: QueryRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Executes the AI referee workflow:
    1. Retrieve relevant rules
    2. Validate using deterministic engine
    3. Generate explanation using GROQ
    """

    await enforce_user_rate_limit(current_user["id"], "chat", limit=10)
    try:
        initial_state = {
            "game_id": payload.game_id.lower().strip(),
            "user_query": payload.user_query.strip(),
            "game_state": payload.game_state,

            "retrieved_rules": [],
            "engine_validation": {},
            "final_decision": ""
        }

        output_state = await run_in_threadpool(referee_agent.invoke, initial_state)

        return {
            "decision": output_state["final_decision"],
            "engine_validation": output_state["engine_validation"]
        }

    except Exception as e:
        import logging
        logging.getLogger("routers.chat").exception("Referee workflow failed")
        raise HTTPException(
            status_code=500,
            detail="Referee service failed to process the request"
        )
