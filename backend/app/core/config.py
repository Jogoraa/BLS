import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "birtu_logistics"
    cloudinary_cloud_name: Optional[str] = None
    cloudinary_api_key: Optional[str] = None
    cloudinary_api_secret: Optional[str] = None
    firebase_credentials_path: Optional[str] = None

    class Config:
        env_file = ".env"

settings = Settings()

