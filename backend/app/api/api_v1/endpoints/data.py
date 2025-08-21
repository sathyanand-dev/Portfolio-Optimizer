from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from app.services.data_service import data_service
from app.models.schemas import StockData, HistoricalData, HistoricalDataRequest, SectorData, APIResponse

router = APIRouter()

@router.get("/stocks/{symbol}", response_model=StockData)
def get_stock_data(symbol: str):
    """Get current stock data for a specific symbol."""
    try:
        stock_data = data_service.get_stock_data(symbol)
        return StockData(**stock_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/historical/{symbol}", response_model=HistoricalData)
def get_historical_data(
    symbol: str,
    period: str = Query("1y", description="Period for historical data (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)"),
    interval: str = Query("1d", description="Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)")
):
    """Get historical stock data for a specific symbol."""
    try:
        hist_data = data_service.get_historical_data(symbol, period, interval)
        return HistoricalData(**hist_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/stocks", response_model=dict)
def get_stocks_historical_data(request: HistoricalDataRequest):
    """Get historical data for multiple stocks with specific parameters."""
    if len(request.symbols) > 20:  # Limit to prevent abuse
        raise HTTPException(status_code=400, detail="Too many symbols. Maximum 20 allowed.")
    
    try:
        results = {}
        for symbol in request.symbols:
            try:
                # Use period and interval from request, with fallbacks
                period = request.period or "1y"
                interval = request.interval or "1d"
                
                hist_data = data_service.get_historical_data(symbol, period, interval)
                results[symbol] = hist_data
            except Exception as symbol_error:
                # Log the error but continue with other symbols
                results[symbol] = {"error": str(symbol_error)}
        
        return {
            "success": True,
            "data": results,
            "request_params": {
                "symbols": request.symbols,
                "period": request.period,
                "interval": request.interval,
                "start_date": request.start_date,
                "end_date": request.end_date
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.get("/multiple", response_model=dict)
def get_multiple_stocks_data(symbols: List[str] = Query(..., description="List of stock symbols")):
    """Get current data for multiple stocks."""
    if len(symbols) > 50:  # Limit to prevent abuse
        raise HTTPException(status_code=400, detail="Too many symbols. Maximum 50 allowed.")
    
    try:
        stocks_data = data_service.get_multiple_stocks_data(symbols)
        return {"data": stocks_data, "count": len(stocks_data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/correlation", response_model=dict)
def get_correlation_matrix(
    symbols: List[str] = Query(..., description="List of stock symbols"),
    period: str = Query("1y", description="Period for correlation calculation")
):
    """Get correlation matrix for multiple stocks."""
    if len(symbols) > 20:  # Limit for correlation matrix
        raise HTTPException(status_code=400, detail="Too many symbols for correlation. Maximum 20 allowed.")
    
    try:
        correlation_matrix = data_service.get_correlation_matrix(symbols, period)
        return {
            "symbols": symbols,
            "correlation_matrix": correlation_matrix.to_dict(),
            "period": period
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/sectors", response_model=List[SectorData])
def get_sector_data():
    """Get sector-wise performance data for Indian market."""
    try:
        sectors_data = data_service.get_sector_data()
        return [SectorData(**sector) for sector in sectors_data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/indices", response_model=dict)
def get_market_indices():
    """Get data for major Indian market indices."""
    try:
        indices_data = data_service.get_market_indices()
        return {"indices": indices_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/search", response_model=List[StockData])
def search_stocks(
    query: str = Query(..., description="Search query for stock name or symbol"),
    limit: int = Query(10, description="Maximum number of results", le=50)
):
    """Search for stocks by name or symbol."""
    if len(query.strip()) < 2:
        raise HTTPException(status_code=400, detail="Query must be at least 2 characters long")
    
    try:
        search_results = data_service.search_stocks(query, limit)
        return [StockData(**stock) for stock in search_results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/search/symbols", response_model=List[str])
def search_symbols(
    query: str = Query(..., description="Search query for stock symbols"),
    limit: int = Query(50, description="Maximum number of results", le=100)
):
    """Search for stock symbols (lightweight version)."""
    if len(query.strip()) < 1:
        raise HTTPException(status_code=400, detail="Query must be at least 1 character long")
    
    try:
        symbols = data_service.search_symbols(query, limit)
        return symbols
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/search/symbols", response_model=List[str])
def search_symbols(
    query: str = Query(..., description="Search query for stock symbol"),
    limit: int = Query(50, description="Maximum number of results", le=100)
):
    """Search for stock symbols (lightweight)."""
    if len(query.strip()) < 1:
        raise HTTPException(status_code=400, detail="Query must be at least 1 character long")
    
    try:
        search_results = data_service.search_symbols(query, limit)
        return search_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/popular", response_model=dict)
def get_popular_stocks():
    """Get data for popular Indian stocks and ETFs."""
    try:
        from app.config import settings
        popular_symbols = settings.POPULAR_STOCKS + settings.POPULAR_ETFS
        popular_data = data_service.get_multiple_stocks_data(popular_symbols[:20])  # Limit to top 20
        
        return {
            "stocks": {k: v for k, v in popular_data.items() if k in settings.POPULAR_STOCKS},
            "etfs": {k: v for k, v in popular_data.items() if k in settings.POPULAR_ETFS}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/market-status", response_model=dict)
def get_market_status():
    """Get current market status and key indices."""
    try:
        # Get major indices
        nifty_data = data_service.get_stock_data("^NSEI")
        sensex_data = data_service.get_stock_data("^BSESN")
        
        # Get VIX (volatility index) if available
        try:
            vix_data = data_service.get_stock_data("^NSEBANK")  # Bank Nifty as proxy
        except:
            vix_data = None
        
        return {
            "nifty_50": nifty_data,
            "sensex": sensex_data,
            "bank_nifty": vix_data,
            "market_time": "Market hours: 9:15 AM to 3:30 PM IST",
            "currency": "INR"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/returns-matrix", response_model=dict)
def get_returns_matrix(
    symbols: List[str] = Query(..., description="List of stock symbols"),
    period: str = Query("1y", description="Period for returns calculation")
):
    """Get returns matrix for multiple stocks."""
    if len(symbols) > 20:
        raise HTTPException(status_code=400, detail="Too many symbols. Maximum 20 allowed.")
    
    try:
        returns_df = data_service.get_returns_matrix(symbols, period)
        return {
            "symbols": symbols,
            "returns_matrix": returns_df.to_dict(),
            "statistics": {
                "mean_returns": returns_df.mean().to_dict(),
                "std_returns": returns_df.std().to_dict(),
                "correlation": returns_df.corr().to_dict()
            },
            "period": period
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
