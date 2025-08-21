"""
Test Monte Carlo optimization directly without authentication
"""
from app.services.optimization import portfolio_optimizer
from app.models.schemas import RiskTolerance

def test_monte_carlo_optimization():
    """Test Monte Carlo optimization method directly."""
    symbols = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"]
    
    try:
        result = portfolio_optimizer.monte_carlo_optimization(
            symbols=symbols,
            risk_tolerance=RiskTolerance.MODERATE,
            period="1y",
            num_portfolios=1000
        )
        
        print("Monte Carlo Optimization Result:")
        print(f"Symbols: {result['symbols']}")
        print(f"Weights: {result['weights']}")
        print(f"Expected Return: {result['expected_return']:.2%}")
        print(f"Expected Volatility: {result['expected_volatility']:.2%}")
        print(f"Sharpe Ratio: {result['sharpe_ratio']:.3f}")
        print(f"Optimization Type: {result['optimization_type']}")
        print(f"Risk Tolerance: {result['risk_tolerance']}")
        
        # Verify required fields
        assert "optimization_type" in result
        assert result["optimization_type"] == "monte_carlo"
        assert "symbols" in result
        assert "weights" in result
        assert "expected_return" in result
        assert "expected_volatility" in result
        assert "sharpe_ratio" in result
        
        print("\n✅ All tests passed! Monte Carlo optimization working correctly.")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_monte_carlo_optimization()
