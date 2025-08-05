from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..core.database import get_database
from ..core.security import verify_password, get_password_hash, create_access_token, verify_token
from ..core.config import settings
from ..models.user import UserCreate, UserLogin, Token, User, UserInDB
from ..services.user_service import UserService
from datetime import datetime

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=dict)
async def register(
    user_data: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_service = UserService(db)
    
    # Check if user already exists
    existing_user = await user_service.get_user_by_phone(user_data.phone)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Check if email already exists
    existing_email = await user_service.get_user_by_email(user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    user_dict = user_data.dict()
    user_dict.pop("password")
    user_dict["hashed_password"] = hashed_password
    user_dict["created_at"] = datetime.utcnow().isoformat()
    user_dict["updated_at"] = datetime.utcnow().isoformat()
    
    created_user = await user_service.create_user(user_dict)
    
    return {
        "message": "User registered successfully",
        "user_id": str(created_user.id)
    }

@router.post("/login", response_model=dict)
async def login(
    credentials: UserLogin,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_service = UserService(db)
    
    # Get user by phone
    user = await user_service.get_user_by_phone(credentials.phone)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.phone, "user_id": str(user.id)},
        expires_delta=access_token_expires
    )
    
    # Convert user to response format
    user_dict = user.dict()
    user_dict.pop("hashed_password", None)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict
    }

@router.post("/verify-otp", response_model=dict)
async def verify_otp(
    otp_data: dict,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # This is a placeholder for OTP verification
    # In a real implementation, you would verify the OTP against a stored value
    phone = otp_data.get("phone")
    otp = otp_data.get("otp")
    
    if not phone or not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone and OTP are required"
        )
    
    # For demo purposes, accept any 6-digit OTP
    if len(otp) != 6 or not otp.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP format"
        )
    
    user_service = UserService(db)
    user = await user_service.get_user_by_phone(phone)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update verification status
    await user_service.update_user(user.id, {"verification_status": "verified"})
    
    return {"message": "OTP verified successfully"}

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> UserInDB:
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    phone = payload.get("sub")
    if phone is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user_service = UserService(db)
    user = await user_service.get_user_by_phone(phone)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

@router.get("/me", response_model=User)
async def get_current_user_info(
    current_user: UserInDB = Depends(get_current_user)
):
    user_dict = current_user.dict()
    user_dict.pop("hashed_password", None)
    return user_dict

