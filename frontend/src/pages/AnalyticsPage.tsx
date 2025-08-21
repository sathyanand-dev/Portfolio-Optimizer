import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, AccountBalance, Analytics as AnalyticsIcon } from '@mui/icons-material';
import { getPortfolios, getPortfolioPerformance, Portfolio as ApiPortfolio, AnalyticsResponse } from '../services/api';

interface Portfolio {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  allocation: Record<string, number>;
}

interface PerformanceData {
  portfolio_performance: {
    total_return: number;
    annualized_return: number;
    volatility: number;
    sharpe_ratio: number;
    sortino_ratio: number;
    max_drawdown: number;
    calmar_ratio: number;
    beta: number;
    alpha: number;
    var_95: number;
    cvar_95: number;
    tracking_error: number;
    information_ratio: number;
    downside_deviation: number;
    upside_deviation: number;
    correlation: number;
  };
  benchmark_performance: {
    total_return: number;
    annualized_return: number;
    volatility: number;
    sharpe_ratio: number;
    max_drawdown: number;
  };
  historical_performance: Array<{
    date: string;
    portfolio_value: number;
    benchmark_value: number;
  }>;
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
  sector_allocation: Record<string, number>;
  drawdown_periods: Array<{
    start_date: string;
    end_date: string;
    max_drawdown: number;
    duration_days: number;
  }>;
}

const AnalyticsPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<ApiPortfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | ''>('');
  const [performanceData, setPerformanceData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load portfolios on component mount
  useEffect(() => {
    const loadPortfolios = async () => {
      try {
        const data = await getPortfolios();
        setPortfolios(data);
        if (data.length > 0) {
          setSelectedPortfolio(data[0].id);
        }
      } catch (err) {
        setError('Failed to load portfolios');
        console.error('Error loading portfolios:', err);
      }
    };

    loadPortfolios();
  }, []);

  // Load performance data when portfolio selection changes
  useEffect(() => {
    if (selectedPortfolio) {
      loadPerformanceData();
    }
  }, [selectedPortfolio]);

  const loadPerformanceData = async () => {
    if (!selectedPortfolio) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getPortfolioPerformance(selectedPortfolio as number);
      
      // Transform the API response to match our expected structure
      const transformedData: AnalyticsResponse = {
        portfolio_info: data.portfolio_info,
        performance_analysis: {
          // Map main metrics
          current_value: data.performance_analysis?.current_value || 100000,
          total_return: data.performance_analysis?.total_return || 0,
          total_return_percentage: data.performance_analysis?.total_return_percentage || data.performance_analysis?.total_return || 0,
          daily_returns: data.performance_analysis?.historical_performance?.map((item: any) => ({
            date: item.date,
            return: ((item.portfolio_value / 100) - 1) || 0,
            portfolio_value: item.portfolio_value || 100,
            benchmark_value: item.benchmark_value || 100
          })) || [],
          volatility: data.performance_analysis?.volatility || 0,
          sharpe_ratio: data.performance_analysis?.sharpe_ratio || 0,
          max_drawdown: data.performance_analysis?.max_drawdown || 0,
          // Enhanced metrics
          annualized_return: data.performance_analysis?.annualized_return || 0,
          sortino_ratio: data.performance_analysis?.sortino_ratio || 0,
          calmar_ratio: data.performance_analysis?.calmar_ratio || 0,
          beta: data.performance_analysis?.beta || 1.0,
          alpha: data.performance_analysis?.alpha || 0.0,
          var_95: data.performance_analysis?.var_95 || 0,
          cvar_95: data.performance_analysis?.cvar_95 || 0,
          tracking_error: data.performance_analysis?.tracking_error || 0,
          information_ratio: data.performance_analysis?.information_ratio || 0,
          downside_deviation: data.performance_analysis?.downside_deviation || 0,
          upside_deviation: data.performance_analysis?.upside_deviation || 0,
          correlation: data.performance_analysis?.correlation || 0,
          sector_allocation: data.performance_analysis?.sector_allocation || {},
          historical_performance: data.performance_analysis?.historical_performance || [],
          benchmark_performance: data.performance_analysis?.benchmark_performance || {
            total_return: 0,
            annualized_return: 0,
            volatility: 0,
            sharpe_ratio: 0,
            max_drawdown: 0
          },
          risk_metrics: data.performance_analysis?.risk_metrics || {
            beta: 1.0,
            alpha: 0.0,
            volatility: 0,
            max_drawdown: 0,
            var_95: 0,
            cvar_95: 0,
            downside_deviation: 0,
            tracking_error: 0,
            correlation: 0,
            information_ratio: 0,
            upside_deviation: 0
          },
          drawdown_periods: data.performance_analysis?.drawdown_periods || []
        },
        period: data.period,
      };
      setPerformanceData(transformedData);
    } catch (err) {
      setError('Failed to load performance data');
      console.error('Error loading performance data:', err);
      // Set enhanced mock data for demonstration
      const mockData: AnalyticsResponse = {
        portfolio_info: {
          name: 'Portfolio',
          symbols: ['RELIANCE.NS', 'TCS.NS'],
          weights: [0.5, 0.5],
        },
        performance_analysis: {
          current_value: 100000,
          total_return: 15000,
          total_return_percentage: 0.15,
          annualized_return: 0.12,
          daily_returns: [],
          volatility: 0.18,
          sharpe_ratio: 0.85,
          sortino_ratio: 1.2,
          max_drawdown: -0.08,
          calmar_ratio: 1.5,
          beta: 1.1,
          alpha: 0.03,
          var_95: -0.025,
          cvar_95: -0.035,
          tracking_error: 0.04,
          information_ratio: 0.75,
          downside_deviation: 0.12,
          upside_deviation: 0.22,
          correlation: 0.85,
          sector_allocation: {
            'Technology': 35,
            'Finance': 30,
            'Energy': 20,
            'Healthcare': 15
          },
          historical_performance: [
            { date: '2024-01-01', portfolio_value: 100, benchmark_value: 100 },
            { date: '2024-06-01', portfolio_value: 108, benchmark_value: 104 },
            { date: '2024-12-01', portfolio_value: 115, benchmark_value: 110 }
          ],
          benchmark_performance: {
            total_return: 0.10,
            annualized_return: 0.08,
            volatility: 0.15,
            sharpe_ratio: 0.70,
            max_drawdown: -0.06
          },
          risk_metrics: {
            beta: 1.1,
            alpha: 0.03,
            volatility: 0.18,
            max_drawdown: -0.08,
            var_95: -0.025,
            cvar_95: -0.035,
            downside_deviation: 0.12,
            tracking_error: 0.04,
            correlation: 0.85,
            information_ratio: 0.75,
            upside_deviation: 0.22
          },
          drawdown_periods: [
            {
              start_date: '2024-03-01',
              end_date: '2024-04-15',
              max_drawdown: -0.08,
              duration_days: 45
            }
          ]
        },
        period: '1y',
      };
      setPerformanceData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatNumber = (value: number | undefined | null, decimals: number = 2): string => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    return value.toFixed(decimals);
  };

  const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) return '₹N/A';
    return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const getPerformanceColor = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) return '#5D6D7E';
    return value >= 0 ? '#27AE60' : '#E74C3C';
  };

  const getPerformanceIcon = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return null;
    return value >= 0 ? <TrendingUp /> : <TrendingDown />;
  };

  // Colors for charts
  // Professional color palette for charts
  const COLORS = ['#2C3E50', '#3498DB', '#27AE60', '#E74C3C', '#F39C12', '#8E44AD', '#34495E', '#16A085'];

  // Prepare sector allocation data for pie chart from analytics
  const sectorData = performanceData?.performance_analysis?.sector_allocation ? 
    Object.entries(performanceData.performance_analysis.sector_allocation).map(([name, value]) => ({
      name,
      value: typeof value === 'number' ? value : 0
    })) : [
      { name: 'Technology', value: 35 },
      { name: 'Finance', value: 25 },
      { name: 'Healthcare', value: 15 },
      { name: 'Energy', value: 15 },
      { name: 'Consumer', value: 10 },
    ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AnalyticsIcon />
        Portfolio Analytics
      </Typography>

      {/* Portfolio Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Portfolio</InputLabel>
          <Select
            value={selectedPortfolio}
            onChange={(e) => setSelectedPortfolio(e.target.value as number)}
            label="Select Portfolio"
          >
            {portfolios.map((portfolio) => (
              <MenuItem key={portfolio.id} value={portfolio.id}>
                {portfolio.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {portfolios.find(p => p.id === selectedPortfolio) && (
          <Box>
            <Typography variant="h6">
              {portfolios.find(p => p.id === selectedPortfolio)?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {portfolios.find(p => p.id === selectedPortfolio)?.description || 'No description'}
            </Typography>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" sx={{ mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {performanceData && !loading && (
        <>
          {/* Key Performance Metrics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Return
                  </Typography>
                  <Box display="flex" alignItems="center">
                    {getPerformanceIcon(performanceData.performance_analysis?.total_return)}
                    <Typography 
                      variant="h5" 
                      sx={{ color: getPerformanceColor(performanceData.performance_analysis?.total_return), ml: 1 }}
                    >
                      {formatPercentage(performanceData.performance_analysis?.total_return)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Annualized Return
                  </Typography>
                  <Box display="flex" alignItems="center">
                    {getPerformanceIcon(performanceData.performance_analysis?.annualized_return)}
                    <Typography 
                      variant="h5" 
                      sx={{ color: getPerformanceColor(performanceData.performance_analysis?.annualized_return), ml: 1 }}
                    >
                      {formatPercentage(performanceData.performance_analysis?.annualized_return)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Volatility
                  </Typography>
                  <Typography variant="h5">
                    {formatPercentage(performanceData.performance_analysis?.volatility)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Sharpe Ratio
                  </Typography>
                  <Typography variant="h5">
                    {formatNumber(performanceData.performance_analysis?.sharpe_ratio)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Performance Chart */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Comparison
            </Typography>
            {performanceData.performance_analysis?.historical_performance && performanceData.performance_analysis.historical_performance.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData.performance_analysis.historical_performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toFixed(2) : value, 
                      name === 'portfolio_value' ? 'Portfolio' : 'Benchmark'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="portfolio_value" 
                    stroke="#3498DB" 
                    name="Portfolio"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="benchmark_value" 
                    stroke="#F39C12" 
                    name="Benchmark"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No historical performance data available
              </Typography>
            )}
          </Paper>

          <Grid container spacing={3}>
            {/* Risk Metrics */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Risk Metrics
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Beta</TableCell>
                        <TableCell align="right">
                          {formatNumber(performanceData.performance_analysis?.beta || 
                                       performanceData.performance_analysis?.risk_metrics?.beta)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Alpha</TableCell>
                        <TableCell align="right">
                          {formatPercentage(performanceData.performance_analysis?.alpha || 
                                           performanceData.performance_analysis?.risk_metrics?.alpha)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Sortino Ratio</TableCell>
                        <TableCell align="right">
                          {formatNumber(performanceData.performance_analysis?.sortino_ratio)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Calmar Ratio</TableCell>
                        <TableCell align="right">
                          {formatNumber(performanceData.performance_analysis?.calmar_ratio)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Max Drawdown</TableCell>
                        <TableCell align="right">
                          <Typography color="error">
                            {formatPercentage(performanceData.performance_analysis?.max_drawdown)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>VaR (95%)</TableCell>
                        <TableCell align="right">
                          <Typography color="error">
                            {formatPercentage(performanceData.performance_analysis?.var_95)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Sector Allocation */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Sector Allocation
                </Typography>
                {sectorData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent || 0).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#3498DB"
                        dataKey="value"
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No sector allocation data available
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Benchmark Comparison */}
          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Benchmark Comparison
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="body2" color="text.secondary">Portfolio Return</Typography>
                <Typography variant="h6" sx={{ color: getPerformanceColor(performanceData.performance_analysis?.total_return) }}>
                  {formatPercentage(performanceData.performance_analysis?.total_return)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="body2" color="text.secondary">Benchmark Return</Typography>
                <Typography variant="h6" sx={{ color: getPerformanceColor(performanceData.performance_analysis?.benchmark_performance?.total_return) }}>
                  {formatPercentage(performanceData.performance_analysis?.benchmark_performance?.total_return)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="body2" color="text.secondary">Excess Return</Typography>
                <Typography variant="h6" sx={{ 
                  color: getPerformanceColor(
                    (performanceData.performance_analysis?.total_return || 0) - 
                    (performanceData.performance_analysis?.benchmark_performance?.total_return || 0)
                  ) 
                }}>
                  {formatPercentage(
                    (performanceData.performance_analysis?.total_return || 0) - 
                    (performanceData.performance_analysis?.benchmark_performance?.total_return || 0)
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="body2" color="text.secondary">Portfolio Volatility</Typography>
                <Typography variant="h6">
                  {formatPercentage(performanceData.performance_analysis?.volatility)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="body2" color="text.secondary">Benchmark Volatility</Typography>
                <Typography variant="h6">
                  {formatPercentage(performanceData.performance_analysis?.benchmark_performance?.volatility)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="body2" color="text.secondary">Tracking Error</Typography>
                <Typography variant="h6">
                  {formatPercentage(performanceData.performance_analysis?.tracking_error)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}

      {!selectedPortfolio && portfolios.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AccountBalance sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Portfolios Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create a portfolio first to view analytics
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AnalyticsPage;
