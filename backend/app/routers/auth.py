import os
from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId

from app.database.mongodb import get_users_collection

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "cosmic_referee_super_secret_key_102938")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

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

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
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

# Endpoints
@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
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
    
    return {
        "status": "success",
        "message": "User registered successfully",
        "user_id": str(result.inserted_id)
    }

@router.post("/login", response_model=Token)
async def login(payload: UserLogin):
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

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user
