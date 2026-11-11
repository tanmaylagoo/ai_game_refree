import os
import logging
import hashlib
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("database.mongodb")

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME") or os.getenv("MONGO_DATABASE")
MONGO_TIMEOUT_MS = int(os.getenv("MONGO_TIMEOUT_MS", "5000"))

client = None
db = None
users_collection = None
blacklist_collection = None
rate_limit_collection = None

if not MONGO_URI:
    logger.error("MONGO_URI not found in environment variables. Database operations will fail.")
else:
    try:
        # Connect to MongoDB with timeout
        client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=MONGO_TIMEOUT_MS)
        
        # Resolve database name: MONGO_DB_NAME env var -> URI default -> 'ai_game_referee'
        if MONGO_DB_NAME:
            db = client.get_database(MONGO_DB_NAME)
        else:
            try:
                db = client.get_default_database(default="ai_game_referee")
            except Exception:
                db = client.get_database("ai_game_referee")

        users_collection = db.get_collection("users")
        blacklist_collection = db.get_collection("token_blacklist")
        rate_limit_collection = db.get_collection("rate_limits")
        logger.info(f"MongoDB initialized. Target database: '{db.name}', Collections: 'users', 'token_blacklist'.")
    except Exception as e:
        logger.error(f"Failed to initialize MongoDB client: {e}")

def get_db():
    if db is None:
        raise RuntimeError("MongoDB connection is not initialized. Verify your MONGO_URI in the backend .env file.")
    return db

def get_users_collection():
    if users_collection is None:
        raise RuntimeError("MongoDB connection is not initialized. Verify your MONGO_URI in the backend .env file.")
    return users_collection

def get_blacklist_collection():
    if blacklist_collection is None:
        raise RuntimeError("MongoDB connection is not initialized. Verify your MONGO_URI in the backend .env file.")
    return blacklist_collection

async def ensure_mongodb_indexes():
    """Ensure required indexes exist, such as TTL index on token_blacklist."""
    if db is None:
        return
    try:
        b_coll = db.get_collection("token_blacklist")
        # TTL index: deletes document once current time >= expires_at
        await b_coll.create_index("expires_at", expireAfterSeconds=0)
        await b_coll.create_index("token", unique=True)
        await db.get_collection("rate_limits").create_index("expires_at", expireAfterSeconds=0)
        logger.info("MongoDB indexes verified/created (token_blacklist TTL index ready).")
    except Exception as e:
        logger.error("Could not initialize MongoDB indexes: %s", type(e).__name__)
        raise RuntimeError("Could not initialize required MongoDB indexes") from e


async def enforce_user_rate_limit(user_id: str, action: str, limit: int, window_seconds: int = 60):
    """Apply an atomic, shared per-user request limit using MongoDB counters."""
    if rate_limit_collection is None:
        raise RuntimeError("MongoDB rate limiter is not initialized")
    now = datetime.utcnow()
    window = int(now.timestamp()) // window_seconds
    bucket_id = hashlib.sha256(f"{action}:{user_id}:{window}".encode()).hexdigest()
    await rate_limit_collection.update_one(
        {"_id": bucket_id},
        {"$inc": {"count": 1}, "$setOnInsert": {"expires_at": now + timedelta(seconds=window_seconds * 2)}},
        upsert=True,
    )
    bucket = await rate_limit_collection.find_one({"_id": bucket_id}, {"count": 1})
    if bucket and bucket["count"] > limit:
        from fastapi import HTTPException
        raise HTTPException(status_code=429, detail="Request limit reached; try again shortly")

async def ping_mongodb():
    """Verify that MongoDB cluster is reachable and authenticated."""
    if client is None:
        return False, "MONGO_URI not configured in backend/.env"
    try:
        await client.admin.command('ping')
        return True, f"Connected to MongoDB database '{db.name}'"
    except Exception as e:
        return False, str(e)
