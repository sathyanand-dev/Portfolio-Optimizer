#!/usr/bin/env python3
"""
Test the optimization API endpoints
"""

import requests
import json
import uuid

def get_auth_token():
    """Register a test user and get auth token"""
    base_url = "http://localhost:8000/api/v1/auth"
    
    # Generate unique test user
    test_id = str(uuid.uuid4())[:8]
    test_user = {
        "username": f"testuser_{test_id}",
        "email": f"test_{test_id}@example.com",
        "password": "testpassword123"
    }
    
    try:
        # Register user
        print(f"📝 Registering test user: {test_user['username']}")
        register_response = requests.post(
            f"{base_url}/register",
            json=test_user,
            timeout=10
        )
        
        if register_response.status_code != 200:
            print(f"⚠️  Registration failed: {register_response.text}")
            return None
        
        # Login to get token
        print(f"🔐 Logging in...")
        login_data = {
            "username": test_user["username"],
            "password": test_user["password"]
        }
        
        login_response = requests.post(
            f"{base_url}/login",
            data=login_data,  # OAuth2 expects form data
            timeout=10
        )
        
        if login_response.status_code != 200:
            print(f"⚠️  Login failed: {login_response.text}")
            return None
        
        token_data = login_response.json()
        return token_data.get("access_token")
        
    except Exception as e:
        print(f"❌ Auth error: {e}")
        return None

def test_optimization_api():
    """Test all optimization methods via API"""
    
    # Get authentication token
    print("🔑 Getting authentication token...")
    token = get_auth_token()
    
    if not token:
        print("❌ Failed to get authentication token. Aborting tests.")
        return {}
    
    print(f"✅ Got token: {token[:20]}...")
    
    base_url = "http://localhost:8000/api/v1/optimization/optimize"
    
    # Test data
    test_data = {
        "symbols": ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"],
        "risk_tolerance": "moderate"
    }
    
    optimization_types = [
        "mean_variance",
        "risk_parity", 
        "minimum_variance",
        "monte_carlo"
    ]
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    print("🚀 Testing Portfolio Optimization API Endpoints...")
    print("=" * 60)
    
    results = {}
    
    for opt_type in optimization_types:
        print(f"\n📊 Testing {opt_type.upper()} optimization...")
        
        # Prepare request data
        request_data = test_data.copy()
        request_data["optimization_type"] = opt_type
        
        # Add specific parameters for Monte Carlo
        if opt_type == "monte_carlo":
            request_data["num_portfolios"] = 500
        
        try:
            # Make API request
            response = requests.post(
                base_url,
                headers=headers,
                json=request_data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                results[opt_type] = result
                
                print(f"✅ {opt_type}: SUCCESS")
                print(f"   Return: {result['expected_return']:.1%}")
                print(f"   Vol: {result['expected_volatility']:.1%}")
                print(f"   Sharpe: {result['sharpe_ratio']:.3f}")
                print(f"   Weights: {[f'{w:.1%}' for w in result['weights']]}")
                
                # Monte Carlo specific info
                if opt_type == "monte_carlo" and "num_simulations" in result:
                    print(f"   Simulations: {result['num_simulations']}")
                
            else:
                print(f"❌ {opt_type}: HTTP {response.status_code}")
                print(f"   Error: {response.text}")
                results[opt_type] = None
        
        except requests.exceptions.RequestException as e:
            print(f"❌ {opt_type}: REQUEST ERROR")
            print(f"   {str(e)}")
            results[opt_type] = None
        
        except Exception as e:
            print(f"❌ {opt_type}: UNKNOWN ERROR")
            print(f"   {str(e)}")
            results[opt_type] = None
    
    # Summary
    print("\n" + "=" * 60)
    print("📈 OPTIMIZATION API TEST SUMMARY")
    print("=" * 60)
    
    successful = [opt for opt, result in results.items() if result is not None]
    failed = [opt for opt, result in results.items() if result is None]
    
    print(f"✅ Successful: {len(successful)}/{len(optimization_types)}")
    for opt in successful:
        print(f"   - {opt}")
    
    if failed:
        print(f"\n❌ Failed: {len(failed)}/{len(optimization_types)}")
        for opt in failed:
            print(f"   - {opt}")
    
    if len(successful) == len(optimization_types):
        print("\n🎉 All optimization methods working perfectly!")
    else:
        print(f"\n⚠️  {len(failed)} optimization method(s) need attention")
    
    return results

if __name__ == "__main__":
    test_optimization_api()
