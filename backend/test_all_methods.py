"""
Test all optimization methods to verify schema consistency
"""
from app.services.optimization import portfolio_optimizer
from app.models.schemas import RiskTolerance, OptimizationType

def test_all_optimization_methods():
    """Test all optimization methods to verify schema consistency."""
    symbols = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"]
    
    methods_to_test = [
        (OptimizationType.MEAN_VARIANCE, "Mean Variance"),
        (OptimizationType.RISK_PARITY, "Risk Parity"),
        (OptimizationType.MINIMUM_VARIANCE, "Minimum Variance"),
        (OptimizationType.MONTE_CARLO, "Monte Carlo")
    ]
    
    required_fields = [
        "optimization_type", "symbols", "weights", 
        "expected_return", "expected_volatility", "sharpe_ratio"
    ]
    
    for method_type, method_name in methods_to_test:
        print(f"\n🧪 Testing {method_name} optimization...")
        
        try:
            kwargs = {}
            if method_type == OptimizationType.MONTE_CARLO:
                kwargs["num_portfolios"] = 100  # Small number for testing
            
            result = portfolio_optimizer.optimize_portfolio(
                symbols=symbols,
                optimization_type=method_type,
                risk_tolerance=RiskTolerance.MODERATE,
                period="1y",
                **kwargs
            )
            
            # Verify all required fields exist
            for field in required_fields:
                assert field in result, f"Missing field '{field}' in {method_name}"
            
            # Verify optimization_type matches expected
            expected_type = method_type.value.lower()
            assert result["optimization_type"] == expected_type, f"Wrong optimization_type in {method_name}: expected {expected_type}, got {result['optimization_type']}"
            
            print(f"✅ {method_name}: PASSED")
            print(f"   Optimization Type: {result['optimization_type']}")
            print(f"   Expected Return: {result['expected_return']:.2%}")
            print(f"   Volatility: {result['expected_volatility']:.2%}")
            print(f"   Sharpe Ratio: {result['sharpe_ratio']:.3f}")
            
        except Exception as e:
            print(f"❌ {method_name}: FAILED - {e}")
            import traceback
            traceback.print_exc()
    
    print("\n🎉 All optimization methods tested!")

if __name__ == "__main__":
    test_all_optimization_methods()
