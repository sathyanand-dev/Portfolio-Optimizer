from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Risk profile
    risk_tolerance = Column(String, default="moderate")  # conservative, moderate, aggressive
    investment_horizon = Column(Integer, default=60)  # months
    
    # Relationships
    portfolios = relationship("Portfolio", back_populates="owner")

class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Portfolio settings
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Optimization metadata (store optimization results for quick access)
    optimization_method = Column(String)  # mean_variance, risk_parity, etc.
    risk_tolerance = Column(String)  # conservative, moderate, aggressive
    investment_amount = Column(Float)  # Total investment amount
    expected_return = Column(Float)  # Expected annual return (0-1)
    expected_volatility = Column(Float)  # Expected volatility (0-1)
    sharpe_ratio = Column(Float)  # Sharpe ratio
    
    # Relationships
    owner = relationship("User", back_populates="portfolios")
    holdings = relationship("PortfolioHolding", back_populates="portfolio")

class PortfolioHolding(Base):
    __tablename__ = "portfolio_holdings"
    
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)
    symbol = Column(String, nullable=False)
    weight = Column(Float, nullable=False)  # Allocation percentage (0-1)
    quantity = Column(Float)  # Number of shares
    avg_purchase_price = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    portfolio = relationship("Portfolio", back_populates="holdings")

class MarketData(Base):
    __tablename__ = "market_data"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, nullable=False, index=True)
    date = Column(DateTime, nullable=False, index=True)
    open_price = Column(Float)
    high_price = Column(Float)
    low_price = Column(Float)
    close_price = Column(Float, nullable=False)
    volume = Column(Integer)
    adjusted_close = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class OptimizationResult(Base):
    __tablename__ = "optimization_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"))
    
    # Optimization parameters
    optimization_type = Column(String, nullable=False)  # black_litterman, risk_parity, etc.
    symbols = Column(Text, nullable=False)  # JSON array of symbols
    weights = Column(Text, nullable=False)  # JSON array of weights
    
    # Results
    expected_return = Column(Float)
    expected_volatility = Column(Float)
    sharpe_ratio = Column(Float)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    parameters = Column(Text)  # JSON of optimization parameters
