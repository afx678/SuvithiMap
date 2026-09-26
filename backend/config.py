"""
SuVithiMap Backend Configuration
Handles Supabase credentials, CORS, server settings, and simulation parameters.
"""

import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "SuVithiMap Command Center"
    VERSION: str = "1.0.0"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Supabase credentials (optional, fallback to local DB if not provided)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]

    # Simulation Defaults
    SIMULATION_BUS_COUNT: int = 10
    SIMULATION_DEFAULT_SCENARIO: str = "normal"  # normal | monsoon | rush_hour | hazard_surge
    SIMULATION_TICK_RATE_MS: int = 1500

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
