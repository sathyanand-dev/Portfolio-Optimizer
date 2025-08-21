from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.services.backtesting import backtesting_service
from app.models.schemas import BacktestRequest, BacktestResult
from app.auth.dependencies import get_current_active_user
from app.models.database import User

router = APIRouter()

@router.post("/backtest", response_model=BacktestResult)
def backtest_portfolio(
    request: BacktestRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Backtest a portfolio strategy over a specified period."""
    
    if len(request.symbols) != len(request.weights):
        raise HTTPException(status_code=400, detail="Number of symbols must match number of weights")
    
    if abs(sum(request.weights) - 1.0) > 0.01:
        raise HTTPException(status_code=400, detail="Weights must sum to 1.0")
    
    if len(request.symbols) > 50:
        raise HTTPException(status_code=400, detail="Too many symbols. Maximum 50 allowed.")
    
    try:
        backtest_result = backtesting_service.backtest_portfolio(
            symbols=request.symbols,
            weights=request.weights,
            start_date=request.start_date,
            end_date=request.end_date,
            benchmark=request.benchmark,
            rebalance_frequency=request.rebalance_frequency,
            initial_capital=100000.0  # Default initial capital
        )
        
        return backtest_result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backtesting failed: {str(e)}")

@router.post("/backtest-custom")
def backtest_custom_strategy(
    symbols: List[str],
    weights: List[float],
    start_date: str,
    end_date: str,
    benchmark: str = "^NSEI",
    rebalance_frequency: str = "monthly",
    initial_capital: float = 100000.0,
    transaction_cost: float = 0.001,
    current_user: User = Depends(get_current_active_user)
):
    """Backtest a custom portfolio strategy with detailed parameters."""
    
    if len(symbols) != len(weights):
        raise HTTPException(status_code=400, detail="Number of symbols must match number of weights")
    
    if abs(sum(weights) - 1.0) > 0.01:
        raise HTTPException(status_code=400, detail="Weights must sum to 1.0")
    
    try:
        # Update transaction cost if provided
        original_cost = backtesting_service.transaction_cost
        backtesting_service.transaction_cost = transaction_cost
        
        backtest_result = backtesting_service.backtest_portfolio(
            symbols=symbols,
            weights=weights,
            start_date=start_date,
            end_date=end_date,
            benchmark=benchmark,
            rebalance_frequency=rebalance_frequency,
            initial_capital=initial_capital
        )
        
        # Restore original transaction cost
        backtesting_service.transaction_cost = original_cost
        
        return {
            "backtest_result": backtest_result,
            "parameters": {
                "initial_capital": initial_capital,
                "transaction_cost": transaction_cost,
                "rebalance_frequency": rebalance_frequency,
                "benchmark": benchmark
            }
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Custom backtesting failed: {str(e)}")

@router.post("/monte-carlo")
def monte_carlo_simulation(
    symbols: List[str],
    weights: List[float],
    time_horizon_years: int = 10,
    num_simulations: int = 1000,
    initial_investment: float = 100000,
    current_user: User = Depends(get_current_active_user)
):
    """Run Monte Carlo simulation for portfolio projections."""
    
    if len(symbols) != len(weights):
        raise HTTPException(status_code=400, detail="Number of symbols must match number of weights")
    
    if abs(sum(weights) - 1.0) > 0.01:
        raise HTTPException(status_code=400, detail="Weights must sum to 1.0")
    
    if time_horizon_years > 30:
        raise HTTPException(status_code=400, detail="Time horizon too long. Maximum 30 years.")
    
    if num_simulations > 10000:
        raise HTTPException(status_code=400, detail="Too many simulations. Maximum 10,000.")
    
    try:
        simulation_result = backtesting_service.monte_carlo_simulation(
            symbols=symbols,
            weights=weights,
            time_horizon_years=time_horizon_years,
            num_simulations=num_simulations,
            initial_investment=initial_investment
        )
        
        return simulation_result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Monte Carlo simulation failed: {str(e)}")

@router.get("/strategy-comparison")
def compare_strategies(
    strategies: List[dict],
    start_date: str,
    end_date: str,
    benchmark: str = "^NSEI",
    current_user: User = Depends(get_current_active_user)
):
    """Compare multiple portfolio strategies."""
    
    if len(strategies) > 5:
        raise HTTPException(status_code=400, detail="Too many strategies. Maximum 5 allowed.")
    
    try:
        comparison_results = []
        
        for i, strategy in enumerate(strategies):
            if "symbols" not in strategy or "weights" not in strategy:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Strategy {i+1} must contain 'symbols' and 'weights'"
                )
            
            backtest_result = backtesting_service.backtest_portfolio(
                symbols=strategy["symbols"],
                weights=strategy["weights"],
                start_date=start_date,
                end_date=end_date,
                benchmark=benchmark,
                rebalance_frequency=strategy.get("rebalance_frequency", "monthly")
            )
            
            comparison_results.append({
                "strategy_name": strategy.get("name", f"Strategy {i+1}"),
                "symbols": strategy["symbols"],
                "weights": strategy["weights"],
                "performance_metrics": backtest_result.performance_metrics,
                "final_returns": backtest_result.portfolio_returns[-1] if backtest_result.portfolio_returns else 0
            })
        
        # Rank strategies by Sharpe ratio
        comparison_results.sort(key=lambda x: x["performance_metrics"].sharpe_ratio, reverse=True)
        
        return {
            "strategy_comparison": comparison_results,
            "period": f"{start_date} to {end_date}",
            "benchmark": benchmark,
            "ranking_metric": "sharpe_ratio"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Strategy comparison failed: {str(e)}")

@router.get("/walk-forward-analysis")
def walk_forward_analysis(
    symbols: List[str],
    weights: List[float],
    start_date: str,
    end_date: str,
    optimization_window: int = 252,  # 1 year
    rebalance_frequency: str = "quarterly",
    current_user: User = Depends(get_current_active_user)
):
    """Perform walk-forward analysis to test strategy robustness."""
    
    if len(symbols) != len(weights):
        raise HTTPException(status_code=400, detail="Number of symbols must match number of weights")
    
    try:
        from datetime import datetime, timedelta
        from app.services.data_service import data_service
        import pandas as pd
        
        # Parse dates
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        # Calculate walk-forward periods
        periods = []
        current_date = start_dt
        
        while current_date < end_dt:
            optimization_end = current_date + timedelta(days=optimization_window)
            test_start = optimization_end
            test_end = min(optimization_end + timedelta(days=63), end_dt)  # ~3 months test
            
            if test_end > test_start:
                periods.append({
                    "optimization_start": current_date.strftime("%Y-%m-%d"),
                    "optimization_end": optimization_end.strftime("%Y-%m-%d"),
                    "test_start": test_start.strftime("%Y-%m-%d"),
                    "test_end": test_end.strftime("%Y-%m-%d")
                })
            
            current_date = test_start
        
        # Run backtests for each period
        walk_forward_results = []
        
        for period in periods:
            try:
                # For simplicity, we'll use fixed weights
                # In a real implementation, you'd re-optimize weights in each period
                backtest_result = backtesting_service.backtest_portfolio(
                    symbols=symbols,
                    weights=weights,
                    start_date=period["test_start"],
                    end_date=period["test_end"],
                    rebalance_frequency=rebalance_frequency
                )
                
                walk_forward_results.append({
                    "period": period,
                    "performance_metrics": backtest_result.performance_metrics,
                    "returns": backtest_result.portfolio_returns
                })
                
            except Exception as e:
                # Skip periods with insufficient data
                continue
        
        if not walk_forward_results:
            raise HTTPException(status_code=400, detail="No valid walk-forward periods found")
        
        # Calculate aggregate statistics
        all_returns = []
        all_sharpe_ratios = []
        
        for result in walk_forward_results:
            all_returns.extend(result["returns"])
            all_sharpe_ratios.append(result["performance_metrics"].sharpe_ratio)
        
        from app.services.analytics import analytics_service
        overall_metrics = analytics_service.calculate_performance_metrics(all_returns)
        
        return {
            "walk_forward_results": walk_forward_results,
            "overall_performance": overall_metrics,
            "consistency_metrics": {
                "periods_analyzed": len(walk_forward_results),
                "avg_sharpe_ratio": float(pd.Series(all_sharpe_ratios).mean()),
                "sharpe_ratio_std": float(pd.Series(all_sharpe_ratios).std()),
                "positive_periods": sum(1 for r in walk_forward_results if r["performance_metrics"].annualized_return > 0),
                "win_rate": sum(1 for r in walk_forward_results if r["performance_metrics"].annualized_return > 0) / len(walk_forward_results)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Walk-forward analysis failed: {str(e)}")

@router.get("/stress-testing")
def stress_test_portfolio(
    symbols: List[str],
    weights: List[float],
    stress_scenarios: Optional[List[str]] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Perform stress testing on portfolio under various market scenarios."""
    
    if len(symbols) != len(weights):
        raise HTTPException(status_code=400, detail="Number of symbols must match number of weights")
    
    try:
        from app.services.data_service import data_service
        import numpy as np
        import pandas as pd
        
        # Default stress scenarios (using historical periods)
        if not stress_scenarios:
            stress_scenarios = [
                "2008_crisis",
                "2020_covid",
                "2016_demonetization",
                "market_crash_simulation"
            ]
        
        stress_test_results = {}
        
        # Historical stress scenarios
        historical_periods = {
            "2008_crisis": ("2008-01-01", "2009-06-30"),
            "2020_covid": ("2020-02-01", "2020-05-31"),
            "2016_demonetization": ("2016-11-01", "2017-02-28")
        }
        
        for scenario in stress_scenarios:
            if scenario in historical_periods:
                start_date, end_date = historical_periods[scenario]
                try:
                    backtest_result = backtesting_service.backtest_portfolio(
                        symbols=symbols,
                        weights=weights,
                        start_date=start_date,
                        end_date=end_date,
                        rebalance_frequency="monthly"
                    )
                    
                    stress_test_results[scenario] = {
                        "period": f"{start_date} to {end_date}",
                        "total_return": backtest_result.performance_metrics.total_return,
                        "max_drawdown": backtest_result.performance_metrics.max_drawdown,
                        "volatility": backtest_result.performance_metrics.volatility,
                        "var_95": backtest_result.performance_metrics.var_95
                    }
                except:
                    stress_test_results[scenario] = {"error": "Insufficient data for this period"}
            
            elif scenario == "market_crash_simulation":
                # Simulate a 30% market crash
                try:
                    # Get recent returns
                    returns_data = []
                    for symbol in symbols:
                        hist_data = data_service.get_historical_data(symbol, "1y")
                        returns_data.append(hist_data["returns"][-252:])  # Last year
                    
                    # Calculate portfolio returns
                    portfolio_returns = []
                    for i in range(252):
                        daily_return = sum(w * returns_data[j][i] for j, w in enumerate(weights) if i < len(returns_data[j]))
                        portfolio_returns.append(daily_return)
                    
                    # Simulate crash (30% drop over 10 days)
                    crash_returns = [-0.03] * 10  # 3% daily drops
                    stressed_returns = crash_returns + portfolio_returns[10:]
                    
                    from app.services.analytics import analytics_service
                    stress_metrics = analytics_service.calculate_performance_metrics(stressed_returns)
                    
                    stress_test_results[scenario] = {
                        "scenario": "30% market crash over 10 days",
                        "total_return": stress_metrics.total_return,
                        "max_drawdown": stress_metrics.max_drawdown,
                        "volatility": stress_metrics.volatility,
                        "recovery_time_estimate": "Based on historical patterns: 6-18 months"
                    }
                except Exception as e:
                    stress_test_results[scenario] = {"error": f"Simulation failed: {str(e)}"}
        
        return {
            "portfolio_summary": {
                "symbols": symbols,
                "weights": weights
            },
            "stress_test_results": stress_test_results,
            "risk_assessment": {
                "overall_risk_level": "High" if any(
                    result.get("max_drawdown", 0) < -0.3 for result in stress_test_results.values() 
                    if isinstance(result, dict) and "max_drawdown" in result
                ) else "Moderate"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stress testing failed: {str(e)}")
