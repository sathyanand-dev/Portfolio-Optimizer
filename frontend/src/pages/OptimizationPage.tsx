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
  Chip,
  Alert,
  CircularProgress,
  Autocomplete,
  Slider,
  FormControlLabel,
  Switch,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Delete,
  TrendingUp,
  Security,
  Assessment,
  Save,
  Refresh,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import apiService, { OptimizationRequest, OptimizationResult, PortfolioCreate, PortfolioHoldingCreate } from '../services/api';

// Common Indian stocks for autocomplete
const INDIAN_STOCKS = [
  // Original stocks
  'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS',
  'ICICIBANK.NS', 'KOTAKBANK.NS', 'BHARTIARTL.NS', 'ITC.NS', 'SBIN.NS',
  'BAJFINANCE.NS', 'ASIANPAINT.NS', 'MARUTI.NS', 'TITAN.NS', 'WIPRO.NS',
  'ULTRACEMCO.NS', 'NESTLEIND.NS', 'POWERGRID.NS', 'NTPC.NS', 'ONGC.NS',
  'GOLDBEES.NS', 'SILVERBEES.NS', 'NIFTYBEES.NS', 'BANKBEES.NS',

  // All Nifty 50 stocks
  'ADANIENT.NS', 'ADANIPORTS.NS', 'APOLLOHOSP.NS', 'ASIANPAINT.NS',
  'AXISBANK.NS', 'BAJAJ-AUTO.NS', 'BAJFINANCE.NS', 'BAJAJFINSV.NS',
  'BEL.NS', 'BHARTIARTL.NS', 'CIPLA.NS', 'COALINDIA.NS', 'DRREDDY.NS',
  'EICHERMOT.NS', 'ETERNAL.NS', 'GRASIM.NS', 'HCLTECH.NS', 'HDFCBANK.NS',
  'HDFCLIFE.NS', 'HEROMOTOCO.NS', 'HINDALCO.NS', 'HINDUNILVR.NS',
  'ICICIBANK.NS', 'INDUSINDBK.NS', 'INFY.NS', 'ITC.NS', 'JIOFIN.NS',
  'JSWSTEEL.NS', 'KOTAKBANK.NS', 'LT.NS', 'M&M.NS', 'MARUTI.NS',
  'NESTLEIND.NS', 'NTPC.NS', 'ONGC.NS', 'POWERGRID.NS', 'RELIANCE.NS',
  'SBILIFE.NS', 'SBIN.NS', 'SUNPHARMA.NS', 'TCS.NS', 'TATACONSUM.NS',
  'TATAMOTORS.NS', 'TATASTEEL.NS', 'TECHM.NS', 'TITAN.NS',
  'TRENT.NS', 'ULTRACEMCO.NS', 'WIPRO.NS',

  // Gold ETFs
  'GOLDBEES.NS', 'HDFCGOLD.NS', 'ICICIGOLD.NS',
  'KOTAKGOLD.NS', 'SETFGOLD.NS', 'GOLDSHARE.NS',

  // Silver ETFs — placeholder tickers; verify actual NSE codes
  'MIRAEASLVR.NS', 'HDFCSILV.NS', 'AXISSILV.NS',
  'KOTAKSILV.NS', 'SBISILV.NS', 'DSPSILV.NS',
  'ABSLSILV.NS', 'NIPPONSILV.NS', 'UTISILV.NS'
];

// Professional color palette for charts
const COLORS = ['#2C3E50', '#3498DB', '#27AE60', '#E74C3C', '#F39C12', '#8E44AD'];

const OptimizationPage: React.FC = () => {
  // Form state
  const [symbols, setSymbols] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [method, setMethod] = useState<'black_litterman' | 'risk_parity' | 'mean_variance' | 'minimum_variance' | 'monte_carlo'>('mean_variance');
  const [investmentAmount, setInvestmentAmount] = useState<number>(100000);
  const [useConstraints, setUseConstraints] = useState(false);
  const [minWeights, setMinWeights] = useState<Record<string, number>>({});
  const [maxWeights, setMaxWeights] = useState<Record<string, number>>({});

  // Stock search state
  const [stockOptions, setStockOptions] = useState<string[]>(INDIAN_STOCKS);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);

  // Results state
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Save dialog state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [portfolioName, setPortfolioName] = useState('');
  const [portfolioDescription, setPortfolioDescription] = useState('');

  // Custom debounce function
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Debounced stock search function
  const debouncedSearch = React.useCallback(
    React.useMemo(
      () =>
        debounce(async (searchQuery: string) => {
          if (searchQuery.length < 2) {
            setStockOptions(INDIAN_STOCKS);
            return;
          }

          setSearchLoading(true);
          try {
            const searchResults = await apiService.searchSymbols(searchQuery);
            // Combine API results with popular stocks, removing duplicates
            const filteredPopular = INDIAN_STOCKS.filter(stock => 
              stock.toLowerCase().includes(searchQuery.toLowerCase())
            );
            const allOptions = [...searchResults, ...filteredPopular];
            const uniqueOptions = allOptions.filter((stock, index) => 
              allOptions.indexOf(stock) === index
            );
            setStockOptions(uniqueOptions);
          } catch (error) {
            console.error('Error searching stocks:', error);
            // Fallback to filtering popular stocks
            const filteredOptions = INDIAN_STOCKS.filter(stock => 
              stock.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setStockOptions(filteredOptions);
          } finally {
            setSearchLoading(false);
          }
        }, 300),
      []
    ),
    []
  );

  // Handle search input change
  const handleSearchInputChange = (event: React.SyntheticEvent, value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleAddSymbol = (event: any, value: string | null) => {
    if (value && !symbols.includes(value)) {
      setSymbols([...symbols, value]);
      setMinWeights({ ...minWeights, [value]: 0 });
      setMaxWeights({ ...maxWeights, [value]: 100 });
      
      // Clear the search input and keep dropdown open for next selection
      setSearchQuery('');
      setAutocompleteOpen(true);
      
      // Refocus the input after a short delay
      setTimeout(() => {
        const autocompleteInput = document.querySelector('#stock-autocomplete input') as HTMLInputElement;
        if (autocompleteInput) {
          autocompleteInput.focus();
          autocompleteInput.click(); // Trigger dropdown to open
        }
      }, 50);
      
    } else if (value && symbols.includes(value)) {
      // Clear input even if stock is already selected and keep dropdown open
      setSearchQuery('');
      setAutocompleteOpen(true);
    }
  };

  // Helper function for quick add buttons
  const handleQuickAdd = (symbol: string) => {
    if (!symbols.includes(symbol)) {
      setSymbols([...symbols, symbol]);
      setMinWeights({ ...minWeights, [symbol]: 0 });
      setMaxWeights({ ...maxWeights, [symbol]: 100 });
    }
  };

  const handleRemoveSymbol = (symbol: string) => {
    setSymbols(symbols.filter(s => s !== symbol));
    const newMinWeights = { ...minWeights };
    const newMaxWeights = { ...maxWeights };
    delete newMinWeights[symbol];
    delete newMaxWeights[symbol];
    setMinWeights(newMinWeights);
    setMaxWeights(newMaxWeights);
  };

  const handleOptimize = async () => {
    if (symbols.length < 2) {
      setError('Please select at least 2 symbols for optimization');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const request: OptimizationRequest = {
        symbols,
        optimization_type: method,
        risk_tolerance: riskTolerance,
        investment_amount: investmentAmount,
        lookback_period: 252, // 1 year of trading days
      };

      let optimizationResult: OptimizationResult;

      if (useConstraints) {
        // Note: Constraints are not fully implemented in backend yet
        // This will use the same endpoint but with constraint metadata
        optimizationResult = await apiService.optimizeWithConstraints({
          ...request,
          min_weights: minWeights,
          max_weights: maxWeights,
        });
      } else {
        optimizationResult = await apiService.optimizePortfolio(request);
      }

      setResult(optimizationResult);
      
      // Clear any previous errors
      setError('');
    } catch (err: any) {
      console.error('Optimization error:', err);
      setError(err.response?.data?.detail || 'Failed to optimize portfolio. Please check your selections and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePortfolio = async () => {
    if (!result) return;

    try {
      // Transform optimization result to get weights
      const weightsObj: Record<string, number> = {};
      result.symbols.forEach((symbol, index) => {
        weightsObj[symbol] = result.weights[index];
      });

      // Fetch current stock prices for accurate portfolio calculation
      const pricePromises = symbols.map(async (symbol) => {
        try {
          const data = await apiService.getStockData(symbol, '1d');
          if (data && data.length > 0) {
            return { symbol, price: data[data.length - 1].close };
          }
          return { symbol, price: 100 }; // Fallback price
        } catch (err) {
          console.warn(`Could not fetch price for ${symbol}, using fallback`);
          return { symbol, price: 100 }; // Fallback price
        }
      });

      const priceResults = await Promise.all(pricePromises);
      const priceMap: Record<string, number> = {};
      priceResults.forEach(({ symbol, price }) => {
        priceMap[symbol] = price;
      });

      const holdings = symbols.map(symbol => {
        const weight = weightsObj[symbol] || 0;
        // Filter out extremely small weights (likely rounding errors)
        if (weight < 0.001) return null;
        
        const currentPrice = priceMap[symbol] || 100;
        const allocation = weight * investmentAmount;
        const quantity = Math.floor(allocation / currentPrice);
        
        return {
          symbol,
          weight: Math.round(weight * 10000) / 10000, // Round to 4 decimal places
          quantity,
          avg_purchase_price: Math.round(currentPrice * 100) / 100 // Use real current market price
        };
      }).filter(Boolean) as PortfolioHoldingCreate[]; // Remove null entries

      // Enhanced portfolio description with optimization details
      const enhancedDescription = `${portfolioDescription}

Optimization Details:
- Method: ${method.replace('_', ' ').toUpperCase()}
- Risk Tolerance: ${riskTolerance.toUpperCase()}
- Investment Amount: ₹${investmentAmount.toLocaleString('en-IN')}
- Expected Return: ${(result.expected_return * 100).toFixed(2)}%
- Expected Volatility: ${(result.expected_volatility * 100).toFixed(2)}%
- Sharpe Ratio: ${result.sharpe_ratio.toFixed(3)}
- Constraints Applied: ${useConstraints ? 'Yes' : 'No'}
- Created: ${new Date().toLocaleDateString('en-IN')}`;

      const portfolioData: PortfolioCreate = {
        name: portfolioName,
        description: enhancedDescription,
        holdings,
        // Add optimization metadata
        optimization_method: method,
        risk_tolerance: riskTolerance,
        investment_amount: investmentAmount,
        expected_return: result.expected_return,
        expected_volatility: result.expected_volatility,
        sharpe_ratio: result.sharpe_ratio,
      };

      await apiService.createPortfolio(portfolioData);
      setSaveDialogOpen(false);
      setPortfolioName('');
      setPortfolioDescription('');
      
      // Show success feedback
      setError('');
      alert('Portfolio saved successfully!');
    } catch (err: any) {
      console.error('Save portfolio error:', err);
      setError(err.response?.data?.detail || 'Failed to save portfolio');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  // Transform optimization result to UI format
  const transformResultForUI = (result: OptimizationResult) => {
    const weightsObj: Record<string, number> = {};
    const allocationObj: Record<string, number> = {};
    
    result.symbols.forEach((symbol, index) => {
      weightsObj[symbol] = result.weights[index];
      allocationObj[symbol] = result.weights[index] * investmentAmount;
    });

    return {
      weights: weightsObj,
      allocation: allocationObj,
      expected_return: result.expected_return,
      volatility: result.expected_volatility,
      sharpe_ratio: result.sharpe_ratio,
    };
  };

  const uiResult = result ? transformResultForUI(result) : null;

  const pieData = uiResult ? Object.entries(uiResult.weights).map(([symbol, weight]) => ({
    name: symbol,
    value: weight * 100,
    amount: uiResult.allocation[symbol],
  })) : [];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Portfolio Optimization
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Create optimized portfolios using advanced algorithms
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Input Panel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Portfolio Configuration
              </Typography>

              {/* Stock Selection */}
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Select Stocks & ETFs
                </Typography>
                <Autocomplete
                  id="stock-autocomplete"
                  options={stockOptions}
                  loading={searchLoading}
                  value={undefined} // Always keep it empty after selection
                  inputValue={searchQuery}
                  open={autocompleteOpen}
                  onOpen={() => setAutocompleteOpen(true)}
                  onClose={() => setAutocompleteOpen(false)}
                  onInputChange={handleSearchInputChange}
                  onChange={handleAddSymbol}
                  disableClearable
                  selectOnFocus
                  clearOnBlur={false}
                  handleHomeEndKeys
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search & Add Stock Symbol"
                      placeholder="e.g., RELIANCE, TCS, GOLDBEES..."
                      onFocus={() => setAutocompleteOpen(true)}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  filterOptions={(options, { inputValue }) => {
                    // Filter out already selected stocks from dropdown
                    const filteredOptions = options.filter(option => !symbols.includes(option));
                    
                    // If no search query, show all available options (first 50 for performance)
                    if (!inputValue.trim()) {
                      return filteredOptions.slice(0, 50);
                    }
                    
                    // Otherwise return server-filtered results
                    return filteredOptions;
                  }}
                  freeSolo
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Click to browse or type to search from 500+ Indian stocks and ETFs. Input clears after selection for easy multi-selection.
                </Typography>
                
                {/* Quick Add Popular Categories */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Quick Add Popular:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => handleQuickAdd('RELIANCE.NS')}
                      disabled={symbols.includes('RELIANCE.NS')}
                    >
                      Reliance
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => handleQuickAdd('TCS.NS')}
                      disabled={symbols.includes('TCS.NS')}
                    >
                      TCS
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => handleQuickAdd('HDFCBANK.NS')}
                      disabled={symbols.includes('HDFCBANK.NS')}
                    >
                      HDFC Bank
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => handleQuickAdd('IDFCFIRSTB.NS')}
                      disabled={symbols.includes('IDFCFIRSTB.NS')}
                    >
                      IDFC First
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => handleQuickAdd('GOLDBEES.NS')}
                      disabled={symbols.includes('GOLDBEES.NS')}
                    >
                      Gold ETF
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => handleQuickAdd('NIFTYBEES.NS')}
                      disabled={symbols.includes('NIFTYBEES.NS')}
                    >
                      Nifty ETF
                    </Button>
                  </Box>
                </Box>
                <Box mt={2}>
                  {symbols.map((symbol) => (
                    <Chip
                      key={symbol}
                      label={symbol}
                      onDelete={() => handleRemoveSymbol(symbol)}
                      sx={{ mr: 1, mb: 1 }}
                      color="primary"
                      variant="outlined"
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
                  value={method}
                  label="Optimization Method"
                  onChange={(e) => setMethod(e.target.value as any)}
                >
                  <MenuItem value="mean_variance">Mean Variance (Markowitz optimization)</MenuItem>
                  <MenuItem value="risk_parity">Risk Parity (Equal risk contribution)</MenuItem>
                  <MenuItem value="black_litterman">Black-Litterman (Bayesian approach)</MenuItem>
                  <MenuItem value="minimum_variance">Minimum Variance (Lowest portfolio risk)</MenuItem>
                  <MenuItem value="monte_carlo">Monte Carlo Simulation (Random portfolio sampling)</MenuItem>
                </Select>
              </FormControl>

              {/* Method Description */}
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {method === 'mean_variance' && (
                    <>
                      <strong>Mean-Variance (Markowitz):</strong> Nobel Prize-winning approach that maximizes expected returns for a given level of risk. Uses historical data to find optimal balance between risk and return.
                    </>
                  )}
                  {method === 'risk_parity' && (
                    <>
                      <strong>Risk Parity:</strong> Allocates equal risk (not equal weight) to each asset. More stable and defensive approach, popular with institutional investors for long-term portfolios.
                    </>
                  )}
                  {method === 'black_litterman' && (
                    <>
                      <strong>Black-Litterman:</strong> Advanced Bayesian approach that starts with market equilibrium and incorporates your personal views. Reduces estimation errors of traditional optimization.
                    </>
                  )}
                  {method === 'minimum_variance' && (
                    <>
                      <strong>Minimum Variance:</strong> Ultra-conservative approach that focuses purely on minimizing portfolio risk, ignoring expected returns. Best for capital preservation during uncertain times.
                    </>
                  )}
                  {method === 'monte_carlo' && (
                    <>
                      <strong>Monte Carlo Simulation:</strong> Generates 10,000+ random portfolios and selects the best one based on your risk tolerance. Great for discovering optimal allocations through statistical sampling.
                    </>
                  )}
                </Typography>
              </Box>

              {/* Advanced Constraints */}
              <FormControlLabel
                control={
                  <Switch
                    checked={useConstraints}
                    onChange={(e) => setUseConstraints(e.target.checked)}
                  />
                }
                label="Use Weight Constraints"
                sx={{ mb: 2 }}
              />

              {useConstraints && symbols.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Weight Constraints (%)
                  </Typography>
                  {symbols.map((symbol) => (
                    <Box key={symbol} mb={2}>
                      <Typography variant="body2" gutterBottom>
                        {symbol}
                      </Typography>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={6}>
                          <TextField
                            label="Min %"
                            type="number"
                            size="small"
                            value={minWeights[symbol] || 0}
                            onChange={(e) => setMinWeights({
                              ...minWeights,
                              [symbol]: Number(e.target.value)
                            })}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Max %"
                            type="number"
                            size="small"
                            value={maxWeights[symbol] || 100}
                            onChange={(e) => setMaxWeights({
                              ...maxWeights,
                              [symbol]: Number(e.target.value)
                            })}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleOptimize}
                disabled={loading || symbols.length < 2}
                startIcon={loading ? <CircularProgress size={20} /> : <TrendingUp />}
              >
                {loading ? 'Optimizing...' : 'Optimize Portfolio'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Panel */}
        <Grid item xs={12} md={6}>
          {uiResult ? (
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Optimization Results
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Save />}
                    onClick={() => setSaveDialogOpen(true)}
                  >
                    Save Portfolio
                  </Button>
                </Box>

                {/* Key Metrics */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Expected Return
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatPercentage(uiResult.expected_return)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Volatility
                      </Typography>
                      <Typography variant="h6" color="error">
                        {formatPercentage(uiResult.volatility)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Sharpe Ratio
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {uiResult.sharpe_ratio.toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Monte Carlo Specific Information */}
                {method === 'monte_carlo' && result?.num_simulations && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="info.contrastText">
                      <strong>Monte Carlo Analysis:</strong> Selected best portfolio from {result.num_simulations.toLocaleString()} random simulations based on your {result.risk_tolerance} risk tolerance.
                    </Typography>
                  </Box>
                )}

                {/* Allocation Chart */}
                <Box mb={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Asset Allocation
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${(value || 0).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#3498DB"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                {/* Allocation Table */}
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Symbol</TableCell>
                        <TableCell align="right">Weight</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(uiResult.weights).map(([symbol, weight]) => (
                        <TableRow key={symbol}>
                          <TableCell>{symbol}</TableCell>
                          <TableCell align="right">{formatPercentage(weight)}</TableCell>
                          <TableCell align="right">{formatCurrency(uiResult.allocation[symbol])}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Box textAlign="center" py={8}>
                  <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Configure Your Portfolio
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select stocks and optimization parameters to see results here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Save Portfolio Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Portfolio</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Portfolio Name"
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description (Optional)"
            multiline
            rows={3}
            value={portfolioDescription}
            onChange={(e) => setPortfolioDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSavePortfolio}
            variant="contained"
            disabled={!portfolioName}
          >
            Save Portfolio
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OptimizationPage;
