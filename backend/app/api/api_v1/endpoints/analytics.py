from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.services.analytics import analytics_service
from app.models.schemas import PerformanceMetrics, RiskMetrics
from app.auth.dependencies import get_current_active_user
from app.models.database import User

router = APIRouter()

@router.post("/performance", response_model=PerformanceMetrics)
def calculate_performance_metrics(
    portfolio_returns: List[float],
    benchmark_returns: Optional[List[float]] = None,
    risk_free_rate: float = 0.07,
    current_user: User = Depends(get_current_active_user)
):
    """Calculate comprehensive performance metrics for a portfolio."""
    
    if not portfolio_returns:
        raise HTTPException(status_code=400, detail="Portfolio returns cannot be empty")
    
    if len(portfolio_returns) < 30:
        raise HTTPException(status_code=400, detail="At least 30 data points required for meaningful analysis")
    
    try:
        performance_metrics = analytics_service.calculate_performance_metrics(
            returns=portfolio_returns,
            benchmark_returns=benchmark_returns,
            risk_free_rate=risk_free_rate
        )
        return performance_metrics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Performance calculation failed: {str(e)}")

@router.post("/risk", response_model=RiskMetrics)
def calculate_risk_metrics(
    portfolio_returns: List[float],
    benchmark_returns: Optional[List[float]] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Calculate risk metrics for a portfolio."""
    
    if not portfolio_returns:
        raise HTTPException(status_code=400, detail="Portfolio returns cannot be empty")
    
    try:
        risk_metrics = analytics_service.calculate_risk_metrics(
            returns=portfolio_returns,
            benchmark_returns=benchmark_returns
        )
        return risk_metrics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk calculation failed: {str(e)}")

@router.post("/portfolio-analysis")
def analyze_portfolio(
    symbols: List[str],
    weights: List[float],
    start_date: str,
    end_date: str,
    benchmark: str = "^NSEI",
    current_user: User = Depends(get_current_active_user)
):
    """Comprehensive portfolio analysis over a specified period."""
    
    if len(symbols) != len(weights):
        raise HTTPException(status_code=400, detail="Number of symbols must match number of weights")
    
    if abs(sum(weights) - 1.0) > 0.01:
        raise HTTPException(status_code=400, detail="Weights must sum to 1.0")
    
    try:
        analysis_result = analytics_service.analyze_portfolio_performance(
            symbols=symbols,
            weights=weights,
            start_date=start_date,
            end_date=end_date,
            benchmark=benchmark
        )
        
        return {
            "portfolio_summary": {
                "symbols": symbols,
                "weights": weights,
                "start_date": start_date,
                "end_date": end_date,
                "benchmark": benchmark
            },
            "performance_metrics": analysis_result["performance_metrics"],
            "risk_metrics": analysis_result["risk_metrics"],
            "drawdown_analysis": {
                "max_drawdown_periods": analysis_result["drawdown_periods"][:5],  # Top 5 drawdowns
                "total_drawdown_periods": len(analysis_result["drawdown_periods"])
            },
            "sector_allocation": analysis_result["sector_allocation"],
            "data_points": len(analysis_result["portfolio_returns"])
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Portfolio analysis failed: {str(e)}")

@router.get("/factor-analysis")
def calculate_factor_exposures(
    portfolio_returns: List[float],
    current_user: User = Depends(get_current_active_user)
):
    """Calculate factor exposures for a portfolio."""
    
    if not portfolio_returns:
        raise HTTPException(status_code=400, detail="Portfolio returns cannot be empty")
    
    try:
        from app.services.data_service import data_service
        
        # Get factor returns (market, size, value, momentum)
        # Using simplified factors based on Indian market
        factor_returns = {}
        
        # Market factor (Nifty 50)
        try:
            nifty_data = data_service.get_historical_data("^NSEI", "1y")
            factor_returns["market"] = nifty_data["returns"][:len(portfolio_returns)]
        except:
            pass
        
        # Banking sector factor
        try:
            bank_nifty_data = data_service.get_historical_data("^NSEBANK", "1y")
            factor_returns["banking"] = bank_nifty_data["returns"][:len(portfolio_returns)]
        except:
            pass
        
        # IT sector factor
        try:
            it_data = data_service.get_historical_data("^CNXIT", "1y")
            factor_returns["it"] = it_data["returns"][:len(portfolio_returns)]
        except:
            pass
        
        if not factor_returns:
            raise HTTPException(status_code=400, detail="Could not fetch factor data")
        
        # Calculate factor exposures
        factor_exposures = analytics_service.calculate_factor_exposures(
            portfolio_returns=portfolio_returns,
            factor_returns=factor_returns
        )
        
        return {
            "factor_exposures": factor_exposures,
            "factors_used": list(factor_returns.keys()),
            "interpretation": {
                "alpha": "Excess return not explained by factors",
                "market_beta": "Sensitivity to overall market movements",
                "banking_beta": "Sensitivity to banking sector",
                "it_beta": "Sensitivity to IT sector"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Factor analysis failed: {str(e)}")

@router.get("/correlation-analysis")
def analyze_correlation(
    symbols: List[str],
    period: str = "1y",
    current_user: User = Depends(get_current_active_user)
):
    """Analyze correlation structure of a portfolio."""
    
    if len(symbols) < 2:
        raise HTTPException(status_code=400, detail="At least 2 symbols required for correlation analysis")
    
    if len(symbols) > 20:
        raise HTTPException(status_code=400, detail="Too many symbols. Maximum 20 allowed.")
    
    try:
        from app.services.data_service import data_service
        import numpy as np
        
        # Get correlation matrix
        correlation_matrix = data_service.get_correlation_matrix(symbols, period)
        
        # Calculate correlation statistics
        corr_values = correlation_matrix.values
        upper_triangle = corr_values[np.triu_indices_from(corr_values, k=1)]
        
        correlation_stats = {
            "average_correlation": float(np.mean(upper_triangle)),
            "max_correlation": float(np.max(upper_triangle)),
            "min_correlation": float(np.min(upper_triangle)),
            "correlation_std": float(np.std(upper_triangle))
        }
        
        # Find highly correlated pairs
        highly_correlated = []
        for i in range(len(symbols)):
            for j in range(i+1, len(symbols)):
                corr_value = correlation_matrix.iloc[i, j]
                if abs(corr_value) > 0.7:
                    highly_correlated.append({
                        "symbol1": symbols[i],
                        "symbol2": symbols[j],
                        "correlation": float(corr_value)
                    })
        
        return {
            "correlation_matrix": correlation_matrix.to_dict(),
            "correlation_statistics": correlation_stats,
            "highly_correlated_pairs": highly_correlated,
            "diversification_score": max(0, 1 - correlation_stats["average_correlation"]),
            "period": period
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Correlation analysis failed: {str(e)}")

@router.get("/volatility-analysis")
def analyze_volatility(
    symbols: List[str],
    weights: List[float],
    period: str = "1y",
    current_user: User = Depends(get_current_active_user)
):
    """Analyze volatility components and risk contribution."""
    
    if len(symbols) != len(weights):
        raise HTTPException(status_code=400, detail="Number of symbols must match number of weights")
    
    try:
        from app.services.data_service import data_service
        import numpy as np
        import pandas as pd
        
        # Get returns data
        returns_df = data_service.get_returns_matrix(symbols, period)
        
        # Calculate individual volatilities
        individual_vols = returns_df.std() * np.sqrt(252)  # Annualized
        
        # Calculate correlation matrix
        correlation_matrix = returns_df.corr()
        
        # Calculate portfolio volatility
        weights_array = np.array(weights)
        cov_matrix = returns_df.cov() * 252  # Annualized
        portfolio_variance = np.dot(weights_array, np.dot(cov_matrix, weights_array))
        portfolio_vol = np.sqrt(portfolio_variance)
        
        # Calculate risk contributions
        marginal_contribs = np.dot(cov_matrix, weights_array) / portfolio_vol
        risk_contributions = weights_array * marginal_contribs
        
        return {
            "portfolio_volatility": float(portfolio_vol),
            "individual_volatilities": individual_vols.to_dict(),
            "risk_contributions": {
                symbol: float(contrib) for symbol, contrib in zip(symbols, risk_contributions)
            },
            "risk_contribution_percentages": {
                symbol: float(contrib / np.sum(risk_contributions) * 100) 
                for symbol, contrib in zip(symbols, risk_contributions)
            },
            "diversification_ratio": float(np.dot(weights_array, individual_vols) / portfolio_vol),
            "period": period
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Volatility analysis failed: {str(e)}")

@router.get("/rolling-metrics")
def calculate_rolling_metrics(
    portfolio_returns: List[float],
    window_size: int = 60,
    current_user: User = Depends(get_current_active_user)
):
    """Calculate rolling performance metrics."""
    
    if len(portfolio_returns) < window_size * 2:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient data. Need at least {window_size * 2} returns for rolling analysis"
        )
    
    try:
        import pandas as pd
        import numpy as np
        
        returns_series = pd.Series(portfolio_returns)
        
        # Calculate rolling metrics
        rolling_volatility = returns_series.rolling(window=window_size).std() * np.sqrt(252)
        rolling_sharpe = (returns_series.rolling(window=window_size).mean() * 252) / rolling_volatility
        
        # Rolling max drawdown
        cumulative_returns = (1 + returns_series).cumprod()
        rolling_max = cumulative_returns.rolling(window=window_size).max()
        rolling_drawdown = (cumulative_returns - rolling_max) / rolling_max
        rolling_max_dd = rolling_drawdown.rolling(window=window_size).min()
        
        return {
            "rolling_volatility": rolling_volatility.dropna().tolist(),
            "rolling_sharpe_ratio": rolling_sharpe.dropna().tolist(),
            "rolling_max_drawdown": rolling_max_dd.dropna().tolist(),
            "window_size": window_size,
            "data_points": len(rolling_volatility.dropna())
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rolling metrics calculation failed: {str(e)}")
