import os
import logging
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
        logger.info("MongoDB indexes verified/created (token_blacklist TTL index ready).")
    except Exception as e:
        logger.warning(f"Could not initialize MongoDB indexes: {e}")

async def ping_mongodb():
    """Verify that MongoDB cluster is reachable and authenticated."""
    if client is None:
        return False, "MONGO_URI not configured in backend/.env"
    try:
        await client.admin.command('ping')
        return True, f"Connected to MongoDB database '{db.name}'"
    except Exception as e:
        return False, str(e)
