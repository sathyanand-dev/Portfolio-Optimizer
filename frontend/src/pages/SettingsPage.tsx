import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  RestoreFromTrash as ResetIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as ThemeIcon,
  AccountCircle as ProfileIcon,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface UserSettings {
  // Profile Settings
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Trading Preferences
  defaultRiskTolerance: 'conservative' | 'moderate' | 'aggressive';
  defaultInvestmentHorizon: '1y' | '3y' | '5y' | '10y' | 'long_term';
  defaultCurrency: 'INR' | 'USD' | 'EUR';
  
  // Notification Settings
  emailNotifications: boolean;
  portfolioAlerts: boolean;
  marketNewsAlerts: boolean;
  performanceReports: boolean;
  
  // Display Preferences
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'hi';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  numberFormat: 'indian' | 'international';
  
  // Advanced Settings
  dataRetentionPeriod: '1y' | '3y' | '5y' | 'forever';
  analyticsOptIn: boolean;
  betaFeatures: boolean;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    defaultRiskTolerance: 'moderate',
    defaultInvestmentHorizon: '5y',
    defaultCurrency: 'INR',
    emailNotifications: true,
    portfolioAlerts: true,
    marketNewsAlerts: false,
    performanceReports: true,
    theme: 'light',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'indian',
    dataRetentionPeriod: '5y',
    analyticsOptIn: true,
    betaFeatures: false,
  });

  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    trading: false,
    notifications: false,
    display: false,
    security: false,
    advanced: false,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    // In a real app, this would load from the backend
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSave = async () => {
    try {
      // In a real app, this would save to the backend
      localStorage.setItem('userSettings', JSON.stringify(settings));
      setShowSuccess(true);
    } catch (error) {
      setErrorMessage('Failed to save settings');
      setShowError(true);
    }
  };

  const handleReset = () => {
    setSettings({
      firstName: '',
      lastName: '',
      email: user?.email || '',
      phone: '',
      defaultRiskTolerance: 'moderate',
      defaultInvestmentHorizon: '5y',
      defaultCurrency: 'INR',
      emailNotifications: true,
      portfolioAlerts: true,
      marketNewsAlerts: false,
      performanceReports: true,
      theme: 'light',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'indian',
      dataRetentionPeriod: '5y',
      analyticsOptIn: true,
      betaFeatures: false,
    });
    localStorage.removeItem('userSettings');
    setShowResetDialog(false);
    setShowSuccess(true);
  };

  const handleDeleteAccount = () => {
    // In a real app, this would call the backend to delete the account
    console.log('Account deletion requested');
    setShowDeleteDialog(false);
    // Would typically logout and redirect
  };

  const SectionCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    sectionKey: keyof typeof expandedSections;
    children: React.ReactNode;
  }> = ({ title, icon, sectionKey, children }) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            onClick={() => toggleSection(sectionKey)}
            sx={{ cursor: 'pointer', mb: isExpanded ? 2 : 0 }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              {icon}
              <Typography variant="h6">{title}</Typography>
            </Box>
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </Box>
          {isExpanded && (
            <>
              <Divider sx={{ mb: 2 }} />
              {children}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon />
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          {/* Profile Settings */}
          <SectionCard title="Profile Information" icon={<ProfileIcon />} sectionKey="profile">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={settings.firstName}
                  onChange={(e) => handleSettingChange('firstName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={settings.lastName}
                  onChange={(e) => handleSettingChange('lastName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={settings.phone}
                  onChange={(e) => handleSettingChange('phone', e.target.value)}
                />
              </Grid>
            </Grid>
          </SectionCard>

          {/* Trading Preferences */}
          <SectionCard title="Trading Preferences" icon={<SettingsIcon />} sectionKey="trading">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Default Risk Tolerance</InputLabel>
                  <Select
                    value={settings.defaultRiskTolerance}
                    onChange={(e) => handleSettingChange('defaultRiskTolerance', e.target.value)}
                    label="Default Risk Tolerance"
                  >
                    <MenuItem value="conservative">Conservative</MenuItem>
                    <MenuItem value="moderate">Moderate</MenuItem>
                    <MenuItem value="aggressive">Aggressive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Investment Horizon</InputLabel>
                  <Select
                    value={settings.defaultInvestmentHorizon}
                    onChange={(e) => handleSettingChange('defaultInvestmentHorizon', e.target.value)}
                    label="Investment Horizon"
                  >
                    <MenuItem value="1y">1 Year</MenuItem>
                    <MenuItem value="3y">3 Years</MenuItem>
                    <MenuItem value="5y">5 Years</MenuItem>
                    <MenuItem value="10y">10 Years</MenuItem>
                    <MenuItem value="long_term">Long Term (15+ years)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Default Currency</InputLabel>
                  <Select
                    value={settings.defaultCurrency}
                    onChange={(e) => handleSettingChange('defaultCurrency', e.target.value)}
                    label="Default Currency"
                  >
                    <MenuItem value="INR">Indian Rupee (₹)</MenuItem>
                    <MenuItem value="USD">US Dollar ($)</MenuItem>
                    <MenuItem value="EUR">Euro (€)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </SectionCard>

          {/* Notification Settings */}
          <SectionCard title="Notifications" icon={<NotificationsIcon />} sectionKey="notifications">
            <List>
              <ListItem>
                <ListItemText 
                  primary="Email Notifications" 
                  secondary="Receive general notifications via email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Portfolio Alerts" 
                  secondary="Get notified about significant portfolio changes"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.portfolioAlerts}
                    onChange={(e) => handleSettingChange('portfolioAlerts', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Market News Alerts" 
                  secondary="Receive updates about market news and events"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.marketNewsAlerts}
                    onChange={(e) => handleSettingChange('marketNewsAlerts', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Performance Reports" 
                  secondary="Weekly and monthly portfolio performance reports"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.performanceReports}
                    onChange={(e) => handleSettingChange('performanceReports', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </SectionCard>

          {/* Display Preferences */}
          <SectionCard title="Display Preferences" icon={<ThemeIcon />} sectionKey="display">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    label="Theme"
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    label="Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="hi">हिंदी</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={settings.dateFormat}
                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                    label="Date Format"
                  >
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Number Format</InputLabel>
                  <Select
                    value={settings.numberFormat}
                    onChange={(e) => handleSettingChange('numberFormat', e.target.value)}
                    label="Number Format"
                  >
                    <MenuItem value="indian">Indian (1,00,000)</MenuItem>
                    <MenuItem value="international">International (100,000)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </SectionCard>

          {/* Security Settings */}
          <SectionCard title="Security & Privacy" icon={<SecurityIcon />} sectionKey="security">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button variant="outlined" color="primary" sx={{ mr: 2, mb: 1 }}>
                  Change Password
                </Button>
                <Button variant="outlined" color="primary" sx={{ mr: 2, mb: 1 }}>
                  Enable Two-Factor Authentication
                </Button>
                <Button variant="outlined" color="primary" sx={{ mb: 1 }}>
                  Download My Data
                </Button>
              </Grid>
            </Grid>
          </SectionCard>

          {/* Advanced Settings */}
          <SectionCard title="Advanced Settings" icon={<SettingsIcon />} sectionKey="advanced">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Data Retention Period</InputLabel>
                  <Select
                    value={settings.dataRetentionPeriod}
                    onChange={(e) => handleSettingChange('dataRetentionPeriod', e.target.value)}
                    label="Data Retention Period"
                  >
                    <MenuItem value="1y">1 Year</MenuItem>
                    <MenuItem value="3y">3 Years</MenuItem>
                    <MenuItem value="5y">5 Years</MenuItem>
                    <MenuItem value="forever">Forever</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.analyticsOptIn}
                      onChange={(e) => handleSettingChange('analyticsOptIn', e.target.checked)}
                    />
                  }
                  label="Allow usage analytics to improve the service"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.betaFeatures}
                      onChange={(e) => handleSettingChange('betaFeatures', e.target.checked)}
                    />
                  }
                  label="Enable beta features (experimental)"
                />
              </Grid>
            </Grid>
          </SectionCard>

          {/* Action Buttons */}
          <Card>
            <CardContent>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  Save Settings
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ResetIcon />}
                  onClick={() => setShowResetDialog(true)}
                >
                  Reset to Defaults
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Account
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Settings saved successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
      >
        <Alert severity="error" onClose={() => setShowError(false)}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
        <DialogTitle>Reset Settings</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all settings to their default values? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>Cancel</Button>
          <Button onClick={handleReset} color="error" autoFocus>
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Warning:</strong> This action is irreversible!
            </Typography>
          </Alert>
          <Typography>
            Are you sure you want to permanently delete your account? 
            All your portfolios, settings, and data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" autoFocus>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
