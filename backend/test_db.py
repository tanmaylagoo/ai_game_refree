from app.database.database import SessionLocal
from app.database.crud import (
    create_session,
    load_session,
    update_session,
)

db = SessionLocal()

state = {
    "players": {
        "Alice": {
            "balance": 1500,
            "position": 0
        }
    },
    "current_turn": "Alice"
}

session_id = create_session(
    db,
    "monopoly",
    state
)

print(session_id)

loaded = load_session(
    db,
    session_id
)

print(loaded)

loaded["players"]["Alice"]["balance"] -= 200

update_session(
    db,
    session_id,
    loaded
)

print(load_session(db, session_id))