import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base Directory path
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    # Application Configurations
    PROJECT_NAME: str = "FinRelief AI"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "sqlite:///./finrelief.db"

    # Security
    SECRET_KEY: str = "9a7c36a43e49be4b3d7b4db9210c4fbf5a04e578c772c67ad2a8a1ab9de8f5d0"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # AI Config
    GEMINI_API_KEY: str = ""

    # Allow CORS origins
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(
        env_file=os.path.join(BASE_DIR, ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
