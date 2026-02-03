"""
Configuration management for ML Service
(Render-safe)
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 10000   # Render default-safe
    ENVIRONMENT: str = "development"

    # Security
    SECRET_KEY: str = "change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Backend Integration
    NODE_BACKEND_URL: str = "http://localhost:5000"
    SHARED_SECRET: str = "shared-secret-between-node-and-ml"

    # Database (optional, safe if unused)
    MONGODB_URI: str = "mongodb://localhost:27017/jobmate"

    # NLP / ML Configuration (NO spaCy)
    NLP_ENGINE: str = "nltk"
    MODEL_VERSION: str = "v1.0"
    MIN_MATCH_THRESHOLD: float = 0.5

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/ml-service.log"

    # CORS
    ALLOWED_ORIGINS: str = "*"

    # Cache
    ENABLE_CACHE: bool = False
    CACHE_TTL: int = 3600

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


# Global settings
settings = Settings()

# Ensure directories exist (Render-safe)
for d in ["logs", "models", "data", "cache"]:
    os.makedirs(d, exist_ok=True)
