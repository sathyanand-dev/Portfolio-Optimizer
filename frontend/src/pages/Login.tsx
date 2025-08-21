import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  TrendingUp,
  ShowChart,
  Analytics,
  Security,
  Speed,
  AccountBalance,
  Email,
  Lock,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Stock market animation component
const StockTicker: React.FC = () => {
  const stocks = [
    { symbol: 'RELIANCE', price: '2,487.50', change: '+2.35%', positive: true },
    { symbol: 'TCS', price: '3,256.80', change: '+1.87%', positive: true },
    { symbol: 'HDFCBANK', price: '1,689.45', change: '-0.45%', positive: false },
    { symbol: 'INFY', price: '1,487.90', change: '+3.21%', positive: true },
    { symbol: 'ITC', price: '456.75', change: '+0.89%', positive: true },
  ];

  return (
    <Box 
      sx={{ 
        overflow: 'hidden',
        bgcolor: '#2C3E50',
        color: 'white',
        py: 1,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(52, 152, 219, 0.1), transparent)',
          animation: 'shimmer 3s infinite',
        },
        '@keyframes shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      }}
    >
      <Box 
        sx={{ 
          display: 'flex',
          animation: 'scroll 30s linear infinite',
          '@keyframes scroll': {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(-100%)' },
          },
        }}
      >
        {stocks.concat(stocks).map((stock, index) => (
          <Box 
            key={index}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              minWidth: 200,
              px: 3,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
              {stock.symbol}
            </Typography>
            <Typography variant="body2" sx={{ mr: 1 }}>
              ₹{stock.price}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: stock.positive ? '#27AE60' : '#E74C3C',
                fontWeight: 500,
              }}
            >
              {stock.change}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const features = [
    {
      icon: <Analytics sx={{ fontSize: 32, color: theme.palette.primary.main }} />,
      title: 'Advanced Analytics',
      description: 'AI-powered portfolio insights and risk analysis'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 32, color: theme.palette.success.main }} />,
      title: 'Smart Optimization',
      description: 'Multiple optimization strategies for maximum returns'
    },
    {
      icon: <Security sx={{ fontSize: 32, color: theme.palette.secondary.main }} />,
      title: 'Enterprise Security',
      description: 'Bank-grade security for your financial data'
    },
    {
      icon: <Speed sx={{ fontSize: 32, color: theme.palette.warning.main }} />,
      title: 'Real-time Data',
      description: 'Live market data and instant portfolio updates'
    },
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Animated Stock Ticker */}
      <StockTicker />
      
      <Container maxWidth="xl" sx={{ flex: 1, display: 'flex', alignItems: 'center', py: 4 }}>
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          {/* Left Side - Branding and Features */}
          <Grid item xs={12} md={6} lg={5}>
            <Box sx={{ textAlign: isMobile ? 'center' : 'left', mb: 4 }}>
              {/* Logo and Brand */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <AccountBalance sx={{ fontSize: 48, color: theme.palette.primary.light, mr: 2 }} />
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    color: 'white',
                    background: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Portfolio Pro
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: theme.palette.grey[300], fontWeight: 500 }}>
                    Indian Stock Market Optimizer
                  </Typography>
                </Box>
              </Box>

              {/* Hero Text */}
              <Typography variant="h4" sx={{ 
                color: 'white', 
                fontWeight: 600, 
                mb: 2,
                lineHeight: 1.2,
              }}>
                Optimize Your Portfolio with
                <Box component="span" sx={{ 
                  color: theme.palette.primary.light,
                  display: 'block'
                }}>
                  AI-Powered Insights
                </Box>
              </Typography>
              
              <Typography variant="h6" sx={{ 
                color: theme.palette.grey[300], 
                mb: 4,
                lineHeight: 1.5,
              }}>
                Advanced portfolio optimization for the Indian stock market. 
                Make smarter investment decisions with real-time analytics.
              </Typography>

              {/* Key Features */}
              <Grid container spacing={2}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                      }
                    }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {feature.icon}
                          <Typography variant="subtitle2" sx={{ 
                            color: 'white', 
                            fontWeight: 600, 
                            ml: 1 
                          }}>
                            {feature.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ 
                          color: theme.palette.grey[300],
                          fontSize: '0.85rem',
                          lineHeight: 1.4,
                        }}>
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Market Stats */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: theme.palette.primary.light, fontWeight: 700 }}>
                    50+
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.grey[400] }}>
                    Optimization Models
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                    5000+
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.grey[400] }}>
                    NSE Stocks
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: theme.palette.secondary.light, fontWeight: 700 }}>
                    99.9%
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.grey[400] }}>
                    Uptime
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper 
              elevation={24} 
              sx={{ 
                p: 4,
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <ShowChart sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  Welcome Back
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                  Sign in to access your portfolio
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }}>
                <Chip 
                  label="Secure Login" 
                  size="small" 
                  sx={{ 
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    fontWeight: 600,
                  }} 
                />
              </Divider>

              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  name="username"
                  label="User Name"
                  type="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 8px ${theme.palette.primary.main}30`,
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: theme.palette.primary.main }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 8px ${theme.palette.primary.main}30`,
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: `0 4px 15px ${theme.palette.primary.main}40`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px ${theme.palette.primary.main}50`,
                    },
                    '&:disabled': {
                      background: theme.palette.grey[300],
                      color: theme.palette.grey[600],
                    },
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Don't have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/register"
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Sign up here
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;
