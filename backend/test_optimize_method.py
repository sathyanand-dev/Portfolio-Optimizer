"""
Test optimize_portfolio method with Monte Carlo
"""
from app.services.optimization import portfolio_optimizer
from app.models.schemas import RiskTolerance, OptimizationType

def test_optimize_portfolio_monte_carlo():
    """Test optimize_portfolio method with Monte Carlo type."""
    symbols = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"]
    
    try:
        result = portfolio_optimizer.optimize_portfolio(
            symbols=symbols,
            optimization_type=OptimizationType.MONTE_CARLO,
            risk_tolerance=RiskTolerance.MODERATE,
            period="1y",
            num_portfolios=500  # Smaller number for faster testing
        )
        
        print("Optimize Portfolio (Monte Carlo) Result:")
        print(f"Symbols: {result['symbols']}")
        print(f"Weights: {result['weights']}")
        print(f"Expected Return: {result['expected_return']:.2%}")
        print(f"Expected Volatility: {result['expected_volatility']:.2%}")
        print(f"Sharpe Ratio: {result['sharpe_ratio']:.3f}")
        print(f"Optimization Type: {result['optimization_type']}")
        print(f"Risk Tolerance: {result['risk_tolerance']}")
        
        # Verify required fields for schema
        required_fields = [
            "optimization_type", "symbols", "weights", 
            "expected_return", "expected_volatility", "sharpe_ratio"
        ]
        
        for field in required_fields:
            assert field in result, f"Missing required field: {field}"
        
        assert result["optimization_type"] == "monte_carlo"
        
        print("\n✅ All tests passed! optimize_portfolio with Monte Carlo working correctly.")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_optimize_portfolio_monte_carlo()
