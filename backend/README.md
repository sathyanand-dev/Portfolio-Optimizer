# Portfolio Optimizer Backend

FastAPI backend for the Indian Stock Portfolio Optimizer.

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

4. **Start the server:**
   ```bash
   uvicorn main:app --reload
   ```

5. **Access API docs:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Deployment

This backend is configured for deployment on [Render](https://render.com).

See the main project README for deployment instructions.

## API Endpoints

- `/docs` - API documentation
- `/health` - Health check
- `/api/v1/auth/` - Authentication endpoints
- `/api/v1/portfolios/` - Portfolio management
- `/api/v1/optimize/` - Portfolio optimization
- `/api/v1/analytics/` - Portfolio analytics

## Environment Variables

- `SECRET_KEY` - JWT secret key
- `DATABASE_URL` - Database connection string
- `RISK_FREE_RATE` - Risk-free rate for calculations (default: 0.07)
- `DEFAULT_MARKET_SUFFIX` - Market suffix for Indian stocks (default: .NS)
