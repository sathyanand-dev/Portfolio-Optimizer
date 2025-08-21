import yfinance as yf
import pandas as pd
import numpy as np
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from app.config import settings
import asyncio
import aiohttp
from fastapi import HTTPException

class DataService:
    """Service for fetching and processing market data."""
    
    def __init__(self):
        self.cache = {}
        self.cache_duration = timedelta(minutes=settings.CACHE_DURATION_MINUTES)
    
    def _is_cache_valid(self, symbol: str) -> bool:
        """Check if cached data is still valid."""
        if symbol not in self.cache:
            return False
        return datetime.now() - self.cache[symbol]["timestamp"] < self.cache_duration
    
    def get_stock_data(self, symbol: str) -> Dict:
        """Get current stock data for a symbol."""
        # Ensure symbol has correct suffix for Indian stocks
        if not symbol.endswith(('.NS', '.BO')) and not symbol.startswith('^'):
            symbol = f"{symbol}{settings.DEFAULT_MARKET_SUFFIX}"
        
        # Check cache first
        if self._is_cache_valid(symbol):
            return self.cache[symbol]["data"]
        
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period="2d")
            
            if hist.empty:
                raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")
            
            current_price = hist['Close'].iloc[-1]
            prev_price = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
            change = current_price - prev_price
            change_percent = (change / prev_price) * 100 if prev_price != 0 else 0
            
            data = {
                "symbol": symbol,
                "current_price": float(current_price),
                "change": float(change),
                "change_percent": float(change_percent),
                "volume": int(hist['Volume'].iloc[-1]) if not pd.isna(hist['Volume'].iloc[-1]) else 0,
                "market_cap": info.get("marketCap"),
                "pe_ratio": info.get("trailingPE"),
                "dividend_yield": info.get("dividendYield"),
                "company_name": info.get("longName", symbol),
                "sector": info.get("sector"),
                "industry": info.get("industry")
            }
            
            # Cache the data
            self.cache[symbol] = {
                "data": data,
                "timestamp": datetime.now()
            }
            
            return data
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error fetching data for {symbol}: {str(e)}")
    
    def get_historical_data(self, symbol: str, period: str = "1y", interval: str = "1d") -> Dict:
        """Get historical data for a symbol."""
        # Ensure symbol has correct suffix
        if not symbol.endswith(('.NS', '.BO')) and not symbol.startswith('^'):
            symbol = f"{symbol}{settings.DEFAULT_MARKET_SUFFIX}"
        
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period, interval=interval)
            
            if hist.empty:
                raise HTTPException(status_code=404, detail=f"No historical data found for symbol {symbol}")
            
            # Calculate returns
            hist['Returns'] = hist['Close'].pct_change()
            
            return {
                "symbol": symbol,
                "dates": [date.strftime("%Y-%m-%d") for date in hist.index],
                "prices": hist['Close'].tolist(),
                "volumes": hist['Volume'].tolist(),
                "returns": hist['Returns'].fillna(0).tolist(),
                "high": hist['High'].tolist(),
                "low": hist['Low'].tolist(),
                "open": hist['Open'].tolist()
            }
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error fetching historical data for {symbol}: {str(e)}")
    
    def get_multiple_stocks_data(self, symbols: List[str]) -> Dict[str, Dict]:
        """Get data for multiple stocks."""
        results = {}
        for symbol in symbols:
            try:
                results[symbol] = self.get_stock_data(symbol)
            except HTTPException:
                # Continue with other symbols if one fails
                continue
        return results
    
    def get_returns_matrix(self, symbols: List[str], period: str = "1y") -> pd.DataFrame:
        """Get returns matrix for multiple symbols."""
        returns_data = {}
        
        for symbol in symbols:
            try:
                hist_data = self.get_historical_data(symbol, period)
                returns_data[symbol] = hist_data["returns"]
            except HTTPException:
                continue
        
        if not returns_data:
            raise HTTPException(status_code=400, detail="No valid data found for any symbol")
        
        # Create DataFrame and align dates
        df = pd.DataFrame(returns_data)
        return df.dropna()
    
    def get_correlation_matrix(self, symbols: List[str], period: str = "1y") -> pd.DataFrame:
        """Get correlation matrix for symbols."""
        returns_df = self.get_returns_matrix(symbols, period)
        return returns_df.corr()
    
    def get_sector_data(self) -> List[Dict]:
        """Get sector-wise data for Indian market."""
        sectors = {
            "Banking": ["HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "KOTAKBANK.NS", "AXISBANK.NS"],
            "Information Technology": ["TCS.NS", "INFY.NS", "WIPRO.NS", "HCLTECH.NS", "TECHM.NS"],
            "Oil & Gas": ["RELIANCE.NS", "ONGC.NS", "IOC.NS", "BPCL.NS", "HINDPETRO.NS"],
            "FMCG": ["HINDUNILVR.NS", "ITC.NS", "NESTLEIND.NS", "BRITANNIA.NS", "DABUR.NS"],
            "Automobiles": ["MARUTI.NS", "M&M.NS", "TATAMOTORS.NS", "BAJAJ-AUTO.NS", "HEROMOTOCO.NS"],
            "Pharmaceuticals": ["SUNPHARMA.NS", "DRREDDY.NS", "CIPLA.NS", "LUPIN.NS", "BIOCON.NS"],
            "Metals": ["TATASTEEL.NS", "HINDALCO.NS", "JSWSTEEL.NS", "VEDL.NS", "NMDC.NS"],
            "Telecom": ["BHARTIARTL.NS", "IDEA.NS", "MTNL.NS"],
            "Power": ["NTPC.NS", "POWERGRID.NS", "TATAPOWER.NS", "ADANIPOWER.NS"],
            "Infrastructure": ["LT.NS", "UBL.NS", "GRASIM.NS"]
        }
        
        sector_data = []
        for sector_name, stocks in sectors.items():
            try:
                # Get data for a few representative stocks
                sample_stocks = stocks[:3]
                sector_returns = []
                
                for stock in sample_stocks:
                    try:
                        hist_data = self.get_historical_data(stock, "1m")
                        if hist_data["returns"]:
                            sector_returns.extend(hist_data["returns"][-5:])  # Last 5 days
                    except:
                        continue
                
                if sector_returns:
                    avg_return = np.mean(sector_returns) * 100
                    sector_data.append({
                        "name": sector_name,
                        "stocks": stocks,
                        "weight_in_index": 100 / len(sectors),  # Simplified
                        "performance_1d": avg_return,
                        "performance_1w": avg_return * 5,  # Simplified
                        "performance_1m": avg_return * 20,  # Simplified
                        "performance_ytd": avg_return * 250  # Simplified
                    })
            except:
                continue
        
        return sector_data
    
    def get_market_indices(self) -> Dict[str, Dict]:
        """Get data for major Indian market indices."""
        indices_data = {}
        for index in settings.INDICES:
            try:
                indices_data[index] = self.get_stock_data(index)
            except:
                continue
        return indices_data
    
    def search_stocks(self, query: str, limit: int = 10) -> List[Dict]:
        """Search for Indian stocks by name or symbol."""
        # This is a simplified version. In production, you'd use a proper search API
        popular_stocks = settings.POPULAR_STOCKS + settings.POPULAR_ETFS
        
        results = []
        query_lower = query.lower()
        
        for symbol in popular_stocks:
            if query_lower in symbol.lower():
                try:
                    stock_data = self.get_stock_data(symbol)
                    results.append(stock_data)
                    if len(results) >= limit:
                        break
                except:
                    continue
        
        return results

# Global instance
data_service = DataService()
