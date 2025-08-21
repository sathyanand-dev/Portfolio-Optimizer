from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class RiskTolerance(str, Enum):
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"

class OptimizationType(str, Enum):
    BLACK_LITTERMAN = "black_litterman"
    RISK_PARITY = "risk_parity"
    MEAN_VARIANCE = "mean_variance"
    MINIMUM_VARIANCE = "minimum_variance"
    MONTE_CARLO = "monte_carlo"

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    risk_tolerance: RiskTolerance = RiskTolerance.MODERATE
    investment_horizon: int = Field(60, description="Investment horizon in months")

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    risk_tolerance: Optional[RiskTolerance] = None
    investment_horizon: Optional[int] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Portfolio schemas
class PortfolioHoldingBase(BaseModel):
    symbol: str
    weight: float = Field(..., ge=0, le=1, description="Allocation weight (0-1)")
    quantity: Optional[float] = None
    avg_purchase_price: Optional[float] = None

class PortfolioHoldingCreate(PortfolioHoldingBase):
    pass

class PortfolioHolding(PortfolioHoldingBase):
    id: int
    portfolio_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PortfolioBase(BaseModel):
    name: str
    description: Optional[str] = None

class PortfolioCreate(PortfolioBase):
    holdings: List[PortfolioHoldingCreate] = []
    # Optimization metadata
    optimization_method: Optional[str] = None
    risk_tolerance: Optional[str] = None
    investment_amount: Optional[float] = None
    expected_return: Optional[float] = None
    expected_volatility: Optional[float] = None
    sharpe_ratio: Optional[float] = None

class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    holdings: Optional[List[PortfolioHoldingCreate]] = None

class Portfolio(PortfolioBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    holdings: List[PortfolioHolding] = []
    # Optimization metadata
    optimization_method: Optional[str] = None
    risk_tolerance: Optional[str] = None
    investment_amount: Optional[float] = None
    expected_return: Optional[float] = None
    expected_volatility: Optional[float] = None
    sharpe_ratio: Optional[float] = None

    class Config:
        from_attributes = True

# Market data schemas
class StockData(BaseModel):
    symbol: str
    current_price: float
    change: float
    change_percent: float
    volume: int
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None

class HistoricalData(BaseModel):
    symbol: str
    dates: List[str]
    prices: List[float]
    volumes: List[int]
    returns: List[float]

class HistoricalDataRequest(BaseModel):
    symbols: List[str]
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    period: Optional[str] = "1y"
    interval: Optional[str] = "1d"

# Optimization schemas
class OptimizationRequest(BaseModel):
    symbols: List[str]
    optimization_type: OptimizationType
    risk_tolerance: Optional[RiskTolerance] = RiskTolerance.MODERATE
    target_return: Optional[float] = None
    risk_aversion: Optional[float] = 1.0
    confidence_level: Optional[float] = 0.95
    lookback_period: Optional[int] = 252  # Trading days

class BlackLittermanRequest(OptimizationRequest):
    market_caps: Optional[Dict[str, float]] = None
    views: Optional[Dict[str, float]] = None  # Expected returns for specific assets
    view_confidences: Optional[Dict[str, float]] = None

class OptimizationResult(BaseModel):
    symbols: List[str]
    weights: List[float]
    expected_return: float
    expected_volatility: float
    sharpe_ratio: float
    optimization_type: str
    metadata: Dict[str, Any] = {}

# Analytics schemas
class PerformanceMetrics(BaseModel):
    total_return: float
    annualized_return: float
    volatility: float
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown: float
    calmar_ratio: float
    beta: Optional[float] = None
    alpha: Optional[float] = None
    var_95: float  # Value at Risk
    cvar_95: float  # Conditional Value at Risk

class RiskMetrics(BaseModel):
    volatility: float
    max_drawdown: float
    var_95: float
    cvar_95: float
    downside_deviation: float
    tracking_error: Optional[float] = None

class BacktestRequest(BaseModel):
    symbols: List[str]
    weights: List[float]
    start_date: str
    end_date: str
    benchmark: Optional[str] = "^NSEI"  # Nifty 50
    rebalance_frequency: Optional[str] = "monthly"  # daily, weekly, monthly, quarterly

class BacktestResult(BaseModel):
    portfolio_returns: List[float]
    benchmark_returns: List[float]
    dates: List[str]
    performance_metrics: PerformanceMetrics
    drawdown_periods: List[Dict[str, Any]]
    sector_allocation: Dict[str, float]

# Sector and asset class schemas
class SectorData(BaseModel):
    name: str
    stocks: List[str]
    weight_in_index: float
    performance_1d: float
    performance_1w: float
    performance_1m: float
    performance_ytd: float

class AssetAllocation(BaseModel):
    equity_percent: float = Field(..., ge=0, le=100)
    gold_percent: float = Field(..., ge=0, le=100)
    silver_percent: float = Field(..., ge=0, le=100)
    cash_percent: float = Field(..., ge=0, le=100)
    
    class Config:
        validate_assignment = True
        
    def __init__(self, **data):
        super().__init__(**data)
        total = self.equity_percent + self.gold_percent + self.silver_percent + self.cash_percent
        if abs(total - 100) > 0.01:  # Allow for small floating point errors
            raise ValueError("Asset allocation percentages must sum to 100%")

# Response schemas
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int
