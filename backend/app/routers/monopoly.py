from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any

from app.database.database import get_db
from app.database.crud import (
    create_session,
    load_session,
    update_session,
    delete_session
)

from app.graph.graph import referee_agent

router = APIRouter(
    prefix="/monopoly",
    tags=["Monopoly"]
)

class CreateSessionRequest(BaseModel):
    game_state: Dict[str, Any]

class MoveRequest(BaseModel):
    session_id: str
    user_query: str

@router.post("/create")
def create_monopoly_session(
    payload: CreateSessionRequest,
    db: Session = Depends(get_db)
):

    session_id = create_session(
        db,
        "monopoly",
        payload.game_state
    )

    return {
        "session_id": session_id
    }

@router.get("/{session_id}")
def get_monopoly_session(
    session_id: str,
    db: Session = Depends(get_db)
):

    state = load_session(
        db,
        session_id
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
    db: Session = Depends(get_db)
):

    success = delete_session(
        db,
        session_id
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
def monopoly_move(
    payload: MoveRequest,
    db: Session = Depends(get_db)
):

    state = load_session(
        db,
        payload.session_id
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

    result = referee_agent.invoke(graph_state)

# Save the updated Monopoly state returned by LangGraph
    update_session(
    db,
    payload.session_id,
    result["game_state"]
)

    return {
    "decision": result["final_decision"],
    "engine_validation": result["engine_validation"],
    "updated_state": result["game_state"]
}