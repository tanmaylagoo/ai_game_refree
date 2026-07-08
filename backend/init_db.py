from app.database.database import engine, Base

import app.database.models

Base.metadata.create_all(bind=engine)

print("Database initialized successfully.")