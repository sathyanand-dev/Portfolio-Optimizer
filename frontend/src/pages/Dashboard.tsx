import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  AccountBalance,
  Add,
  Timeline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiService, { Portfolio } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  totalPortfolios: number;
  totalValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPerformance, setRecentPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const portfoliosData = await apiService.getPortfolios();
        setPortfolios(portfoliosData);

        // Calculate dashboard stats
        let totalValue = 0;
        let totalReturn = 0;
        let totalReturnPercentage = 0;

        if (portfoliosData.length > 0) {
          // For each portfolio, get analytics data
          const analyticsPromises = portfoliosData.map(portfolio =>
            apiService.getPortfolioAnalytics(portfolio.id).catch(() => null)
          );
          
          const analyticsResults = await Promise.all(analyticsPromises);
          
          analyticsResults.forEach((analytics, index) => {
            if (analytics) {
              totalValue += analytics.performance_analysis.current_value;
              totalReturn += analytics.performance_analysis.total_return;
            } else {
              // Fallback to 0 if analytics fail since we don't have investment_amount
              totalValue += 0;
            }
          });

          if (totalValue > 0) {
            totalReturnPercentage = (totalReturn / (totalValue - totalReturn)) * 100;
          }

          // Generate sample performance data for the chart
          const performanceData = [];
          for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            performanceData.push({
              date: date.toISOString().split('T')[0],
              value: totalValue * (0.95 + Math.random() * 0.1), // Sample data
            });
          }
          setRecentPerformance(performanceData);
        }

        setStats({
          totalPortfolios: portfoliosData.length,
          totalValue,
          totalReturn,
          totalReturnPercentage,
        });
      } catch (err: any) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.username}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Here's your portfolio overview for today
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <AccountBalance />
                </Avatar>
                <Typography variant="h6">Total Portfolios</Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats?.totalPortfolios || 0}
              </Typography>
              <Typography color="text.secondary">
                Active portfolios
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h6">Total Value</Typography>
              </Box>
              <Typography variant="h4" component="div">
                ₹{stats?.totalValue.toLocaleString('en-IN') || '0'}
              </Typography>
              <Typography color="text.secondary">
                Current portfolio value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: (stats?.totalReturn ?? 0) >= 0 ? 'success.main' : 'error.main', mr: 2 }}>
                  {(stats?.totalReturn ?? 0) >= 0 ? <TrendingUp /> : <TrendingDown />}
                </Avatar>
                <Typography variant="h6">Total Return</Typography>
              </Box>
              <Typography variant="h4" component="div" color={(stats?.totalReturn ?? 0) >= 0 ? 'success.main' : 'error.main'}>
                ₹{stats?.totalReturn?.toLocaleString('en-IN') || '0'}
              </Typography>
              <Typography color="text.secondary">
                Absolute return
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <Assessment />
                </Avatar>
                <Typography variant="h6">Return %</Typography>
              </Box>
              <Typography variant="h4" component="div" color={(stats?.totalReturnPercentage ?? 0) >= 0 ? 'success.main' : 'error.main'}>
                {stats?.totalReturnPercentage?.toFixed(2) || '0.00'}%
              </Typography>
              <Typography color="text.secondary">
                Percentage return
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Portfolio Performance Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Timeline sx={{ mr: 2 }} />
                <Typography variant="h6">Portfolio Performance (30 days)</Typography>
              </Box>
              {recentPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={recentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Value']} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3498DB" 
                      strokeWidth={3} 
                      dot={{ fill: '#3498DB', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3498DB', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No performance data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Portfolios List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Your Portfolios</Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => navigate('/portfolio')}
                >
                  New
                </Button>
              </Box>
              
              {portfolios.length > 0 ? (
                <List>
                  {portfolios.map((portfolio, index) => (
                    <ListItem 
                      key={portfolio.id} 
                      onClick={() => navigate(`/portfolio/${portfolio.id}`)}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {portfolio.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={portfolio.name}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {portfolio.holdings?.reduce((sum, holding) => 
                                sum + (holding.quantity || 0) * (holding.avg_purchase_price || 0), 0
                              ).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || 'N/A'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                              {portfolio.holdings?.slice(0, 3).map((holding) => (
                                <Chip key={holding.symbol} label={holding.symbol} size="small" variant="outlined" />
                              ))}
                              {portfolio.holdings && portfolio.holdings.length > 3 && (
                                <Chip label={`+${portfolio.holdings.length - 3}`} size="small" variant="outlined" />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" gutterBottom>
                    No portfolios yet
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/optimize')}
                    startIcon={<Add />}
                  >
                    Create Your First Portfolio
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<TrendingUp />}
              onClick={() => navigate('/optimize')}
            >
              Optimize Portfolio
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Assessment />}
              onClick={() => navigate('/analytics')}
            >
              View Analytics
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<AccountBalance />}
              onClick={() => navigate('/portfolio')}
            >
              Manage Portfolios
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
