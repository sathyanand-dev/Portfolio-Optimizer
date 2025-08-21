from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Indian Portfolio Optimizer"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = "sqlite:///./portfolio_optimizer.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]  # Allow all origins for development
    
    # Market data settings
    DEFAULT_MARKET_SUFFIX: str = ".NS"  # NSE suffix for Indian stocks
    CACHE_DURATION_MINUTES: int = 15  # Cache market data for 15 minutes
    
    # Risk-free rate (India 10-year bond yield approximation)
    RISK_FREE_RATE: float = 0.07  # 7% annual
    
    # Popular Indian market symbols
    POPULAR_STOCKS: List[str] = [
        "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "ICICIBANK.NS", "HINDUNILVR.NS",
        "ITC.NS", "SBIN.NS", "BHARTIARTL.NS", "KOTAKBANK.NS", "LT.NS"
    ]
    
    POPULAR_ETFS: List[str] = [
        "NIFTYBEES.NS",  # Nifty 50 ETF
        "JUNIORBEES.NS",  # Nifty Next 50 ETF
        "GOLDBEES.NS",    # Gold ETF
        "SILVERBEES.NS",  # Silver ETF
        "BANKBEES.NS",    # Bank Nifty ETF
    ]
    
    INDICES: List[str] = [
        "^NSEI",    # Nifty 50
        "^BSESN",   # BSE Sensex
        "^NSEBANK", # Bank Nifty
        "^NSEIT",   # Nifty IT
        "^CNXIT",   # CNX IT
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
