import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme/theme';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import EnhancedDashboard from './pages/EnhancedDashboard';
import OptimizationPage from './pages/OptimizationPage';
import PortfolioManagementPage from './pages/PortfolioManagementPage';
import RiskAnalysisPage from './pages/RiskAnalysisPage';
import BacktestingPage from './pages/BacktestingPage';
import MarketDataPage from './pages/MarketDataPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Routes with Layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EnhancedDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/optimize"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OptimizationPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolios"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PortfolioManagementPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/risk-analysis"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RiskAnalysisPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/backtest"
              element={
                <ProtectedRoute>
                  <Layout>
                    <BacktestingPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/market-data"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MarketDataPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AnalyticsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SettingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Redirect routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
