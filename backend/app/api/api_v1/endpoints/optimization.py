from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict
from app.services.optimization import portfolio_optimizer
from app.models.schemas import (
    OptimizationRequest,
    BlackLittermanRequest,
    OptimizationResult,
    OptimizationType,
    RiskTolerance,
    AssetAllocation
)
from app.auth.dependencies import get_current_active_user
from app.models.database import User

router = APIRouter()

@router.post("/optimize", response_model=OptimizationResult)
def optimize_portfolio(
    request: OptimizationRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Optimize portfolio using specified optimization method."""
    
    if len(request.symbols) < 2:
        raise HTTPException(status_code=400, detail="At least 2 symbols required for optimization")
    
    if len(request.symbols) > 50:
        raise HTTPException(status_code=400, detail="Too many symbols. Maximum 50 allowed.")
    
    try:
        optimization_kwargs = {
            "symbols": request.symbols,
            "optimization_type": request.optimization_type,
            "risk_tolerance": request.risk_tolerance,
            "period": f"{request.lookback_period}d" if request.lookback_period else "1y"
        }
        
        # Add target return if specified
        if request.target_return:
            optimization_kwargs["target_return"] = request.target_return
        
        result = portfolio_optimizer.optimize_portfolio(**optimization_kwargs)
        return OptimizationResult(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@router.post("/black-litterman", response_model=OptimizationResult)
def black_litterman_optimization(
    request: BlackLittermanRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Perform Black-Litterman portfolio optimization."""
    
    if len(request.symbols) < 2:
        raise HTTPException(status_code=400, detail="At least 2 symbols required for optimization")
    
    try:
        result = portfolio_optimizer.black_litterman_optimization(
            symbols=request.symbols,
            market_caps=request.market_caps,
            views=request.views,
            view_confidences=request.view_confidences,
            risk_tolerance=request.risk_tolerance,
            period=f"{request.lookback_period}d" if request.lookback_period else "1y"
        )
        return OptimizationResult(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Black-Litterman optimization failed: {str(e)}")

@router.post("/risk-parity", response_model=OptimizationResult)
def risk_parity_optimization(
    symbols: List[str],
    lookback_period: Optional[int] = 252,
    current_user: User = Depends(get_current_active_user)
):
    """Perform Risk Parity portfolio optimization."""
    
    if len(symbols) < 2:
        raise HTTPException(status_code=400, detail="At least 2 symbols required for optimization")
    
    try:
        result = portfolio_optimizer.risk_parity_optimization(
            symbols=symbols,
            period=f"{lookback_period}d" if lookback_period else "1y"
        )
        return OptimizationResult(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk Parity optimization failed: {str(e)}")

@router.post("/mean-variance", response_model=OptimizationResult)
def mean_variance_optimization(
    symbols: List[str],
    risk_tolerance: RiskTolerance = RiskTolerance.MODERATE,
    target_return: Optional[float] = None,
    lookback_period: Optional[int] = 252,
    current_user: User = Depends(get_current_active_user)
):
    """Perform Mean-Variance portfolio optimization."""
    
    if len(symbols) < 2:
        raise HTTPException(status_code=400, detail="At least 2 symbols required for optimization")
    
    try:
        result = portfolio_optimizer.mean_variance_optimization(
            symbols=symbols,
            risk_tolerance=risk_tolerance,
            target_return=target_return,
            period=f"{lookback_period}d" if lookback_period else "1y"
        )
        return OptimizationResult(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mean-Variance optimization failed: {str(e)}")

@router.post("/minimum-variance", response_model=OptimizationResult)
def minimum_variance_optimization(
    symbols: List[str],
    lookback_period: Optional[int] = 252,
    current_user: User = Depends(get_current_active_user)
):
    """Perform Minimum Variance portfolio optimization."""
    
    if len(symbols) < 2:
        raise HTTPException(status_code=400, detail="At least 2 symbols required for optimization")
    
    try:
        result = portfolio_optimizer.minimum_variance_optimization(
            symbols=symbols,
            period=f"{lookback_period}d" if lookback_period else "1y"
        )
        return OptimizationResult(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Minimum Variance optimization failed: {str(e)}")

@router.get("/asset-allocation", response_model=Dict[str, float])
def suggest_asset_allocation(
    risk_tolerance: RiskTolerance = RiskTolerance.MODERATE,
    investment_horizon: Optional[int] = None,
    current_age: Optional[int] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get suggested asset allocation based on user profile."""
    
    # Use user's profile if not provided
    if investment_horizon is None:
        investment_horizon = current_user.investment_horizon
    
    try:
        allocation = portfolio_optimizer.suggest_asset_allocation(
            risk_tolerance=risk_tolerance,
            investment_horizon=investment_horizon,
            current_age=current_age
        )
        return allocation
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Asset allocation suggestion failed: {str(e)}")

@router.get("/efficient-frontier")
def get_efficient_frontier(
    symbols: List[str],
    num_portfolios: int = 50,
    current_user: User = Depends(get_current_active_user)
):
    """Calculate efficient frontier for given symbols."""
    
    if len(symbols) < 2:
        raise HTTPException(status_code=400, detail="At least 2 symbols required")
    
    if len(symbols) > 20:
        raise HTTPException(status_code=400, detail="Too many symbols. Maximum 20 allowed.")
    
    try:
        from app.services.data_service import data_service
        from pypfopt import EfficientFrontier, expected_returns, risk_models
        import numpy as np
        
        # Get price data
        prices_data = {}
        for symbol in symbols:
            hist_data = data_service.get_historical_data(symbol, "1y")
            prices_data[symbol] = hist_data["prices"]
        
        import pandas as pd
        prices_df = pd.DataFrame(prices_data).dropna()
        
        # Calculate expected returns and covariance
        mu = expected_returns.mean_historical_return(prices_df)
        S = risk_models.sample_cov(prices_df)
        
        # Generate efficient frontier
        ef = EfficientFrontier(mu, S)
        
        # Calculate frontier points
        min_return = mu.min()
        max_return = mu.max()
        
        frontier_portfolios = []
        target_returns = np.linspace(min_return, max_return * 0.95, num_portfolios)
        
        for target_return in target_returns:
            try:
                ef_copy = EfficientFrontier(mu, S)  # Create fresh instance
                weights = ef_copy.efficient_return(target_return)
                performance = ef_copy.portfolio_performance()
                
                frontier_portfolios.append({
                    "expected_return": float(performance[0]),
                    "volatility": float(performance[1]),
                    "sharpe_ratio": float(performance[2]),
                    "weights": {symbol: float(weight) for symbol, weight in weights.items()}
                })
            except:
                continue
        
        # Calculate optimal portfolios
        ef_max_sharpe = EfficientFrontier(mu, S)
        max_sharpe_weights = ef_max_sharpe.max_sharpe()
        max_sharpe_performance = ef_max_sharpe.portfolio_performance()
        
        ef_min_vol = EfficientFrontier(mu, S)
        min_vol_weights = ef_min_vol.min_volatility()
        min_vol_performance = ef_min_vol.portfolio_performance()
        
        return {
            "frontier_portfolios": frontier_portfolios,
            "optimal_portfolios": {
                "max_sharpe": {
                    "weights": {symbol: float(weight) for symbol, weight in max_sharpe_weights.items()},
                    "performance": {
                        "expected_return": float(max_sharpe_performance[0]),
                        "volatility": float(max_sharpe_performance[1]),
                        "sharpe_ratio": float(max_sharpe_performance[2])
                    }
                },
                "min_volatility": {
                    "weights": {symbol: float(weight) for symbol, weight in min_vol_weights.items()},
                    "performance": {
                        "expected_return": float(min_vol_performance[0]),
                        "volatility": float(min_vol_performance[1]),
                        "sharpe_ratio": float(min_vol_performance[2])
                    }
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Efficient frontier calculation failed: {str(e)}")

@router.get("/recommended-portfolios")
def get_recommended_portfolios(
    current_user: User = Depends(get_current_active_user)
):
    """Get recommended portfolios based on user's risk tolerance."""
    
    try:
        from app.config import settings
        
        # Define recommended portfolios for different risk levels
        portfolios = {
            "conservative": {
                "name": "Conservative Portfolio",
                "description": "Low risk, steady returns with focus on large-cap stocks and bonds",
                "symbols": ["HDFCBANK.NS", "TCS.NS", "ITC.NS", "GOLDBEES.NS", "NIFTYBEES.NS"],
                "suggested_weights": [0.25, 0.20, 0.15, 0.20, 0.20],
                "risk_level": "Low",
                "expected_return_range": "8-12%",
                "sectors": ["Banking", "IT", "FMCG", "Gold", "Index"]
            },
            "moderate": {
                "name": "Balanced Portfolio",
                "description": "Moderate risk with diversified exposure across sectors",
                "symbols": ["RELIANCE.NS", "HDFCBANK.NS", "TCS.NS", "ICICIBANK.NS", "HINDUNILVR.NS", "GOLDBEES.NS"],
                "suggested_weights": [0.20, 0.20, 0.15, 0.15, 0.15, 0.15],
                "risk_level": "Moderate",
                "expected_return_range": "12-18%",
                "sectors": ["Oil & Gas", "Banking", "IT", "FMCG", "Gold"]
            },
            "aggressive": {
                "name": "Growth Portfolio",
                "description": "High growth potential with higher volatility",
                "symbols": ["TCS.NS", "RELIANCE.NS", "HDFCBANK.NS", "MARUTI.NS", "SUNPHARMA.NS", "TATASTEEL.NS"],
                "suggested_weights": [0.20, 0.20, 0.15, 0.15, 0.15, 0.15],
                "risk_level": "High",
                "expected_return_range": "15-25%",
                "sectors": ["IT", "Oil & Gas", "Banking", "Auto", "Pharma", "Metals"]
            }
        }
        
        # Get user's risk tolerance
        user_risk = current_user.risk_tolerance.lower() if hasattr(current_user.risk_tolerance, 'lower') else current_user.risk_tolerance
        
        return {
            "user_risk_tolerance": user_risk,
            "recommended_portfolio": portfolios.get(user_risk, portfolios["moderate"]),
            "all_portfolios": portfolios
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommended portfolios: {str(e)}")
