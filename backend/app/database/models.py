from sqlalchemy import Column, String, Text, DateTime
from datetime import datetime

from app.database.database import Base


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(String, primary_key=True)

    game = Column(String, nullable=False)

    state_json = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )