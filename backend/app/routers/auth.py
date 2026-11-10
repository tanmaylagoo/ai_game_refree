import os
import logging
from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError, OperationFailure

from app.database.mongodb import get_users_collection, ping_mongodb, get_db, get_blacklist_collection

logger = logging.getLogger("routers.auth")

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    logger.warning("JWT_SECRET is not set in environment! Using development fallback. Please set JWT_SECRET in production.")
    SECRET_KEY = "fairplay_ai_default_development_secret_key_102938"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

# Security Header Parser
security = HTTPBearer()

# Helper: Convert MongoDB ObjectId to string in dict
def serialize_mongo_user(user_doc) -> dict:
    if not user_doc:
        return None
    user = dict(user_doc)
    user["id"] = str(user.pop("_id"))
    # Remove password from representation
    user.pop("hashed_password", None)
    return user

# Password Utilities
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# JWT Token Utilities
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

# Pydantic Schemas
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

async def is_token_blacklisted(token: str) -> bool:
    try:
        blacklist = get_blacklist_collection()
        doc = await blacklist.find_one({"token": token})
        return doc is not None
    except Exception as e:
        logger.warning(f"Failed to check token blacklist: {e}")
        return False

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    if await is_token_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    users_coll = get_users_collection()
    user = await users_coll.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return serialize_mongo_user(user)

def handle_database_error(e: Exception):
    logger.error(f"Database error encountered: {type(e).__name__}: {e}")
    if isinstance(e, ServerSelectionTimeoutError):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cannot reach MongoDB cluster. Please check that MongoDB Atlas Network Access has your IP whitelisted (or 0.0.0.0/0 allowed)."
        )
    elif isinstance(e, OperationFailure):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"MongoDB authorization or query error: {str(e)}"
        )
    elif isinstance(e, RuntimeError):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    elif isinstance(e, PyMongoError):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="An unexpected error occurred during database access."
    )

# Endpoints
@router.get("/status", tags=["Authentication"])
async def auth_db_status():
    """Diagnostic endpoint to check MongoDB connectivity and active database."""
    try:
        current_db = get_db()
        ok, msg = await ping_mongodb()
        return {
            "status": "connected" if ok else "unreachable",
            "database": current_db.name,
            "message": msg
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    try:
        users_coll = get_users_collection()
        
        # Check if email already exists
        existing_email = await users_coll.find_one({"email": payload.email.lower()})
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered"
            )
            
        # Check if username already exists
        existing_username = await users_coll.find_one({"username": payload.username})
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already taken"
            )
        
        # Insert new user
        new_user = {
            "username": payload.username,
            "email": payload.email.lower(),
            "hashed_password": hash_password(payload.password),
            "created_at": datetime.utcnow()
        }
        
        result = await users_coll.insert_one(new_user)
        new_user["_id"] = result.inserted_id
        serialized_user = serialize_mongo_user(new_user)

        # Automatically issue JWT access token upon registration
        access_token = create_access_token(data={"sub": serialized_user["id"]})
        
        return {
            "status": "success",
            "message": "User registered successfully",
            "access_token": access_token,
            "token_type": "bearer",
            "user": serialized_user
        }
    except HTTPException:
        raise
    except Exception as e:
        handle_database_error(e)

@router.post("/login", response_model=Token)
async def login(payload: UserLogin):
    try:
        users_coll = get_users_collection()
        
        user = await users_coll.find_one({"email": payload.email.lower()})
        if not user or not verify_password(payload.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        serialized_user = serialize_mongo_user(user)
        
        # Generate token with user id as subject
        access_token = create_access_token(data={"sub": serialized_user["id"]})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": serialized_user
        }
    except HTTPException:
        raise
    except Exception as e:
        handle_database_error(e)

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = verify_token(token)
        if payload and "exp" in payload:
            expires_at = datetime.utcfromtimestamp(payload["exp"])
        else:
            expires_at = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        blacklist = get_blacklist_collection()
        await blacklist.update_one(
            {"token": token},
            {"$set": {"token": token, "expires_at": expires_at, "blacklisted_at": datetime.utcnow()}},
            upsert=True
        )
        return {"status": "success", "message": "Successfully logged out. Token revoked."}
    except Exception as e:
        logger.error(f"Error blacklisting token on logout: {e}")
        return {"status": "success", "message": "Logged out (stateless fallback)"}
