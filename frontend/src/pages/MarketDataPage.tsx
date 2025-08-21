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
  Autocomplete,
  Tabs,
  Tab,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Search,
  Refresh,
  TrendingUp,
  TrendingDown,
  Add,
  Remove,
  Timeline,
  ShowChart,
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
} from 'recharts';
import apiService, { StockData } from '../services/api';

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
      id={`market-tabpanel-${index}`}
      aria-labelledby={`market-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Popular Indian stocks and indices
const POPULAR_STOCKS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
  { symbol: 'INFY.NS', name: 'Infosys' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
  { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
  { symbol: 'ITC.NS', name: 'ITC Limited' },
  { symbol: 'SBIN.NS', name: 'State Bank of India' },
];

const INDICES = [
  { symbol: '^NSEI', name: 'Nifty 50' },
  { symbol: '^BSESN', name: 'BSE Sensex' },
  { symbol: '^NSEBANK', name: 'Bank Nifty' },
  { symbol: '^CNXIT', name: 'Nifty IT' },
  { symbol: '^CNXAUTO', name: 'Nifty Auto' },
];

const MarketDataPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS']);
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE.NS');
  const [period, setPeriod] = useState('1y');
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [multipleStockData, setMultipleStockData] = useState<Record<string, StockData[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedSymbol) {
      fetchStockData(selectedSymbol, period);
    }
  }, [selectedSymbol, period]);

  useEffect(() => {
    if (watchlist.length > 0) {
      fetchMultipleStockData();
    }
  }, [watchlist]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const results = await apiService.searchSymbols(searchQuery);
      setSearchResults(results);
    } catch (err: any) {
      setError('Failed to search symbols');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockData = async (symbol: string, timePeriod: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getStockData(symbol, timePeriod);
      setStockData(data); // API service now guarantees this is an array
    } catch (err: any) {
      setError(`Failed to fetch data for ${symbol}`);
      setStockData([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchMultipleStockData = async () => {
    try {
      const data = await apiService.getMultipleStockData(watchlist, '5d');
      setMultipleStockData(data);
    } catch (err: any) {
      setError('Failed to fetch watchlist data');
    }
  };

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 10000000) {
      return `${(volume / 10000000).toFixed(1)}Cr`;
    } else if (volume >= 100000) {
      return `${(volume / 100000).toFixed(1)}L`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const calculateChange = (data: StockData[]) => {
    if (data.length < 2) return { change: 0, changePercent: 0 };
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    const change = latest.close - previous.close;
    const changePercent = (change / previous.close) * 100;
    return { change, changePercent };
  };

  // Prepare chart data
  const chartData = Array.isArray(stockData) ? stockData.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    dateObj: new Date(item.date),
    close: item.close,
    open: item.open,
    high: item.high,
    low: item.low,
    volume: item.volume,
  })).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()) : [];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Market Data
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Real-time stock data and market analysis
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Stock Analysis" />
            <Tab label="Watchlist" />
            <Tab label="Market Overview" />
            <Tab label="Search" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Stock Analysis */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box mb={3}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Stock</InputLabel>
                  <Select
                    value={selectedSymbol}
                    label="Select Stock"
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                  >
                    {POPULAR_STOCKS.map((stock) => (
                      <MenuItem key={stock.symbol} value={stock.symbol}>
                        {stock.name} ({stock.symbol})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Time Period</InputLabel>
                  <Select
                    value={period}
                    label="Time Period"
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <MenuItem value="1d">1 Day</MenuItem>
                    <MenuItem value="5d">5 Days</MenuItem>
                    <MenuItem value="1mo">1 Month</MenuItem>
                    <MenuItem value="3mo">3 Months</MenuItem>
                    <MenuItem value="6mo">6 Months</MenuItem>
                    <MenuItem value="1y">1 Year</MenuItem>
                    <MenuItem value="2y">2 Years</MenuItem>
                    <MenuItem value="5y">5 Years</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => addToWatchlist(selectedSymbol)}
                  startIcon={<Add />}
                  disabled={watchlist.includes(selectedSymbol)}
                >
                  {watchlist.includes(selectedSymbol) ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>
              </Box>

              {/* Stock Summary */}
              {Array.isArray(stockData) && stockData.length > 0 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {selectedSymbol}
                  </Typography>
                  <Typography variant="h4" gutterBottom>
                    {formatCurrency(stockData[stockData.length - 1]?.close || 0)}
                  </Typography>
                  {(() => {
                    const { change, changePercent } = Array.isArray(stockData) ? 
                      calculateChange(stockData) : { change: 0, changePercent: 0 };
                    return (
                      <Box display="flex" alignItems="center" mb={2}>
                        {change >= 0 ? (
                          <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                        ) : (
                          <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                        )}
                        <Typography
                          variant="body1"
                          sx={{ color: change >= 0 ? 'success.main' : 'error.main' }}
                        >
                          {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
                        </Typography>
                      </Box>
                    );
                  })()}
                  
                  <Typography variant="body2" color="text.secondary">
                    Volume: {formatVolume(stockData[stockData.length - 1]?.volume || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High: {formatCurrency(stockData[stockData.length - 1]?.high || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low: {formatCurrency(stockData[stockData.length - 1]?.low || 0)}
                  </Typography>
                </Paper>
              )}
            </Grid>

            <Grid item xs={12} md={8}>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                  <CircularProgress />
                </Box>
              ) : (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Price Chart - {selectedSymbol}
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        domain={['dataMin - 10', 'dataMax + 10']}
                        tickFormatter={(value) => `₹${value.toFixed(0)}`}
                      />
                      <Tooltip 
                        formatter={(value: any) => [formatCurrency(value), 'Price']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="close"
                        stroke="#3498DB"
                        fill="#3498DB"
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Watchlist */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Your Watchlist
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchMultipleStockData}
              sx={{ mb: 2 }}
            >
              Refresh Data
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Change</TableCell>
                  <TableCell align="right">Change %</TableCell>
                  <TableCell align="right">Volume</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {watchlist.map((symbol) => {
                  const data = multipleStockData[symbol] || [];
                  const latest = data[data.length - 1];
                  const { change, changePercent } = calculateChange(data);

                  return (
                    <TableRow key={symbol}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {symbol}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {latest ? formatCurrency(latest.close) : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{ color: change >= 0 ? 'success.main' : 'error.main' }}
                        >
                          {change >= 0 ? '+' : ''}{change.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`}
                          color={changePercent >= 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {latest ? formatVolume(latest.volume) : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => removeFromWatchlist(symbol)}
                          color="error"
                        >
                          <Remove />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {watchlist.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                Your watchlist is empty. Add stocks from the Stock Analysis tab.
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Market Overview */}
          <Typography variant="h6" gutterBottom>
            Indian Market Indices
          </Typography>
          
          <Grid container spacing={3}>
            {INDICES.map((index) => (
              <Grid item xs={12} sm={6} md={4} key={index.symbol}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {index.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {index.symbol}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Button
                        size="small"
                        startIcon={<ShowChart />}
                        onClick={() => {
                          setSelectedSymbol(index.symbol);
                          setTabValue(0);
                        }}
                      >
                        View Chart
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Add />}
                        onClick={() => addToWatchlist(index.symbol)}
                        disabled={watchlist.includes(index.symbol)}
                      >
                        Watch
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Popular Stocks
            </Typography>
            <Grid container spacing={2}>
              {POPULAR_STOCKS.map((stock) => (
                <Grid item xs={12} sm={6} md={4} key={stock.symbol}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {stock.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {stock.symbol}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Button
                          size="small"
                          startIcon={<ShowChart />}
                          onClick={() => {
                            setSelectedSymbol(stock.symbol);
                            setTabValue(0);
                          }}
                        >
                          Analyze
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Add />}
                          onClick={() => addToWatchlist(stock.symbol)}
                          disabled={watchlist.includes(stock.symbol)}
                        >
                          Watch
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Search */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Search Stocks
            </Typography>
            <Box display="flex" gap={2} mb={3}>
              <TextField
                fullWidth
                label="Search for stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., Reliance, TCS, HDFC"
              />
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleSearch}
                disabled={loading}
              >
                Search
              </Button>
            </Box>
          </Box>

          {searchResults.length > 0 && (
            <Paper>
              <List>
                {searchResults.map((symbol, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={symbol}
                      secondary="Stock Symbol"
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedSymbol(symbol);
                          setTabValue(0);
                        }}
                        startIcon={<ShowChart />}
                      >
                        Analyze
                      </Button>
                      <IconButton
                        edge="end"
                        onClick={() => addToWatchlist(symbol)}
                        disabled={watchlist.includes(symbol)}
                      >
                        <Add />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {searchResults.length === 0 && searchQuery && (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                No results found for "{searchQuery}". Try searching with stock symbols or company names.
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Card>
    </Box>
  );
};

export default MarketDataPage;
