from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, data, optimization, analytics, backtesting, portfolios

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(data.router, prefix="/data", tags=["market-data"])
api_router.include_router(optimization.router, prefix="/optimization", tags=["portfolio-optimization"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(backtesting.router, prefix="/backtesting", tags=["backtesting"])
api_router.include_router(portfolios.router, prefix="/portfolios", tags=["portfolios"])
