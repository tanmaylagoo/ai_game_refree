import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("database.mongodb")

MONGO_URI = os.getenv("MONGO_URI")

client = None
db = None
users_collection = None

if not MONGO_URI:
    logger.error("MONGO_URI not found in environment variables. Database operations will fail.")
else:
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGO_URI)
        db = client.get_database("ai_game_referee")
        users_collection = db.get_collection("users")
        logger.info("Successfully connected to MongoDB Cluster.")
    except Exception as e:
        logger.error(f"Failed to establish connection to MongoDB: {e}")

def get_users_collection():
    if users_collection is None:
        raise RuntimeError("MongoDB connection is not initialized. Verify your MONGO_URI in the backend .env file.")
    return users_collection
