import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Get API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
}

export interface StockData {
  symbol: string;
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

export interface HistoricalData {
  symbol: string;
  dates: string[];
  prices: number[];
  volumes: number[];
  returns: number[];
}

export interface OptimizationRequest {
  symbols: string[];
  optimization_type: 'black_litterman' | 'risk_parity' | 'mean_variance' | 'minimum_variance' | 'monte_carlo';
  risk_tolerance?: 'conservative' | 'moderate' | 'aggressive';
  target_return?: number;
  risk_aversion?: number;
  confidence_level?: number;
  lookback_period?: number;
  investment_amount?: number; // This is for frontend calculation only
}

export interface OptimizationResult {
  symbols: string[];
  weights: number[];
  expected_return: number;
  expected_volatility: number;
  sharpe_ratio: number;
  optimization_type: string;
  metadata: any;
  num_simulations?: number;  // For Monte Carlo
  risk_tolerance?: string;   // For Monte Carlo
}

export interface PortfolioHoldingCreate {
  symbol: string;
  weight: number;
  quantity?: number;
  avg_purchase_price?: number;
}

export interface PortfolioCreate {
  name: string;
  description?: string;
  holdings: PortfolioHoldingCreate[];
  // Optimization metadata
  optimization_method?: string;
  risk_tolerance?: string;
  investment_amount?: number;
  expected_return?: number;
  expected_volatility?: number;
  sharpe_ratio?: number;
}

export interface PortfolioHolding {
  id: number;
  symbol: string;
  weight: number;
  quantity?: number;
  avg_purchase_price?: number;
}

export interface Portfolio {
  id: number;
  name: string;
  description?: string;
  user_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  holdings: PortfolioHolding[];
  // Optimization metadata
  optimization_method?: string;
  risk_tolerance?: string;
  investment_amount?: number;
  expected_return?: number;
  expected_volatility?: number;
  sharpe_ratio?: number;
}

export interface AnalyticsResponse {
  portfolio_info: {
    name: string;
    symbols: string[];
    weights: number[];
  };
  performance_analysis: {
    // Basic metrics
    current_value: number;
    total_return: number;
    total_return_percentage: number;
    annualized_return: number;
    volatility: number;
    sharpe_ratio: number;
    sortino_ratio: number;
    max_drawdown: number;
    calmar_ratio: number;
    
    // Risk metrics with benchmark comparison
    beta: number;
    alpha: number;
    var_95: number;
    cvar_95: number;
    tracking_error: number;
    information_ratio: number;
    downside_deviation: number;
    upside_deviation: number;
    correlation: number;
    
    // Historical data
    daily_returns: Array<{
      date: string;
      return: number;
      portfolio_value?: number;
      benchmark_value?: number;
    }>;
    historical_performance: Array<{
      date: string;
      portfolio_value: number;
      benchmark_value: number;
    }>;
    
    // Benchmark performance
    benchmark_performance: {
      total_return: number;
      annualized_return: number;
      volatility: number;
      sharpe_ratio: number;
      max_drawdown: number;
    };
    
    // Structured risk metrics
    risk_metrics: {
      beta: number;
      alpha: number;
      volatility: number;
      max_drawdown: number;
      var_95: number;
      cvar_95: number;
      downside_deviation: number;
      tracking_error: number;
      correlation: number;
      information_ratio: number;
      upside_deviation: number;
    };
    
    // Sector allocation
    sector_allocation: Record<string, number>;
    
    // Drawdown analysis
    drawdown_periods: Array<{
      start_date: string;
      end_date: string;
      max_drawdown: number;
      duration_days: number;
    }>;
  };
  period: string;
}

export interface BacktestRequest {
  symbols: string[];
  weights: Record<string, number>;
  start_date: string;
  end_date: string;
  initial_amount: number;
  rebalance_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

export interface BacktestResult {
  total_return: number;
  annual_return: number;
  volatility: number;
  sharpe_ratio: number;
  max_drawdown: number;
  daily_returns: Array<{
    date: string;
    portfolio_value: number;
    return: number;
  }>;
}

class ApiService {
  private api: AxiosInstance;
  private baseURL = API_BASE_URL;

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response: AxiosResponse<TokenResponse> = await this.api.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.post('/api/v1/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<UserResponse> {
    const response: AxiosResponse<UserResponse> = await this.api.get('/api/v1/auth/me');
    return response.data;
  }

  // Data endpoints
  async getStockData(symbol: string, period: string = '1y'): Promise<StockData[]> {
    try {
      const response: AxiosResponse<HistoricalData> = await this.api.get(`/api/v1/data/historical/${symbol}`, {
        params: { period },
      });
      
      const data = response.data;
      
      // Transform HistoricalData to StockData array
      if (!data.dates || !data.prices || !data.volumes) {
        console.warn('Incomplete historical data received:', data);
        return [];
      }
      
      return data.dates.map((date, index) => ({
        symbol: data.symbol || symbol,
        date,
        close: data.prices[index] || 0,
        open: data.prices[index] || 0,  // Backend doesn't provide OHLC, using close price
        high: data.prices[index] || 0,
        low: data.prices[index] || 0,
        volume: data.volumes[index] || 0
      }));
    } catch (error) {
      console.error('Error fetching stock data:', error);
      return [];
    }
  }

  async getMultipleStockData(symbols: string[], period: string = '1y'): Promise<Record<string, StockData[]>> {
    const response: AxiosResponse<Record<string, StockData[]>> = await this.api.post('/api/v1/data/historical/batch', {
      symbols,
      period,
    });
    return response.data;
  }

  async searchSymbols(query: string): Promise<string[]> {
    try {
      const response: AxiosResponse<string[]> = await this.api.get('/api/v1/data/search/symbols', {
        params: { query, limit: 50 },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching symbols:', error);
      return [];
    }
  }

  // Portfolio optimization endpoints
  async optimizePortfolio(request: OptimizationRequest): Promise<OptimizationResult> {
    // Transform the request to match backend expectations
    const backendRequest = {
      symbols: request.symbols,
      optimization_type: request.optimization_type,
      risk_tolerance: request.risk_tolerance,
      target_return: request.target_return,
      risk_aversion: request.risk_aversion,
      confidence_level: request.confidence_level,
      lookback_period: request.lookback_period,
    };

    const response: AxiosResponse<OptimizationResult> = await this.api.post('/api/v1/optimization/optimize', backendRequest);
    return response.data;
  }

  async optimizeWithConstraints(request: OptimizationRequest & { 
    min_weights?: Record<string, number>;
    max_weights?: Record<string, number>;
  }): Promise<OptimizationResult> {
    // For now, use the same endpoint since constraints aren't implemented yet
    // Transform the request to match backend expectations
    const backendRequest = {
      symbols: request.symbols,
      optimization_type: request.optimization_type,
      risk_tolerance: request.risk_tolerance,
      target_return: request.target_return,
      risk_aversion: request.risk_aversion,
      confidence_level: request.confidence_level,
      lookback_period: request.lookback_period,
    };

    const response: AxiosResponse<OptimizationResult> = await this.api.post('/api/v1/optimization/optimize', backendRequest);
    return response.data;
  }

  // Portfolio management endpoints
  async createPortfolio(portfolio: PortfolioCreate): Promise<Portfolio> {
    const response: AxiosResponse<Portfolio> = await this.api.post('/api/v1/portfolios/', portfolio);
    return response.data;
  }

  async getPortfolios(): Promise<Portfolio[]> {
    const response: AxiosResponse<Portfolio[]> = await this.api.get('/api/v1/portfolios/');
    return response.data;
  }

  async getPortfolio(id: number): Promise<Portfolio> {
    const response: AxiosResponse<Portfolio> = await this.api.get(`/api/v1/portfolios/${id}`);
    return response.data;
  }

  async updatePortfolio(id: number, portfolio: Partial<PortfolioCreate>): Promise<Portfolio> {
    const response: AxiosResponse<Portfolio> = await this.api.put(`/api/v1/portfolios/${id}`, portfolio);
    return response.data;
  }

  async deletePortfolio(id: number): Promise<void> {
    await this.api.delete(`/api/v1/portfolios/${id}`);
  }

  // Analytics endpoints
  async getPortfolioAnalytics(portfolioId: number): Promise<AnalyticsResponse> {
    const response: AxiosResponse<AnalyticsResponse> = await this.api.get(`/api/v1/portfolios/${portfolioId}/performance`);
    return response.data;
  }

  async getPerformanceMetrics(symbols: string[], weights: Record<string, number>, period: string = '1y'): Promise<AnalyticsResponse> {
    const response: AxiosResponse<AnalyticsResponse> = await this.api.post('/api/v1/analytics/performance', {
      symbols,
      weights,
      period,
    });
    return response.data;
  }

  // Backtesting endpoints
  async runBacktest(request: BacktestRequest): Promise<BacktestResult> {
    const response: AxiosResponse<BacktestResult> = await this.api.post('/api/v1/backtesting/run', request);
    return response.data;
  }

  async comparePortfolios(portfolios: Array<{
    name: string;
    symbols: string[];
    weights: Record<string, number>;
  }>, startDate: string, endDate: string): Promise<Record<string, BacktestResult>> {
    const response: AxiosResponse<Record<string, BacktestResult>> = await this.api.post('/api/v1/backtesting/compare', {
      portfolios,
      start_date: startDate,
      end_date: endDate,
    });
    return response.data;
  }

  // Utility methods
  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  removeToken(): void {
    localStorage.removeItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}

const apiService = new ApiService();

// Export individual methods for easier importing
export const login = (credentials: LoginRequest) => apiService.login(credentials);
export const register = (userData: RegisterRequest) => apiService.register(userData);
export const getCurrentUser = () => apiService.getCurrentUser();
export const getStockData = (symbol: string, period?: string) => apiService.getStockData(symbol, period);
export const getMultipleStockData = (symbols: string[], period?: string) => apiService.getMultipleStockData(symbols, period);
export const searchSymbols = (query: string) => apiService.searchSymbols(query);
export const optimizePortfolio = (request: OptimizationRequest) => apiService.optimizePortfolio(request);
export const optimizeWithConstraints = (request: OptimizationRequest & { min_weights?: Record<string, number>; max_weights?: Record<string, number> }) => apiService.optimizeWithConstraints(request);
export const createPortfolio = (portfolio: PortfolioCreate) => apiService.createPortfolio(portfolio);
export const getPortfolios = () => apiService.getPortfolios();
export const getPortfolio = (id: number) => apiService.getPortfolio(id);
export const updatePortfolio = (id: number, portfolio: Partial<PortfolioCreate>) => apiService.updatePortfolio(id, portfolio);
export const deletePortfolio = (id: number) => apiService.deletePortfolio(id);
export const getPortfolioAnalytics = (portfolioId: number) => apiService.getPortfolioAnalytics(portfolioId);
export const getPortfolioPerformance = (portfolioId: number) => apiService.getPortfolioAnalytics(portfolioId);
export const getPerformanceMetrics = (symbols: string[], weights: Record<string, number>, period?: string) => apiService.getPerformanceMetrics(symbols, weights, period);
export const runBacktest = (request: BacktestRequest) => apiService.runBacktest(request);
export const comparePortfolios = (portfolios: Array<{ name: string; symbols: string[]; weights: Record<string, number> }>, startDate: string, endDate: string) => apiService.comparePortfolios(portfolios, startDate, endDate);

export default apiService;
