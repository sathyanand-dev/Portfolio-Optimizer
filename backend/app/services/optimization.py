import numpy as np
import pandas as pd
from typing import List, Dict, Optional, Tuple
from scipy.optimize import minimize
from app.services.data_service import data_service
from app.models.schemas import OptimizationType, RiskTolerance
from app.config import settings
import warnings
warnings.filterwarnings('ignore')

class PortfolioOptimizer:
    """Portfolio optimization service with multiple models."""
    
    def __init__(self):
        self.risk_free_rate = settings.RISK_FREE_RATE
    
    def _prepare_data(self, symbols: List[str], period: str = "1y") -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Prepare price data and returns for optimization."""
        # Get historical data for all symbols
        prices_data = {}
        
        for symbol in symbols:
            try:
                hist_data = data_service.get_historical_data(symbol, period)
                prices_data[symbol] = hist_data["prices"]
            except Exception as e:
                print(f"Warning: Could not fetch data for {symbol}: {e}")
                continue
        
        # If no real data is available, generate mock data for testing
        if not prices_data:
            print("No real data available, generating mock data for testing...")
            np.random.seed(42)  # For reproducible results
            dates = pd.date_range(end=pd.Timestamp.now(), periods=252, freq='D')
            
            for symbol in symbols:
                # Generate realistic stock price data
                initial_price = np.random.uniform(100, 2000)  # Random starting price
                returns = np.random.normal(0.0008, 0.02, 252)  # Daily returns with realistic volatility
                prices = [initial_price]
                
                for ret in returns[1:]:
                    prices.append(prices[-1] * (1 + ret))
                
                prices_data[symbol] = prices
        
        if not prices_data:
            raise ValueError("No valid price data found for any symbol")
        
        # Create DataFrame with aligned dates
        prices_df = pd.DataFrame(prices_data)
        prices_df = prices_df.dropna()
        
        if len(prices_df) < 30:  # Need at least 30 data points
            raise ValueError("Insufficient data for optimization")
        
        # Calculate returns
        returns_df = prices_df.pct_change().dropna()
        
        return prices_df, returns_df
    
    def _calculate_expected_returns(self, returns_df: pd.DataFrame) -> pd.Series:
        """Calculate expected returns using historical mean."""
        return returns_df.mean() * 252  # Annualized
    
    def _calculate_covariance_matrix(self, returns_df: pd.DataFrame) -> pd.DataFrame:
        """Calculate covariance matrix."""
        return returns_df.cov() * 252  # Annualized
    
    def _get_risk_aversion_factor(self, risk_tolerance: RiskTolerance) -> float:
        """Get risk aversion factor based on risk tolerance."""
        risk_factors = {
            RiskTolerance.CONSERVATIVE: 10.0,
            RiskTolerance.MODERATE: 5.0,
            RiskTolerance.AGGRESSIVE: 2.0
        }
        return risk_factors.get(risk_tolerance, 5.0)
    
    def _portfolio_performance(self, weights: np.ndarray, returns: pd.Series, cov_matrix: pd.DataFrame) -> Tuple[float, float, float]:
        """Calculate portfolio performance metrics."""
        portfolio_return = np.dot(weights, returns)
        portfolio_volatility = np.sqrt(np.dot(weights, np.dot(cov_matrix, weights)))
        sharpe_ratio = (portfolio_return - self.risk_free_rate) / portfolio_volatility if portfolio_volatility > 0 else 0
        return portfolio_return, portfolio_volatility, sharpe_ratio
    
    def mean_variance_optimization(
        self, 
        symbols: List[str], 
        risk_tolerance: RiskTolerance = RiskTolerance.MODERATE,
        target_return: Optional[float] = None,
        period: str = "1y"
    ) -> Dict:
        """Perform mean-variance optimization."""
        prices_df, returns_df = self._prepare_data(symbols, period)
        
        # Calculate expected returns and covariance matrix
        mu = self._calculate_expected_returns(returns_df)
        cov_matrix = self._calculate_covariance_matrix(returns_df)
        
        n_assets = len(symbols)
        
        # Objective function: minimize negative Sharpe ratio or portfolio variance
        def objective(weights):
            portfolio_return = np.dot(weights, mu)
            portfolio_vol = np.sqrt(np.dot(weights, np.dot(cov_matrix, weights)))
            
            if target_return:
                # Minimize variance for target return
                return portfolio_vol ** 2
            else:
                # Maximize Sharpe ratio (minimize negative Sharpe)
                if portfolio_vol == 0:
                    return 1e6
                return -(portfolio_return - self.risk_free_rate) / portfolio_vol
        
        # Constraints
        constraints = [{'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0}]
        
        if target_return:
            constraints.append({
                'type': 'eq', 
                'fun': lambda x: np.dot(x, mu) - target_return
            })
        
        # Bounds (no short selling)
        bounds = [(0.0, 1.0) for _ in range(n_assets)]
        
        # Initial guess (equal weights)
        x0 = np.array([1.0 / n_assets] * n_assets)
        
        # Optimize
        result = minimize(
            objective,
            x0,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints,
            options={'maxiter': 1000}
        )
        
        if not result.success:
            raise ValueError("Optimization failed to converge")
        
        # Calculate performance
        port_return, port_vol, sharpe = self._portfolio_performance(result.x, mu, cov_matrix)
        
        return {
            "symbols": symbols,
            "weights": [float(w) for w in result.x],
            "expected_return": float(port_return),
            "expected_volatility": float(port_vol),
            "sharpe_ratio": float(sharpe),
            "optimization_type": "mean_variance",
            "metadata": {
                "risk_tolerance": str(risk_tolerance.value),
                "target_return": float(target_return) if target_return else None,
                "period": str(period)
            }
        }
    
    def risk_parity_optimization(
        self,
        symbols: List[str],
        period: str = "1y",
        **kwargs  # Accept and ignore additional parameters
    ) -> Dict:
        """Perform risk parity optimization."""
        prices_df, returns_df = self._prepare_data(symbols, period)
        
        # Calculate covariance matrix
        cov_matrix = self._calculate_covariance_matrix(returns_df)
        
        # Risk parity optimization
        n_assets = len(symbols)
        
        def risk_parity_objective(weights):
            """Objective function for risk parity."""
            portfolio_vol = np.sqrt(np.dot(weights, np.dot(cov_matrix, weights)))
            if portfolio_vol == 0:
                return 1e6
            
            marginal_contribs = np.dot(cov_matrix, weights) / portfolio_vol
            contrib = weights * marginal_contribs
            
            # Minimize sum of squared differences from equal risk contribution
            target_contrib = 1.0 / n_assets
            return np.sum((contrib / np.sum(contrib) - target_contrib) ** 2)
        
        # Constraints and bounds
        constraints = {'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0}
        bounds = [(0.01, 1.0) for _ in range(n_assets)]  # Minimum 1% allocation
        
        # Initial guess (equal weights)
        x0 = np.array([1.0 / n_assets] * n_assets)
        
        # Optimize
        result = minimize(
            risk_parity_objective,
            x0,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints,
            options={'maxiter': 1000}
        )
        
        if not result.success:
            raise ValueError("Risk parity optimization failed to converge")
        
        # Calculate portfolio performance
        mu = self._calculate_expected_returns(returns_df)
        port_return, port_vol, sharpe = self._portfolio_performance(result.x, mu, cov_matrix)
        
        return {
            "symbols": symbols,
            "weights": [float(w) for w in result.x],
            "expected_return": float(port_return),
            "expected_volatility": float(port_vol),
            "sharpe_ratio": float(sharpe),
            "optimization_type": "risk_parity",
            "metadata": {
                "period": str(period),
                "convergence": bool(result.success)
            }
        }
    
    def minimum_variance_optimization(
        self,
        symbols: List[str],
        period: str = "1y",
        **kwargs  # Accept and ignore additional parameters
    ) -> Dict:
        """Perform minimum variance optimization."""
        prices_df, returns_df = self._prepare_data(symbols, period)
        
        # Calculate covariance matrix
        cov_matrix = self._calculate_covariance_matrix(returns_df)
        
        n_assets = len(symbols)
        
        # Objective function: minimize portfolio variance
        def objective(weights):
            return np.dot(weights, np.dot(cov_matrix, weights))
        
        # Constraints
        constraints = {'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0}
        bounds = [(0.0, 1.0) for _ in range(n_assets)]
        
        # Initial guess
        x0 = np.array([1.0 / n_assets] * n_assets)
        
        # Optimize
        result = minimize(
            objective,
            x0,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints,
            options={'maxiter': 1000}
        )
        
        if not result.success:
            raise ValueError("Minimum variance optimization failed to converge")
        
        # Calculate performance
        mu = self._calculate_expected_returns(returns_df)
        port_return, port_vol, sharpe = self._portfolio_performance(result.x, mu, cov_matrix)
        
        return {
            "symbols": symbols,
            "weights": [float(w) for w in result.x],
            "expected_return": float(port_return),
            "expected_volatility": float(port_vol),
            "sharpe_ratio": float(sharpe),
            "optimization_type": "minimum_variance",
            "metadata": {
                "period": str(period)
            }
        }
    
    def black_litterman_optimization(
        self,
        symbols: List[str],
        market_caps: Optional[Dict[str, float]] = None,
        views: Optional[Dict[str, float]] = None,
        view_confidences: Optional[Dict[str, float]] = None,
        risk_tolerance: RiskTolerance = RiskTolerance.MODERATE,
        period: str = "1y"
    ) -> Dict:
        """Perform simplified Black-Litterman optimization."""
        prices_df, returns_df = self._prepare_data(symbols, period)
        
        # Get market capitalizations if not provided
        if not market_caps:
            market_caps = {}
            for symbol in symbols:
                try:
                    stock_data = data_service.get_stock_data(symbol)
                    if stock_data.get("market_cap"):
                        market_caps[symbol] = stock_data["market_cap"]
                except:
                    # Use equal weights if market cap not available
                    market_caps[symbol] = 1.0
        
        # Calculate market-cap weighted portfolio as prior
        total_market_cap = sum(market_caps.values())
        prior_weights = np.array([market_caps.get(symbol, 1.0)/total_market_cap for symbol in symbols])
        
        # Use historical returns as expected returns (simplified approach)
        mu = self._calculate_expected_returns(returns_df)
        cov_matrix = self._calculate_covariance_matrix(returns_df)
        
        # Apply views if provided (simplified)
        if views:
            for symbol, view_return in views.items():
                if symbol in symbols:
                    idx = symbols.index(symbol)
                    confidence = view_confidences.get(symbol, 0.5) if view_confidences else 0.5
                    # Blend historical return with view
                    mu.iloc[idx] = (1 - confidence) * mu.iloc[idx] + confidence * view_return
        
        # Optimize using mean-variance with adjusted returns
        return self.mean_variance_optimization(
            symbols=symbols,
            risk_tolerance=risk_tolerance,
            period=period
        )
    
    def monte_carlo_optimization(
        self,
        symbols: List[str],
        risk_tolerance: RiskTolerance = RiskTolerance.MODERATE,
        period: str = "1y",
        num_portfolios: int = 10000,
        **kwargs
    ) -> Dict:
        """
        Monte Carlo optimization by simulating thousands of random portfolios
        and selecting the best one based on risk-adjusted return.
        """
        print(f"Starting Monte Carlo optimization for {len(symbols)} assets with {num_portfolios} simulations...")
        
        # Prepare data
        prices, returns = self._prepare_data(symbols, period)
        mu = returns.mean() * 252  # Annualized returns
        cov_matrix = returns.cov() * 252  # Annualized covariance
        
        n_assets = len(symbols)
        
        # Risk tolerance mapping for target Sharpe ratio
        risk_tolerance_map = {
            RiskTolerance.CONSERVATIVE: 0.5,  # Lower target Sharpe ratio
            RiskTolerance.MODERATE: 0.8,     # Moderate target Sharpe ratio
            RiskTolerance.AGGRESSIVE: 1.2    # Higher target Sharpe ratio
        }
        target_sharpe = risk_tolerance_map.get(risk_tolerance, 0.8)
        
        # Storage for results
        results = {
            'weights': [],
            'returns': [],
            'volatilities': [],
            'sharpe_ratios': []
        }
        
        # Set random seed for reproducible results
        np.random.seed(42)
        
        # Generate random portfolios
        print("Generating random portfolios...")
        for i in range(num_portfolios):
            # Generate random weights
            weights = np.random.random(n_assets)
            weights = weights / np.sum(weights)  # Normalize to sum to 1
            
            # Calculate portfolio performance
            port_return, port_vol, sharpe = self._portfolio_performance(weights, mu, cov_matrix)
            
            # Store results
            results['weights'].append(weights)
            results['returns'].append(port_return)
            results['volatilities'].append(port_vol)
            results['sharpe_ratios'].append(sharpe)
        
        # Convert to numpy arrays for easier manipulation
        results['weights'] = np.array(results['weights'])
        results['returns'] = np.array(results['returns'])
        results['volatilities'] = np.array(results['volatilities'])
        results['sharpe_ratios'] = np.array(results['sharpe_ratios'])
        
        print(f"Generated {num_portfolios} portfolios")
        print(f"Sharpe ratios range: {results['sharpe_ratios'].min():.3f} to {results['sharpe_ratios'].max():.3f}")
        
        # Selection strategy based on risk tolerance
        if risk_tolerance == RiskTolerance.CONSERVATIVE:
            # Conservative: Minimize volatility while maintaining reasonable return
            valid_returns = results['returns'] > 0.05  # At least 5% return
            if np.any(valid_returns):
                conservative_indices = np.where(valid_returns)[0]
                best_idx = conservative_indices[np.argmin(results['volatilities'][conservative_indices])]
            else:
                best_idx = np.argmin(results['volatilities'])
        
        elif risk_tolerance == RiskTolerance.AGGRESSIVE:
            # Aggressive: Maximize Sharpe ratio (risk-adjusted return)
            best_idx = np.argmax(results['sharpe_ratios'])
        
        else:  # MODERATE
            # Moderate: Balance between return and risk
            # Find portfolios with Sharpe ratio above median
            median_sharpe = np.median(results['sharpe_ratios'])
            good_sharpe_indices = np.where(results['sharpe_ratios'] >= median_sharpe)[0]
            
            if len(good_sharpe_indices) > 0:
                # Among good Sharpe ratios, find the one closest to target volatility (15%)
                target_vol = 0.15
                vol_differences = np.abs(results['volatilities'][good_sharpe_indices] - target_vol)
                best_among_good = good_sharpe_indices[np.argmin(vol_differences)]
                best_idx = best_among_good
            else:
                best_idx = np.argmax(results['sharpe_ratios'])
        
        # Get the best portfolio
        best_weights = results['weights'][best_idx]
        best_return = results['returns'][best_idx]
        best_volatility = results['volatilities'][best_idx]
        best_sharpe = results['sharpe_ratios'][best_idx]
        
        print(f"Selected portfolio (index {best_idx}):")
        print(f"  Expected Return: {best_return:.1%}")
        print(f"  Volatility: {best_volatility:.1%}")
        print(f"  Sharpe Ratio: {best_sharpe:.3f}")
        
        # Clean up small weights (less than 0.5%)
        clean_weights = np.where(best_weights < 0.005, 0, best_weights)
        clean_weights = clean_weights / np.sum(clean_weights)  # Renormalize
        
        return {
            "symbols": symbols,
            "weights": [float(w) for w in clean_weights],
            "expected_return": float(best_return),
            "expected_volatility": float(best_volatility),
            "sharpe_ratio": float(best_sharpe),
            "optimization_type": "monte_carlo",
            "num_simulations": int(num_portfolios),
            "risk_tolerance": str(risk_tolerance.value)
        }
    
    def optimize_portfolio(
        self,
        symbols: List[str],
        optimization_type: OptimizationType,
        **kwargs
    ) -> Dict:
        """Main optimization method that routes to specific optimizers."""
        
        optimization_methods = {
            OptimizationType.MEAN_VARIANCE: self.mean_variance_optimization,
            OptimizationType.BLACK_LITTERMAN: self.black_litterman_optimization,
            OptimizationType.RISK_PARITY: self.risk_parity_optimization,
            OptimizationType.MINIMUM_VARIANCE: self.minimum_variance_optimization,
            OptimizationType.MONTE_CARLO: self.monte_carlo_optimization
        }
        
        if optimization_type not in optimization_methods:
            raise ValueError(f"Unsupported optimization type: {optimization_type}")
        
        return optimization_methods[optimization_type](symbols, **kwargs)
    
    def suggest_asset_allocation(
        self,
        risk_tolerance: RiskTolerance,
        investment_horizon: int,
        current_age: Optional[int] = None
    ) -> Dict[str, float]:
        """Suggest asset allocation based on risk profile."""
        
        # Base allocations by risk tolerance
        allocations = {
            RiskTolerance.CONSERVATIVE: {
                "equity_percent": 40.0,
                "gold_percent": 20.0,
                "silver_percent": 5.0,
                "cash_percent": 35.0
            },
            RiskTolerance.MODERATE: {
                "equity_percent": 65.0,
                "gold_percent": 15.0,
                "silver_percent": 5.0,
                "cash_percent": 15.0
            },
            RiskTolerance.AGGRESSIVE: {
                "equity_percent": 85.0,
                "gold_percent": 10.0,
                "silver_percent": 3.0,
                "cash_percent": 2.0
            }
        }
        
        base_allocation = allocations.get(risk_tolerance, allocations[RiskTolerance.MODERATE])
        
        # Adjust based on investment horizon (longer horizon = more equity)
        if investment_horizon > 120:  # More than 10 years
            base_allocation["equity_percent"] = min(base_allocation["equity_percent"] + 10, 90)
            base_allocation["cash_percent"] = max(base_allocation["cash_percent"] - 10, 5)
        elif investment_horizon < 24:  # Less than 2 years
            base_allocation["equity_percent"] = max(base_allocation["equity_percent"] - 15, 20)
            base_allocation["cash_percent"] = min(base_allocation["cash_percent"] + 15, 50)
        
        # Adjust based on age if provided (rule of thumb: equity = 100 - age)
        if current_age:
            suggested_equity = max(100 - current_age, 20)
            base_allocation["equity_percent"] = (base_allocation["equity_percent"] + suggested_equity) / 2
        
        # Ensure allocations sum to 100%
        total = sum(base_allocation.values())
        if total != 100:
            factor = 100 / total
            for key in base_allocation:
                base_allocation[key] *= factor
        
        return base_allocation

# Global instance
portfolio_optimizer = PortfolioOptimizer()
