from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.database import Portfolio, PortfolioHolding, User
from app.models.schemas import (
    Portfolio as PortfolioSchema, 
    PortfolioCreate, 
    PortfolioUpdate,
    PortfolioHolding as PortfolioHoldingSchema
)
from app.auth.dependencies import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[PortfolioSchema])
def get_user_portfolios(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all portfolios for the current user."""
    portfolios = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id,
        Portfolio.is_active == True
    ).offset(skip).limit(limit).all()
    
    return portfolios

@router.post("/", response_model=PortfolioSchema)
def create_portfolio(
    portfolio: PortfolioCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new portfolio for the current user."""
    
    # Validate weights sum to 1 if holdings provided
    if portfolio.holdings:
        total_weight = sum(holding.weight for holding in portfolio.holdings)
        if abs(total_weight - 1.0) > 0.01:
            raise HTTPException(status_code=400, detail="Portfolio weights must sum to 1.0")
    
    # Create portfolio with optimization metadata
    db_portfolio = Portfolio(
        name=portfolio.name,
        description=portfolio.description,
        user_id=current_user.id,
        optimization_method=portfolio.optimization_method,
        risk_tolerance=portfolio.risk_tolerance,
        investment_amount=portfolio.investment_amount,
        expected_return=portfolio.expected_return,
        expected_volatility=portfolio.expected_volatility,
        sharpe_ratio=portfolio.sharpe_ratio
    )
    
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    
    # Add holdings
    for holding in portfolio.holdings:
        db_holding = PortfolioHolding(
            portfolio_id=db_portfolio.id,
            symbol=holding.symbol,
            weight=holding.weight,
            quantity=holding.quantity,
            avg_purchase_price=holding.avg_purchase_price
        )
        db.add(db_holding)
    
    db.commit()
    db.refresh(db_portfolio)
    
    return db_portfolio

@router.get("/{portfolio_id}", response_model=PortfolioSchema)
def get_portfolio(
    portfolio_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific portfolio."""
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id,
        Portfolio.is_active == True
    ).first()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    return portfolio

@router.put("/{portfolio_id}", response_model=PortfolioSchema)
def update_portfolio(
    portfolio_id: int,
    portfolio_update: PortfolioUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a portfolio."""
    db_portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id,
        Portfolio.is_active == True
    ).first()
    
    if not db_portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Update portfolio fields
    if portfolio_update.name is not None:
        db_portfolio.name = portfolio_update.name
    if portfolio_update.description is not None:
        db_portfolio.description = portfolio_update.description
    
    # Update holdings if provided
    if portfolio_update.holdings is not None:
        # Validate weights
        total_weight = sum(holding.weight for holding in portfolio_update.holdings)
        if abs(total_weight - 1.0) > 0.01:
            raise HTTPException(status_code=400, detail="Portfolio weights must sum to 1.0")
        
        # Delete existing holdings
        db.query(PortfolioHolding).filter(
            PortfolioHolding.portfolio_id == portfolio_id
        ).delete()
        
        # Add new holdings
        for holding in portfolio_update.holdings:
            db_holding = PortfolioHolding(
                portfolio_id=portfolio_id,
                symbol=holding.symbol,
                weight=holding.weight,
                quantity=holding.quantity,
                avg_purchase_price=holding.avg_purchase_price
            )
            db.add(db_holding)
    
    db.commit()
    db.refresh(db_portfolio)
    
    return db_portfolio

@router.delete("/{portfolio_id}")
def delete_portfolio(
    portfolio_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a portfolio (soft delete)."""
    db_portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id,
        Portfolio.is_active == True
    ).first()
    
    if not db_portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Soft delete
    db_portfolio.is_active = False
    db.commit()
    
    return {"message": "Portfolio deleted successfully"}

@router.get("/{portfolio_id}/performance")
def get_portfolio_performance(
    portfolio_id: int,
    start_date: str = None,
    end_date: str = None,
    benchmark: str = "^NSEI",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get portfolio performance analysis."""
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id,
        Portfolio.is_active == True
    ).first()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if not portfolio.holdings:
        raise HTTPException(status_code=400, detail="Portfolio has no holdings")
    
    # Extract symbols and weights
    symbols = [holding.symbol for holding in portfolio.holdings]
    weights = [holding.weight for holding in portfolio.holdings]
    
    # Use default dates if not provided
    if not start_date or not end_date:
        from datetime import datetime, timedelta
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
    
    try:
        from app.services.analytics import analytics_service
        
        analysis_result = analytics_service.analyze_portfolio_performance(
            symbols=symbols,
            weights=weights,
            start_date=start_date,
            end_date=end_date,
            benchmark=benchmark
        )
        
        return {
            "portfolio_info": {
                "name": portfolio.name,
                "symbols": symbols,
                "weights": weights
            },
            "performance_analysis": analysis_result,
            "period": f"{start_date} to {end_date}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Performance analysis failed: {str(e)}")

@router.get("/{portfolio_id}/optimize")
def optimize_existing_portfolio(
    portfolio_id: int,
    optimization_type: str = "mean_variance",
    risk_tolerance: str = "moderate",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Optimize an existing portfolio."""
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id,
        Portfolio.is_active == True
    ).first()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if not portfolio.holdings:
        raise HTTPException(status_code=400, detail="Portfolio has no holdings")
    
    symbols = [holding.symbol for holding in portfolio.holdings]
    
    try:
        from app.services.optimization import portfolio_optimizer
        from app.models.schemas import OptimizationType, RiskTolerance
        
        # Convert string parameters to enums
        opt_type = OptimizationType(optimization_type)
        risk_tol = RiskTolerance(risk_tolerance)
        
        optimization_result = portfolio_optimizer.optimize_portfolio(
            symbols=symbols,
            optimization_type=opt_type,
            risk_tolerance=risk_tol
        )
        
        return {
            "current_portfolio": {
                "name": portfolio.name,
                "weights": {holding.symbol: holding.weight for holding in portfolio.holdings}
            },
            "optimized_portfolio": optimization_result,
            "optimization_type": optimization_type
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Portfolio optimization failed: {str(e)}")

@router.post("/{portfolio_id}/rebalance")
def rebalance_portfolio(
    portfolio_id: int,
    new_weights: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Rebalance portfolio with new weights."""
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id,
        Portfolio.is_active == True
    ).first()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Validate new weights
    total_weight = sum(new_weights.values())
    if abs(total_weight - 1.0) > 0.01:
        raise HTTPException(status_code=400, detail="New weights must sum to 1.0")
    
    # Get current holdings
    current_holdings = {holding.symbol: holding for holding in portfolio.holdings}
    
    # Update weights
    for symbol, new_weight in new_weights.items():
        if symbol in current_holdings:
            current_holdings[symbol].weight = new_weight
        else:
            # Add new holding
            new_holding = PortfolioHolding(
                portfolio_id=portfolio_id,
                symbol=symbol,
                weight=new_weight
            )
            db.add(new_holding)
    
    # Remove holdings with 0 weight
    for holding in portfolio.holdings:
        if holding.symbol not in new_weights or new_weights[holding.symbol] == 0:
            db.delete(holding)
    
    db.commit()
    
    return {"message": "Portfolio rebalanced successfully", "new_weights": new_weights}

@router.get("/{portfolio_id}/suggestions")
def get_portfolio_suggestions(
    portfolio_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get suggestions for improving the portfolio."""
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id,
        Portfolio.is_active == True
    ).first()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    if not portfolio.holdings:
        return {"suggestions": ["Add holdings to your portfolio to get suggestions"]}
    
    try:
        symbols = [holding.symbol for holding in portfolio.holdings]
        weights = [holding.weight for holding in portfolio.holdings]
        
        from app.services.data_service import data_service
        
        # Get correlation analysis
        correlation_matrix = data_service.get_correlation_matrix(symbols, "1y")
        
        suggestions = []
        
        # Check for high correlation
        import numpy as np
        corr_values = correlation_matrix.values
        high_corr_pairs = []
        
        for i in range(len(symbols)):
            for j in range(i+1, len(symbols)):
                if corr_values[i, j] > 0.8:
                    high_corr_pairs.append((symbols[i], symbols[j], corr_values[i, j]))
        
        if high_corr_pairs:
            suggestions.append({
                "type": "diversification",
                "message": "Some holdings are highly correlated. Consider reducing concentration.",
                "details": high_corr_pairs[:3]  # Top 3
            })
        
        # Check for concentration risk
        max_weight = max(weights)
        if max_weight > 0.3:
            max_symbol = symbols[weights.index(max_weight)]
            suggestions.append({
                "type": "concentration",
                "message": f"High concentration in {max_symbol} ({max_weight:.1%}). Consider reducing to <30%.",
                "symbol": max_symbol,
                "current_weight": max_weight
            })
        
        # Sector diversification suggestion
        suggestions.append({
            "type": "sectors",
            "message": "Consider adding exposure to different sectors for better diversification",
            "recommended_sectors": ["Banking", "IT", "FMCG", "Healthcare", "Infrastructure"]
        })
        
        # Asset class suggestion
        has_gold = any("GOLD" in symbol.upper() for symbol in symbols)
        if not has_gold:
            suggestions.append({
                "type": "asset_class",
                "message": "Consider adding gold exposure (GOLDBEES.NS) for inflation protection",
                "recommended_allocation": "5-10%"
            })
        
        return {"suggestions": suggestions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestions: {str(e)}")
