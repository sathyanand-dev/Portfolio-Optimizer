import React from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  TrendingUp as OptimizeIcon,
  Analytics as AnalyticsIcon,
  Assessment as BacktestIcon,
  AccountBalance as PortfolioIcon,
  DataObject as DataIcon,
  Security as RiskIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  NotificationsNone as NotificationIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Portfolio Optimize', icon: <OptimizeIcon />, path: '/optimize' },
    { text: 'My Portfolios', icon: <PortfolioIcon />, path: '/portfolios' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'Risk Analysis', icon: <RiskIcon />, path: '/risk-analysis' },
    { text: 'Backtesting', icon: <BacktestIcon />, path: '/backtest' },
    { text: 'Market Data', icon: <DataIcon />, path: '/market-data' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar 
        sx={{ 
          background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
          color: 'white',
          minHeight: '80px !important',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)',fontWeight: 700, fontSize: '1.1rem' }}>
            Portfolio Pro
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
            Advanced Analytics
          </Typography>
        </Box>
      </Toolbar>
      
      <Box sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1.5, bgcolor: '#F4F6F8', borderRadius: 2 }}>
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: '#3498DB',
              mr: 1.5,
              fontSize: '0.9rem'
            }}
          >
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2C3E50' }}>
              {user?.email?.split('@')[0] || 'User'}
            </Typography>
            <Chip 
              label="Pro User" 
              size="small" 
              sx={{ 
                height: 18, 
                fontSize: '0.65rem',
                bgcolor: '#E8F5E8',
                color: '#27AE60',
                fontWeight: 500
              }} 
            />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mx: 2 }} />
      
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&.Mui-selected': {
                  bgcolor: '#E3F2FD',
                  '&:hover': {
                    bgcolor: '#E3F2FD',
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#3498DB',
                  },
                  '& .MuiListItemText-primary': {
                    color: '#2C3E50',
                    fontWeight: 600,
                  },
                },
                '&:hover': {
                  bgcolor: '#F8F9FA',
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 40,
                  color: location.pathname === item.path ? '#3498DB' : '#5D6D7E'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: location.pathname === item.path ? 600 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ mx: 2 }} />
      
      <Box sx={{ p: 2 }}>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              bgcolor: '#FEF2F2',
              '&:hover': {
                bgcolor: '#FEE2E2',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: '#E74C3C' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#E74C3C'
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: '#2C3E50',
          boxShadow: '0 2px 8px rgba(44, 62, 80, 0.08)',
          borderBottom: '1px solid #E5E8EC',
        }}
      >
        <Toolbar sx={{ minHeight: '70px !important' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h6" 
              noWrap 
              component="div"
              sx={{ 
                fontWeight: 700,
                fontSize: '1.25rem',
                background: 'linear-gradient(135deg, #2C3E50 0%, #3498DB 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Indian Stock Portfolio Optimizer
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label="LIVE" 
              size="small" 
              sx={{ 
                bgcolor: '#E8F5E8',
                color: '#27AE60',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 24,
              }}
            />
            <IconButton 
              sx={{ 
                color: '#5D6D7E',
                '&:hover': { bgcolor: '#F4F6F8' }
              }}
            >
              <NotificationIcon />
            </IconButton>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: '#3498DB',
                fontSize: '0.8rem'
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '4px 0 12px rgba(44, 62, 80, 0.1)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '2px 0 8px rgba(44, 62, 80, 0.08)',
              borderRight: '1px solid #E5E8EC',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
