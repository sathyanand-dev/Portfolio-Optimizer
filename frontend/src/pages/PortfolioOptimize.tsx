import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Autocomplete,
  Paper,
  Grid,
} from '@mui/material';
import {
  TrendingUp,
  Delete,
  Calculate,
  Save,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import apiService, { OptimizationRequest, OptimizationResult } from '../services/api';

const POPULAR_INDIAN_STOCKS = [
  // Nifty 50 Stocks (All 50 companies)
  'RELIANCE.NS',
  'TCS.NS',
  'HDFCBANK.NS',
  'HINDUNILVR.NS',
  'INFY.NS',
  'ICICIBANK.NS',
  'KOTAKBANK.NS',
  'SBIN.NS',
  'BHARTIARTL.NS',
  'ITC.NS',
  'ASIANPAINT.NS',
  'MARUTI.NS',
  'LT.NS',
  'AXISBANK.NS',
  'WIPRO.NS',
  'ONGC.NS',
  'POWERGRID.NS',
  'NTPC.NS',
  'TECHM.NS',
  'JSWSTEEL.NS',
  'NESTLEIND.NS',
  'BAJFINANCE.NS',
  'BAJAJFINSV.NS',
  'HCLTECH.NS',
  'TITAN.NS',
  'ULTRACEMCO.NS',
  'ADANIPORTS.NS',
  'COALINDIA.NS',
  'DRREDDY.NS',
  'SUNPHARMA.NS',
  'TATAMOTORS.NS',
  'TATASTEEL.NS',
  'GRASIM.NS',
  'BPCL.NS',
  'CIPLA.NS',
  'EICHERMOT.NS',
  'HEROMOTOCO.NS',
  'BRITANNIA.NS',
  'DIVISLAB.NS',
  'APOLLOHOSP.NS',
  'INDUSINDBK.NS',
  'TATACONSUM.NS',
  'UPL.NS',
  'HINDALCO.NS',
  'BAJAJ-AUTO.NS',
  'SHRIRAMFIN.NS',
  'SBILIFE.NS',
  'HDFCLIFE.NS',
  'LTIM.NS',
  'ADANIENT.NS',
  
  // Gold & Silver ETFs
  'GOLDBEES.NS',
  'GOLDIETF.NS',
  'LIQUIDBEES.NS',
  'SILVERBEES.NS',
  'SILVRETF.NS',
  
  // Additional Popular ETFs
  'NIFTYBEES.NS',
  'JUNIORBEES.NS',
  'BANKBEES.NS',
];

const COLORS = ['#1976d2', '#2196f3', '#42a5f5', '#64b5f6', '#90caf9', '#bbdefb'];

interface SelectedStock {
  symbol: string;
}

const PortfolioOptimize: React.FC = () => {
  const [selectedStocks, setSelectedStocks] = useState<SelectedStock[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [optimizationMethod, setOptimizationMethod] = useState<'black_litterman' | 'risk_parity' | 'mean_variance' | 'minimum_variance'>('mean_variance');
  const [investmentAmount, setInvestmentAmount] = useState<number>(100000);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const handleAddStock = (symbol: string | null) => {
    if (symbol && !selectedStocks.find(stock => stock.symbol === symbol)) {
      setSelectedStocks([...selectedStocks, { symbol }]);
    }
  };

  const handleRemoveStock = (symbol: string) => {
    setSelectedStocks(selectedStocks.filter(stock => stock.symbol !== symbol));
  };

  const handleOptimize = async () => {
    if (selectedStocks.length < 2) {
      setError('Please select at least 2 stocks for optimization');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const request: OptimizationRequest = {
        symbols: selectedStocks.map(stock => stock.symbol),
        risk_tolerance: riskTolerance,
        optimization_type: optimizationMethod,
        investment_amount: investmentAmount,
      };

      const result = await apiService.optimizePortfolio(request);
      setOptimizationResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Optimization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePortfolio = async () => {
    if (!optimizationResult) return;

    setSaveLoading(true);
    try {
      // Transform weights array to object
      const weightsObj: Record<string, number> = {};
      optimizationResult.symbols.forEach((symbol, index) => {
        weightsObj[symbol] = optimizationResult.weights[index];
      });

      const holdings = selectedStocks.map((stock, index) => ({
        symbol: stock.symbol,
        weight: optimizationResult.weights[index],
        quantity: 0, // Optional, can be calculated later
        avg_purchase_price: 0 // Optional, can be set later
      }));

      const portfolioData = {
        name: `Optimized Portfolio - ${new Date().toLocaleDateString()}`,
        description: `${optimizationMethod.replace('_', ' ').toUpperCase()} optimization with ${riskTolerance.toLowerCase()} risk tolerance`,
        holdings: holdings,
      };

      await apiService.createPortfolio(portfolioData);
      alert('Portfolio saved successfully!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save portfolio');
    } finally {
      setSaveLoading(false);
    }
  };

  const pieChartData = optimizationResult ? 
    optimizationResult.symbols.map((symbol, index) => ({
      name: symbol,
      value: optimizationResult.weights[index] * 100,
      amount: optimizationResult.weights[index] * investmentAmount,
    })) : [];

  const barChartData = optimizationResult ?
    optimizationResult.symbols.map((symbol, index) => ({
      symbol,
      weight: optimizationResult.weights[index] * 100,
    })) : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Portfolio Optimization
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Create an optimized portfolio using advanced mathematical models
      </Typography>

      <Grid container spacing={3}>
        {/* Configuration Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuration
              </Typography>

              {/* Stock Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Select Stocks
                </Typography>
                <Autocomplete
                  options={POPULAR_INDIAN_STOCKS}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Add Stock Symbol"
                      placeholder="Search stocks..."
                    />
                  )}
                  onChange={(event, value) => handleAddStock(value)}
                  value={null}
                />
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedStocks.map((stock) => (
                    <Chip
                      key={stock.symbol}
                      label={stock.symbol}
                      onDelete={() => handleRemoveStock(stock.symbol)}
                      deleteIcon={<Delete />}
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>

              {/* Investment Amount */}
              <TextField
                fullWidth
                label="Investment Amount (₹)"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                sx={{ mb: 3 }}
                InputProps={{
                  inputProps: { min: 1000, step: 1000 }
                }}
              />

              {/* Risk Tolerance */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Risk Tolerance</InputLabel>
                <Select
                  value={riskTolerance}
                  label="Risk Tolerance"
                  onChange={(e) => setRiskTolerance(e.target.value as any)}
                >
                  <MenuItem value="conservative">Conservative</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="aggressive">Aggressive</MenuItem>
                </Select>
              </FormControl>

              {/* Optimization Method */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Optimization Method</InputLabel>
                <Select
                  value={optimizationMethod}
                  label="Optimization Method"
                  onChange={(e) => setOptimizationMethod(e.target.value as any)}
                >
                  <MenuItem value="mean_variance">Mean-Variance</MenuItem>
                  <MenuItem value="black_litterman">Black-Litterman</MenuItem>
                  <MenuItem value="risk_parity">Risk Parity</MenuItem>
                  <MenuItem value="minimum_variance">Minimum Variance</MenuItem>
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="contained"
                onClick={handleOptimize}
                disabled={loading || selectedStocks.length < 2}
                startIcon={loading ? <CircularProgress size={20} /> : <Calculate />}
              >
                {loading ? 'Optimizing...' : 'Optimize Portfolio'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Panel */}
        <Grid item xs={12} md={8}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {optimizationResult ? (
            <Grid container spacing={2}>
              {/* Performance Metrics */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Optimization Results
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {(optimizationResult.expected_return * 100).toFixed(2)}%
                          </Typography>
                          <Typography variant="caption">Expected Return</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="secondary">
                            {(optimizationResult.expected_volatility * 100).toFixed(2)}%
                          </Typography>
                          <Typography variant="caption">Volatility</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h6" color="success.main">
                            {optimizationResult.sharpe_ratio.toFixed(2)}
                          </Typography>
                          <Typography variant="caption">Sharpe Ratio</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleSavePortfolio}
                          disabled={saveLoading}
                          startIcon={saveLoading ? <CircularProgress size={20} /> : <Save />}
                          sx={{ height: '100%' }}
                        >
                          {saveLoading ? 'Saving...' : 'Save Portfolio'}
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Allocation Chart */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Asset Allocation
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${(value ?? 0).toFixed(1)}%`}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Weight Distribution */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Weight Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="symbol" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                        <Bar dataKey="weight" fill="#1976d2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Allocation Table */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Investment Allocation
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2" fontWeight="bold">Symbol</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2" fontWeight="bold">Weight</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2" fontWeight="bold">Amount (₹)</Typography>
                      </Grid>
                      {optimizationResult.symbols.map((symbol, index) => (
                        <React.Fragment key={symbol}>
                          <Grid item xs={4}>
                            <Typography>{symbol}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography>{(optimizationResult.weights[index] * 100).toFixed(2)}%</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography>₹{(optimizationResult.weights[index] * investmentAmount).toLocaleString('en-IN')}</Typography>
                          </Grid>
                        </React.Fragment>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <TrendingUp sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Configure Your Portfolio
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select stocks, set your investment amount and risk tolerance, then click optimize to see results
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default PortfolioOptimize;
