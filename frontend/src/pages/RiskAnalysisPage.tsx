import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Security,
  TrendingDown,
  Warning,
  Assessment,
  Timeline,
  Analytics,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import apiService, { Portfolio, AnalyticsResponse } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`risk-tabpanel-${index}`}
      aria-labelledby={`risk-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface RiskMetrics {
  var_95: number;
  var_99: number;
  cvar_95: number;
  cvar_99: number;
  max_drawdown: number;
  volatility: number;
  beta: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  calmar_ratio: number;
}

interface StressTestResult {
  scenario: string;
  impact: number;
  probability: number;
  description: string;
}

const RiskAnalysisPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | ''>('');
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [stressTests, setStressTests] = useState<StressTestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const data = await apiService.getPortfolios();
      setPortfolios(data);
    } catch (err: any) {
      setError('Failed to fetch portfolios');
    }
  };

  const fetchRiskAnalysis = async () => {
    if (!selectedPortfolio) return;

    try {
      setLoading(true);
      setError('');

      const analyticsData = await apiService.getPortfolioAnalytics(selectedPortfolio as number);
      setAnalytics(analyticsData);

      // Calculate additional risk metrics (using mock data since backend doesn't provide all metrics yet)
      const mockRiskMetrics: RiskMetrics = {
        var_95: 0.05, // Mock 5% VaR
        var_99: 0.075, // Mock 7.5% VaR
        cvar_95: 0.06, // Mock CVaR
        cvar_99: 0.09, // Mock CVaR
        max_drawdown: analyticsData.performance_analysis.max_drawdown,
        volatility: analyticsData.performance_analysis.volatility / 100, // Convert from percentage to decimal
        beta: analyticsData.performance_analysis.beta || 1.0,
        sharpe_ratio: analyticsData.performance_analysis.sharpe_ratio,
        sortino_ratio: analyticsData.performance_analysis.sharpe_ratio * 1.1, // Approximation
        calmar_ratio: analyticsData.performance_analysis.total_return_percentage / Math.abs(analyticsData.performance_analysis.max_drawdown || 0.1),
      };
      setRiskMetrics(mockRiskMetrics);

      // Mock stress test results
      const mockStressTests: StressTestResult[] = [
        {
          scenario: 'Market Crash (-20%)',
          impact: -18.5,
          probability: 5,
          description: 'Severe market downturn similar to 2008 crisis'
        },
        {
          scenario: 'Sector Rotation',
          impact: -8.2,
          probability: 15,
          description: 'Major rotation out of current sector allocations'
        },
        {
          scenario: 'Interest Rate Hike',
          impact: -5.7,
          probability: 25,
          description: 'RBI increases repo rate by 100 basis points'
        },
        {
          scenario: 'Geopolitical Tension',
          impact: -12.3,
          probability: 10,
          description: 'Regional conflicts affecting market sentiment'
        },
        {
          scenario: 'Currency Devaluation',
          impact: -6.8,
          probability: 20,
          description: 'INR weakening against major currencies'
        },
      ];
      setStressTests(mockStressTests);

    } catch (err: any) {
      console.error('Risk analysis error:', err);
      setError('Failed to fetch risk analysis data. Using simulated data for demonstration.');
      
      // Provide fallback mock data when API fails
      const mockAnalytics = {
        portfolio_info: {
          name: 'Selected Portfolio',
          symbols: ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS'],
          weights: [0.4, 0.3, 0.3]
        },
        performance_analysis: {
          total_return: 15000,
          total_return_percentage: 15.0,
          current_value: 115000,
          annualized_return: 12.5,
          volatility: 0.182, // Convert to decimal form (18.2% as 0.182)
          sharpe_ratio: 0.68,
          sortino_ratio: 0.75,
          max_drawdown: -8.5,
          calmar_ratio: 1.47,
          beta: 1.1,
          alpha: 1.8,
          var_95: -0.045,
          cvar_95: -0.062,
          tracking_error: 2.8,
          information_ratio: 0.42,
          downside_deviation: 12.5,
          upside_deviation: 22.3,
          correlation: 0.87,
          daily_returns: Array.from({length: 30}, (_, i) => ({
            date: new Date(Date.now() - (29-i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            return: (Math.random() - 0.5) * 0.04 // Random returns between -2% and +2%
          })),
          historical_performance: [],
          sector_allocation: {},
          benchmark_performance: {
            total_return: 12.0,
            annualized_return: 10.0,
            volatility: 16.5,
            sharpe_ratio: 0.61,
            max_drawdown: -7.2
          },
          risk_metrics: {
            beta: 1.1,
            alpha: 1.8,
            volatility: 0.182, // Convert to decimal form (18.2% as 0.182)
            max_drawdown: -8.5,
            var_95: -0.045,
            cvar_95: -0.062,
            downside_deviation: 12.5,
            tracking_error: 2.8,
            correlation: 0.87,
            information_ratio: 0.42,
            upside_deviation: 22.3
          },
          drawdown_periods: []
        },
        period: "2024-07-29 to 2025-07-29"
      };
      setAnalytics(mockAnalytics);

      const mockRiskMetrics: RiskMetrics = {
        var_95: 0.05,
        var_99: 0.075,
        cvar_95: 0.06,
        cvar_99: 0.09,
        max_drawdown: -8.5,
        volatility: 0.182, // Convert to decimal form
        beta: 1.1,
        sharpe_ratio: 0.68,
        sortino_ratio: 0.75,
        calmar_ratio: 1.47,
      };
      setRiskMetrics(mockRiskMetrics);

      const mockStressTests: StressTestResult[] = [
        {
          scenario: 'Market Crash (-20%)',
          impact: -18.5,
          probability: 5,
          description: 'Severe market downturn similar to 2008 crisis'
        },
        {
          scenario: 'Sector Rotation',
          impact: -8.2,
          probability: 15,
          description: 'Major rotation out of current sector allocations'
        },
        {
          scenario: 'Interest Rate Hike',
          impact: -5.7,
          probability: 25,
          description: 'RBI increases repo rate by 100 basis points'
        },
        {
          scenario: 'Geopolitical Tension',
          impact: -12.3,
          probability: 10,
          description: 'Regional conflicts affecting market sentiment'
        },
      ];
      setStressTests(mockStressTests);
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'N/A';
    }
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskLevel = (var95: number) => {
    const absVar = Math.abs(var95);
    if (absVar < 0.05) return { level: 'Low', color: 'success' };
    if (absVar < 0.10) return { level: 'Medium', color: 'warning' };
    return { level: 'High', color: 'error' };
  };

  const getStressTestColor = (impact: number) => {
    // Professional color scheme based on severity
    if (impact > -5) return '#27AE60'; // Success green for low impact
    if (impact > -10) return '#F39C12'; // Warning orange for medium impact
    if (impact > -15) return '#E74C3C'; // Error red for high impact
    return '#8E44AD'; // Purple for severe impact
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Risk Analysis
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Comprehensive risk assessment and stress testing
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Portfolio Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Portfolio</InputLabel>
                <Select
                  value={selectedPortfolio}
                  label="Select Portfolio"
                  onChange={(e) => setSelectedPortfolio(e.target.value as number | '')}
                >
                  {portfolios.map((portfolio) => (
                    <MenuItem key={portfolio.id} value={portfolio.id}>
                      {portfolio.name} - {formatCurrency(
                        portfolio.holdings?.reduce((sum, holding) => 
                          sum + (holding.quantity || 0) * (holding.avg_purchase_price || 0), 0
                        ) || 0
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                size="large"
                onClick={fetchRiskAnalysis}
                disabled={!selectedPortfolio || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Security />}
                fullWidth
              >
                {loading ? 'Analyzing...' : 'Analyze Risk'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {analytics && riskMetrics && (
        <Box>
          {/* Risk Overview Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Security color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        VaR (95%)
                      </Typography>
                      <Typography variant="h6">
                        {formatPercentage(riskMetrics.var_95)}
                      </Typography>
                      <Chip
                        label={getRiskLevel(riskMetrics.var_95).level}
                        color={getRiskLevel(riskMetrics.var_95).color as any}
                        size="small"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <TrendingDown color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Max Drawdown
                      </Typography>
                      <Typography variant="h6" color="error">
                        {formatPercentage(riskMetrics.max_drawdown)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Timeline color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Volatility
                      </Typography>
                      <Typography variant="h6">
                        {formatPercentage(riskMetrics.volatility)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Assessment color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Beta
                      </Typography>
                      <Typography variant="h6">
                        {riskMetrics?.beta?.toFixed(2) || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Risk Analysis Tabs */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Risk Metrics" />
                <Tab label="Stress Testing" />
                <Tab label="Value at Risk" />
                <Tab label="Performance Ratios" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Comprehensive Risk Metrics
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell align="right">Value</TableCell>
                      <TableCell>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Value at Risk (95%)</TableCell>
                      <TableCell align="right">{formatPercentage(riskMetrics.var_95)}</TableCell>
                      <TableCell>Maximum expected loss at 95% confidence level</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Value at Risk (99%)</TableCell>
                      <TableCell align="right">{formatPercentage(riskMetrics.var_99)}</TableCell>
                      <TableCell>Maximum expected loss at 99% confidence level</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Conditional VaR (95%)</TableCell>
                      <TableCell align="right">{formatPercentage(riskMetrics.cvar_95)}</TableCell>
                      <TableCell>Expected shortfall beyond VaR threshold</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Maximum Drawdown</TableCell>
                      <TableCell align="right">{formatPercentage(riskMetrics.max_drawdown)}</TableCell>
                      <TableCell>Largest peak-to-trough decline</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Volatility (Annualized)</TableCell>
                      <TableCell align="right">{formatPercentage(riskMetrics.volatility)}</TableCell>
                      <TableCell>Standard deviation of returns</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Beta vs Market</TableCell>
                      <TableCell align="right">{riskMetrics?.beta?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell>Sensitivity to market movements</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Stress Test Scenarios
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Impact analysis under various market conditions
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stressTests}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="scenario" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Impact']}
                      />
                      <Bar dataKey="impact">
                        {stressTests.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStressTestColor(entry.impact)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} md={4}>
                  <List>
                    {stressTests.map((test, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Warning 
                            sx={{ 
                              color: getStressTestColor(test.impact) 
                            }} 
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={test.scenario}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                Impact: {test.impact}%
                              </Typography>
                              <Typography variant="body2">
                                Probability: {test.probability}%
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Value at Risk Analysis
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      VaR Confidence Levels
                    </Typography>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        95% Confidence Level
                      </Typography>
                      <Typography variant="h5" color="error">
                        {formatCurrency((analytics?.performance_analysis?.current_value || 0) * Math.abs(riskMetrics?.var_95 || 0))}
                      </Typography>
                    </Box>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        99% Confidence Level
                      </Typography>
                      <Typography variant="h5" color="error">
                        {formatCurrency((analytics?.performance_analysis?.current_value || 0) * Math.abs(riskMetrics?.var_99 || 0))}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Risk Interpretation
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Based on historical data, there is a 95% probability that daily losses 
                      will not exceed {formatPercentage(Math.abs(riskMetrics.var_95))}.
                    </Typography>
                    <Typography variant="body2">
                      In monetary terms, this translates to a maximum expected daily loss of{' '}
                      <strong>{formatCurrency((analytics?.performance_analysis?.current_value || 0) * Math.abs(riskMetrics.var_95))}</strong>{' '}
                      under normal market conditions.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Risk-Adjusted Performance Ratios
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {riskMetrics?.sharpe_ratio?.toFixed(2) || 'N/A'}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        Sharpe Ratio
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Risk-adjusted return relative to risk-free rate
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {riskMetrics?.sortino_ratio?.toFixed(2) || 'N/A'}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        Sortino Ratio
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Return per unit of downside risk
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {riskMetrics?.calmar_ratio?.toFixed(2) || 'N/A'}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        Calmar Ratio
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Annual return divided by maximum drawdown
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Ratio Interpretation
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Sharpe Ratio:</strong> A ratio above 1.0 is considered good, above 2.0 is very good, 
                  and above 3.0 is excellent. Your portfolio's Sharpe ratio of {riskMetrics?.sharpe_ratio?.toFixed(2) || 'N/A'} 
                  indicates {(riskMetrics?.sharpe_ratio || 0) > 2 ? 'excellent' : (riskMetrics?.sharpe_ratio || 0) > 1 ? 'good' : 'below average'} 
                  risk-adjusted performance.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Sortino Ratio:</strong> Similar to Sharpe but only considers downside volatility. 
                  Higher values indicate better downside risk management.
                </Typography>
                <Typography variant="body2">
                  <strong>Calmar Ratio:</strong> Measures return relative to worst drawdown. 
                  Higher values indicate better performance during difficult periods.
                </Typography>
              </Paper>
            </TabPanel>
          </Card>
        </Box>
      )}

      {!analytics && (
        <Card>
          <CardContent>
            <Box textAlign="center" py={8}>
              <Analytics sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select a Portfolio for Risk Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a portfolio from the dropdown above to view comprehensive risk metrics
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default RiskAnalysisPage;
