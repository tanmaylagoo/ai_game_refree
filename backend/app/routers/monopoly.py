from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Dict, Any
from starlette.concurrency import run_in_threadpool

from app.database.database import get_db
from app.database.crud import (
    create_session,
    load_session,
    update_session,
    delete_session
)

from app.graph.graph import referee_agent
from app.routers.auth import get_current_user
from app.database.mongodb import enforce_user_rate_limit

router = APIRouter(
    prefix="/monopoly",
    tags=["Monopoly"]
)

class CreateSessionRequest(BaseModel):
    game_state: Dict[str, Any] = Field(max_length=100)

class MoveRequest(BaseModel):
    session_id: str = Field(min_length=36, max_length=36)
    user_query: str = Field(min_length=1, max_length=2000)

@router.post("/create")
def create_monopoly_session(
    payload: CreateSessionRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    session_id = create_session(
        db,
        "monopoly",
        payload.game_state,
        current_user["id"]
    )

    return {
        "session_id": session_id
    }

@router.get("/{session_id}")
def get_monopoly_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    state = load_session(
        db,
        session_id,
        current_user["id"]
    )

    if state is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    return state

@router.delete("/{session_id}")
def remove_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    success = delete_session(
        db,
        session_id,
        current_user["id"]
    )

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    return {
        "message": "Session deleted."
    }

@router.post("/move")
async def monopoly_move(
    payload: MoveRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    await enforce_user_rate_limit(current_user["id"], "monopoly-move", limit=10)

    state = load_session(
        db,
        payload.session_id,
        current_user["id"]
    )

    if state is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    graph_state = {

        "game_id": "monopoly",

        "user_query": payload.user_query,

        "game_state": state,

        "retrieved_rules": [],

        "engine_validation": {},

        "final_decision": ""
    }

    result = await run_in_threadpool(referee_agent.invoke, graph_state)


    update_session(
    db,
    payload.session_id,
    result["game_state"],
    current_user["id"]
)

    return {
    "decision": result["final_decision"],
    "engine_validation": result["engine_validation"],
    "updated_state": result["game_state"]
}
