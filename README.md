# Indian Stock Portfolio Optimizer

A comprehensive full-stack application for optimizing Indian stock portfolios with real-time data integration, advanced analytics, and professional UI.

## 🎯 Features

### Backend (FastAPI)
- **Real-time Data**: Integration with yfinance for NSE/BSE stocks and ETFs
- **Portfolio Optimization**: Black-Litterman, Risk Parity, Mean-Variance, Minimum Variance models
- **Risk Analytics**: Performance metrics, volatility analysis, Sharpe ratio calculations
- **Backtesting**: Historical strategy performance analysis
- **Authentication**: JWT-based user management and portfolio persistence
- **Indian Market Focus**: Support for Indian stocks, indices, and precious metal ETFs

### Frontend (React + Material-UI)
- **Professional UI**: Enterprise-grade color palette and design
- **Interactive Dashboard**: Real-time portfolio analytics and visualizations
- **Stock Search**: Autocomplete with 5000+ NSE/BSE symbols
- **Portfolio Management**: Create, save, and track multiple portfolios
- **Risk Analysis**: Advanced charts and performance metrics
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠 Technology Stack

- **Backend**: FastAPI, SQLAlchemy, yfinance, NumPy, Pandas, SciPy
- **Frontend**: React (TypeScript), Material-UI, Recharts, Axios
- **Database**: SQLite with Alembic migrations
- **Authentication**: JWT tokens
- **Deployment**: Render (Backend) + Vercel (Frontend)

## ⚡ Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/sathyanand-dev/portfolio-optimizer
   cd portfolio-optimizer
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   alembic upgrade head
   uvicorn main:app --reload
   ```

3. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/docs
   uvicorn main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 📊 API Endpoints

### Portfolio Optimization
- `POST /api/v1/optimize` - Portfolio optimization with multiple models
- `GET /api/v1/symbols/search` - Search stock symbols

### Analytics
- `POST /api/v1/analytics/performance` - Portfolio performance metrics
- `POST /api/v1/analytics/risk` - Risk analysis
- `POST /api/v1/backtest` - Strategy backtesting

### Data Endpoints
- `GET /api/v1/stocks/{symbol}` - Get real-time stock data
- `GET /api/v1/historical/{symbol}` - Get historical price data
- `GET /api/v1/market/indices` - Get market indices (Nifty, Sensex, etc.)

### User Management
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/portfolios` - Get user portfolios
- `POST /api/v1/portfolios` - Create/update portfolio
