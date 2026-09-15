from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "College ERP System"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "dev_secret_key_change_in_production_32bytes_min"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    
    # Database URL default to SQLite for instant local dev fallback if Neon URL not set
    DATABASE_URL: str = "sqlite:///./college_erp_dev.db"
    
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
