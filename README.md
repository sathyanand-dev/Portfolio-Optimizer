# Indian Stock Portfolio Optimizer

A comprehensive full-stack application for optimizing Indian stock portfolios with real-time data integration, advanced analytics, and professional UI.

## 🚀 Live Demo

- **Frontend (React)**: [Your Vercel URL](https://your-app.vercel.app)
- **Backend API (FastAPI)**: [Your Render URL](https://your-app.onrender.com)
- **API Documentation**: [Your Render URL/docs](https://your-app.onrender.com/docs)

## 🎯 Features

### Backend (FastAPI)
- **Real-time Data**: Integration with yfinance for NSE/BSE stocks and ETFs
- **Portfolio Optimization**: Black-Litterman, Risk Parity, Mean-Variance, Minimum Variance models
- **Risk Analytics**: Performance metrics, volatility analysis, Sharpe ratio calculations
- **Backtesting**: Historical strategy performance analysis
- **Authentication**: JWT-based user management and portfolio persistence
- **Indian Market Focus**: Support for Indian stocks, indices, and precious metal ETFs

### Frontend (React + TypeScript + Material-UI)
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
   git clone https://github.com/yourusername/portfolio-optimizer
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

### Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions to Render and Vercel (free hosting).

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

## Project Structure

```
.
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── config.py              # Configuration settings
│   ├── database.py            # Database connection
│   ├── auth/                  # Authentication module
│   ├── models/                # Data models
│   ├── api/                   # API routes
│   ├── services/              # Business logic
│   │   ├── data_service.py    # Data fetching
│   │   ├── optimization.py    # Portfolio optimization
│   │   ├── analytics.py       # Risk and performance analytics
│   │   └── backtesting.py     # Strategy backtesting
│   └── utils/                 # Utility functions
├── tests/                     # Test files
├── requirements.txt
├── .env.example
└── README.md
```

## Environment Variables

```env
# Database
DATABASE_URL=sqlite:///./portfolio_optimizer.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME=Indian Portfolio Optimizer

## 🚀 Deployment

This application is configured for **free deployment** on:

- **Backend**: [Render](https://render.com) (Free tier: 750 hours/month)
- **Frontend**: [Vercel](https://vercel.com) (Free tier: Unlimited)

### Quick Deploy

1. **Prepare for deployment:**
   ```bash
   # Windows
   prepare-deployment.bat
   
   # Linux/Mac
   ./prepare-deployment.sh
   ```

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Deploy Backend to Render:**
   - Connect GitHub repo
   - Use build command: `pip install -r requirements.txt && alembic upgrade head`
   - Use start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Deploy Frontend to Vercel:**
   - Connect GitHub repo
   - Set root directory to `frontend`
   - Add environment variable: `REACT_APP_API_URL=https://your-render-url.onrender.com`

📖 **Detailed Instructions**: See [DEPLOYMENT.md](DEPLOYMENT.md)

## 🎯 Project Structure

```
portfolio-optimizer/
├── backend/               # FastAPI backend
│   ├── app/              # Application code
│   │   ├── api/          # API routes
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   └── auth/         # Authentication
│   ├── alembic/          # Database migrations
│   ├── main.py           # FastAPI entry point
│   ├── requirements.txt  # Python dependencies
│   └── render.yaml       # Render deployment config
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── theme/        # MUI theme
│   ├── package.json      # Node dependencies
│   └── vercel.json       # Vercel deployment config
├── README.md             # Main documentation
└── DEPLOYMENT.md         # Deployment guide
```

## 💰 Cost Breakdown

**Total Monthly Cost: $0** (Free tiers)

- **Render Free**: 750 hours/month (perfect for demo)
- **Vercel Free**: Unlimited static hosting
- **GitHub**: Free for public repositories

Perfect for portfolio projects and demonstrations! 🎉

## 🛡️ Security Features

- JWT authentication with secure tokens
- CORS protection with domain restrictions
- Input validation and sanitization
- SQL injection protection via SQLAlchemy ORM
- Rate limiting ready (can be added)

## 📈 Performance Features

- **Caching**: 15-minute cache for market data
- **Async Processing**: FastAPI async endpoints
- **Optimized Queries**: Efficient database operations
- **CDN Ready**: Static assets optimized for Vercel Edge Network

## 🧪 Development

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
