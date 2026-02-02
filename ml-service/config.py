"""
Configuration management for ML Service
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Backend Integration
    NODE_BACKEND_URL: str = "http://localhost:5000"
    SHARED_SECRET: str = "your-shared-secret-between-services"
    
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017/jobmate"
    
    # Model Configuration
    SPACY_MODEL: str = "en_core_web_md"
    MODEL_VERSION: str = "v1.0"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/ml-service.log"
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5000"
    
    # Cache
    CACHE_TTL: int = 3600
    ENABLE_CACHE: bool = True
    
    # ML Configuration
    MIN_MATCH_THRESHOLD: float = 0.5
    MAX_CAREER_PREDICTIONS: int = 5
    SHAP_SAMPLE_SIZE: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse ALLOWED_ORIGINS into a list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


# Global settings instance
settings = Settings()

# Create necessary directories
os.makedirs("logs", exist_ok=True)
os.makedirs("models", exist_ok=True)
os.makedirs("data", exist_ok=True)
os.makedirs("cache", exist_ok=True)
