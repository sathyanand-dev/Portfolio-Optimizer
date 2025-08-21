import numpy as np
import pandas as pd
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from app.services.data_service import data_service
from app.services.analytics import analytics_service
from app.models.schemas import BacktestResult, PerformanceMetrics
import warnings
warnings.filterwarnings('ignore')

class BacktestingService:
    """Service for strategy backtesting and performance analysis."""
    
    def __init__(self):
        self.transaction_cost = 0.001  # 0.1% transaction cost
        self.rebalance_costs = {
            "daily": 0.002,
            "weekly": 0.001,
            "monthly": 0.0005,
            "quarterly": 0.0003
        }
    
    def backtest_portfolio(
        self,
        symbols: List[str],
        weights: List[float],
        start_date: str,
        end_date: str,
        benchmark: str = "^NSEI",
        rebalance_frequency: str = "monthly",
        initial_capital: float = 100000.0
    ) -> BacktestResult:
        """
        Backtest a portfolio strategy over a specified period.
        
        Args:
            symbols: List of stock symbols
            weights: List of portfolio weights (must sum to 1)
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            benchmark: Benchmark symbol for comparison
            rebalance_frequency: How often to rebalance (daily, weekly, monthly, quarterly)
            initial_capital: Initial investment amount
        """
        
        # Validate inputs
        if len(symbols) != len(weights):
            raise ValueError("Number of symbols must match number of weights")
        
        if abs(sum(weights) - 1.0) > 0.01:
            raise ValueError("Weights must sum to 1.0")
        
        # Get historical data for all symbols
        portfolio_data = self._get_historical_data(symbols, start_date, end_date)
        benchmark_data = self._get_benchmark_data(benchmark, start_date, end_date)
        
        # Align dates
        common_dates = self._align_dates(portfolio_data, benchmark_data, start_date, end_date)
        
        if len(common_dates) < 30:
            raise ValueError("Insufficient data for backtesting")
        
        # Run backtest simulation
        backtest_results = self._run_backtest_simulation(
            portfolio_data, 
            weights, 
            common_dates, 
            rebalance_frequency,
            initial_capital
        )
        
        # Calculate benchmark returns
        benchmark_returns = self._calculate_benchmark_returns(benchmark_data, common_dates)
        
        # Calculate performance metrics
        performance_metrics = analytics_service.calculate_performance_metrics(
            backtest_results["portfolio_returns"],
            benchmark_returns
        )
        
        # Find drawdown periods
        drawdown_periods = self._find_drawdown_periods(
            backtest_results["portfolio_returns"],
            common_dates
        )
        
        # Calculate sector allocation
        sector_allocation = self._calculate_sector_allocation(symbols, weights)
        
        return BacktestResult(
            portfolio_returns=backtest_results["portfolio_returns"],
            benchmark_returns=benchmark_returns,
            dates=[date.strftime("%Y-%m-%d") for date in common_dates],
            performance_metrics=performance_metrics,
            drawdown_periods=drawdown_periods,
            sector_allocation=sector_allocation
        )
    
    def _get_historical_data(self, symbols: List[str], start_date: str, end_date: str) -> Dict:
        """Get historical data for all symbols."""
        data = {}
        for symbol in symbols:
            try:
                hist_data = data_service.get_historical_data(symbol, period="max")
                data[symbol] = {
                    'dates': [datetime.strptime(d, "%Y-%m-%d") for d in hist_data['dates']],
                    'prices': hist_data['prices'],
                    'returns': hist_data['returns']
                }
            except Exception as e:
                raise ValueError(f"Could not fetch data for {symbol}: {e}")
        return data
    
    def _get_benchmark_data(self, benchmark: str, start_date: str, end_date: str) -> Dict:
        """Get benchmark data."""
        try:
            bench_data = data_service.get_historical_data(benchmark, period="max")
            return {
                'dates': [datetime.strptime(d, "%Y-%m-%d") for d in bench_data['dates']],
                'prices': bench_data['prices'],
                'returns': bench_data['returns']
            }
        except Exception as e:
            raise ValueError(f"Could not fetch benchmark data for {benchmark}: {e}")
    
    def _align_dates(self, portfolio_data: Dict, benchmark_data: Dict, start_date: str, end_date: str) -> List[datetime]:
        """Align dates across all data sources."""
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        
        # Get all possible dates from benchmark
        all_dates = set(benchmark_data['dates'])
        
        # Intersect with portfolio data dates
        for symbol_data in portfolio_data.values():
            symbol_dates = set(symbol_data['dates'])
            all_dates = all_dates.intersection(symbol_dates)
        
        # Filter by date range and sort
        filtered_dates = [date for date in all_dates if start_dt <= date <= end_dt]
        return sorted(filtered_dates)
    
    def _run_backtest_simulation(
        self, 
        portfolio_data: Dict, 
        target_weights: List[float], 
        dates: List[datetime],
        rebalance_frequency: str,
        initial_capital: float
    ) -> Dict:
        """Run the actual backtest simulation."""
        
        symbols = list(portfolio_data.keys())
        portfolio_values = []
        portfolio_returns = []
        current_weights = target_weights.copy()
        portfolio_value = initial_capital
        
        # Determine rebalance frequency
        rebalance_days = {
            "daily": 1,
            "weekly": 5,
            "monthly": 21,
            "quarterly": 63
        }
        rebalance_interval = rebalance_days.get(rebalance_frequency, 21)
        
        for i, date in enumerate(dates):
            # Calculate daily returns for each asset
            daily_returns = []
            for symbol in symbols:
                symbol_data = portfolio_data[symbol]
                # Find the index for this date
                try:
                    date_idx = symbol_data['dates'].index(date)
                    daily_return = symbol_data['returns'][date_idx] if date_idx < len(symbol_data['returns']) else 0
                    daily_returns.append(daily_return)
                except ValueError:
                    daily_returns.append(0)  # Use 0 if date not found
            
            # Calculate portfolio return
            portfolio_return = sum(w * r for w, r in zip(current_weights, daily_returns))
            
            # Apply transaction costs on rebalance days
            if i > 0 and i % rebalance_interval == 0:
                transaction_cost = self.rebalance_costs.get(rebalance_frequency, 0.0005)
                portfolio_return -= transaction_cost
                # Reset weights to target weights
                current_weights = target_weights.copy()
            else:
                # Update weights based on returns (drift)
                total_weight = 0
                for j in range(len(current_weights)):
                    current_weights[j] *= (1 + daily_returns[j])
                    total_weight += current_weights[j]
                
                # Renormalize weights
                if total_weight > 0:
                    current_weights = [w / total_weight for w in current_weights]
            
            portfolio_returns.append(portfolio_return)
            portfolio_value *= (1 + portfolio_return)
            portfolio_values.append(portfolio_value)
        
        return {
            "portfolio_returns": portfolio_returns,
            "portfolio_values": portfolio_values
        }
    
    def _calculate_benchmark_returns(self, benchmark_data: Dict, dates: List[datetime]) -> List[float]:
        """Calculate benchmark returns for the given dates."""
        benchmark_returns = []
        
        for date in dates:
            try:
                date_idx = benchmark_data['dates'].index(date)
                benchmark_return = benchmark_data['returns'][date_idx] if date_idx < len(benchmark_data['returns']) else 0
                benchmark_returns.append(benchmark_return)
            except ValueError:
                benchmark_returns.append(0)
        
        return benchmark_returns
    
    def _find_drawdown_periods(self, returns: List[float], dates: List[datetime]) -> List[Dict]:
        """Find significant drawdown periods."""
        returns_array = np.array(returns)
        cumulative_returns = np.cumprod(1 + returns_array)
        rolling_max = np.maximum.accumulate(cumulative_returns)
        drawdown = (cumulative_returns - rolling_max) / rolling_max
        
        # Find drawdown periods (when drawdown < -5%)
        significant_drawdowns = []
        in_drawdown = False
        start_idx = 0
        
        for i, dd in enumerate(drawdown):
            if dd < -0.05 and not in_drawdown:  # Start of drawdown
                in_drawdown = True
                start_idx = i
            elif dd >= -0.01 and in_drawdown:  # End of drawdown
                in_drawdown = False
                max_dd = np.min(drawdown[start_idx:i+1])
                significant_drawdowns.append({
                    "start_date": dates[start_idx].strftime("%Y-%m-%d"),
                    "end_date": dates[i].strftime("%Y-%m-%d"),
                    "max_drawdown": float(max_dd),
                    "duration_days": i - start_idx + 1,
                    "recovery_date": dates[i].strftime("%Y-%m-%d") if i < len(dates) else None
                })
        
        return significant_drawdowns
    
    def _calculate_sector_allocation(self, symbols: List[str], weights: List[float]) -> Dict[str, float]:
        """Calculate sector allocation."""
        # Simplified sector mapping for Indian stocks
        sector_mapping = {
            "HDFCBANK.NS": "Banking", "ICICIBANK.NS": "Banking", "SBIN.NS": "Banking",
            "KOTAKBANK.NS": "Banking", "AXISBANK.NS": "Banking", "BANKBEES.NS": "Banking",
            "TCS.NS": "IT", "INFY.NS": "IT", "WIPRO.NS": "IT", "HCLTECH.NS": "IT", "TECHM.NS": "IT",
            "RELIANCE.NS": "Oil & Gas", "ONGC.NS": "Oil & Gas", "IOC.NS": "Oil & Gas",
            "HINDUNILVR.NS": "FMCG", "ITC.NS": "FMCG", "NESTLEIND.NS": "FMCG", "BRITANNIA.NS": "FMCG",
            "MARUTI.NS": "Auto", "M&M.NS": "Auto", "TATAMOTORS.NS": "Auto", "BAJAJ-AUTO.NS": "Auto",
            "SUNPHARMA.NS": "Pharma", "DRREDDY.NS": "Pharma", "CIPLA.NS": "Pharma", "LUPIN.NS": "Pharma",
            "TATASTEEL.NS": "Metals", "HINDALCO.NS": "Metals", "JSWSTEEL.NS": "Metals", "VEDL.NS": "Metals",
            "LT.NS": "Infrastructure", "UBL.NS": "Infrastructure", "GRASIM.NS": "Infrastructure",
            "BHARTIARTL.NS": "Telecom", "IDEA.NS": "Telecom",
            "NTPC.NS": "Power", "POWERGRID.NS": "Power", "TATAPOWER.NS": "Power",
            "GOLDBEES.NS": "Gold", "SILVERBEES.NS": "Silver",
            "NIFTYBEES.NS": "Index ETF", "JUNIORBEES.NS": "Index ETF"
        }
        
        sector_allocation = {}
        for symbol, weight in zip(symbols, weights):
            sector = sector_mapping.get(symbol, "Other")
            sector_allocation[sector] = sector_allocation.get(sector, 0) + weight * 100
        
        return sector_allocation
    
    def monte_carlo_simulation(
        self,
        symbols: List[str],
        weights: List[float],
        time_horizon_years: int = 10,
        num_simulations: int = 1000,
        initial_investment: float = 100000
    ) -> Dict:
        """
        Run Monte Carlo simulation for portfolio projections.
        
        Args:
            symbols: List of stock symbols
            weights: Portfolio weights
            time_horizon_years: Investment horizon in years
            num_simulations: Number of simulation runs
            initial_investment: Initial investment amount
        """
        
        # Get historical data to estimate parameters
        returns_data = {}
        for symbol in symbols:
            try:
                hist_data = data_service.get_historical_data(symbol, period="2y")
                returns_data[symbol] = hist_data["returns"]
            except:
                continue
        
        if not returns_data:
            raise ValueError("Could not fetch sufficient data for simulation")
        
        # Calculate statistics
        returns_df = pd.DataFrame(returns_data).dropna()
        mean_returns = returns_df.mean().values
        cov_matrix = returns_df.cov().values
        
        # Portfolio statistics
        portfolio_mean = np.dot(weights, mean_returns)
        portfolio_variance = np.dot(weights, np.dot(cov_matrix, weights))
        portfolio_std = np.sqrt(portfolio_variance)
        
        # Convert to annual terms
        annual_mean = portfolio_mean * 252
        annual_std = portfolio_std * np.sqrt(252)
        
        # Run simulations
        simulation_results = []
        trading_days = time_horizon_years * 252
        
        for _ in range(num_simulations):
            # Generate random returns
            random_returns = np.random.normal(annual_mean / 252, annual_std / np.sqrt(252), trading_days)
            
            # Calculate cumulative value
            cumulative_values = [initial_investment]
            current_value = initial_investment
            
            for daily_return in random_returns:
                current_value *= (1 + daily_return)
                cumulative_values.append(current_value)
            
            simulation_results.append(cumulative_values[-1])  # Final value
        
        # Calculate statistics
        simulation_results = np.array(simulation_results)
        
        return {
            "final_values": simulation_results.tolist(),
            "statistics": {
                "mean_final_value": float(np.mean(simulation_results)),
                "median_final_value": float(np.median(simulation_results)),
                "std_final_value": float(np.std(simulation_results)),
                "percentile_5": float(np.percentile(simulation_results, 5)),
                "percentile_25": float(np.percentile(simulation_results, 25)),
                "percentile_75": float(np.percentile(simulation_results, 75)),
                "percentile_95": float(np.percentile(simulation_results, 95)),
                "probability_of_loss": float(np.mean(simulation_results < initial_investment)),
                "probability_of_doubling": float(np.mean(simulation_results >= 2 * initial_investment))
            },
            "parameters": {
                "annual_expected_return": float(annual_mean),
                "annual_volatility": float(annual_std),
                "time_horizon_years": time_horizon_years,
                "num_simulations": num_simulations,
                "initial_investment": initial_investment
            }
        }

# Global instance
backtesting_service = BacktestingService()
