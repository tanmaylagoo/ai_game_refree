import json
import uuid

from sqlalchemy.orm import Session

from app.database.models import GameSession


def create_session(
    db: Session,
    game: str,
    state: dict
):
    session_id = str(uuid.uuid4())

    session = GameSession(
        id=session_id,
        game=game,
        state_json=json.dumps(state)
    )

    db.add(session)
    db.commit()

    return session_id


def load_session(
    db: Session,
    session_id: str
):
    session = db.query(GameSession).filter(
        GameSession.id == session_id
    ).first()

    if session is None:
        return None

    return json.loads(session.state_json)


def update_session(
    db: Session,
    session_id: str,
    state: dict
):
    session = db.query(GameSession).filter(
        GameSession.id == session_id
    ).first()

    if session is None:
        return False

    session.state_json = json.dumps(state)

    db.commit()

    return True


def delete_session(
    db: Session,
    session_id: str
):
    session = db.query(GameSession).filter(
        GameSession.id == session_id
    ).first()

    if session is None:
        return False

    db.delete(session)

    db.commit()

    return True