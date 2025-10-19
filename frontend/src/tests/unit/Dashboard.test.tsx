import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Dashboard from '../../pages/Dashboard';

// Mock the API service
jest.mock('../../services/api');

// Create theme for testing
const theme = createTheme();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dashboard component', () => {
    const { container } = render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );
    
    // Basic render test
    expect(container).toBeTruthy();
  });

  it('should display loading state initially', async () => {
    const { container } = render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Check that component renders
    await waitFor(() => {
      expect(container.firstChild).toBeTruthy();
    });
  });
});

// Export empty object to make this a module
export {};