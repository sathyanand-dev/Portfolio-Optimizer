import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    """Test the main root endpoint."""
    response = client.get("/")
    assert response.status_code == 200

def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_popular_stocks():
    """Test getting popular stocks data."""
    response = client.get("/api/v1/data/popular")
    assert response.status_code == 200
    data = response.json()
    assert "stocks" in data
    assert "etfs" in data

def test_get_market_indices():
    """Test getting market indices."""
    response = client.get("/api/v1/data/indices")
    assert response.status_code == 200
    data = response.json()
    assert "indices" in data

def test_invalid_endpoint():
    """Test accessing invalid endpoint."""
    response = client.get("/api/v1/invalid")
    assert response.status_code == 404

if __name__ == "__main__":
    pytest.main([__file__])
