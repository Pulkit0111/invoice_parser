"""
Application Configuration Management

Centralized configuration using Pydantic Settings with environment variable support.
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application Info
    APP_NAME: str = "Invoice Parser"
    APP_DESCRIPTION: str = "AI-powered invoice parser with database persistence"
    VERSION: str = "0.1.0"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    # API Configuration
    API_HOST: str = "localhost"
    API_PORT: int = 8000
    
    # Database Configuration
    DATABASE_URL: str
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 3600
    
    # AI Configuration
    GOOGLE_API_KEY: str
    AI_MODEL_NAME: str = "gemini-2.0-flash"
    AI_TEMPERATURE: float = 0.0
    
    # Authentication Configuration
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: list[str] = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings instance."""
    return settings
