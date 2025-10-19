// API mocks for testing
export const mockApiResponse = {
  success: true,
  data: {}
};

// Mock API functions - Jest will be available in test environment
export const mockGetStockData = () => Promise.resolve({
  symbol: 'TEST.NS',
  price: 100,
  change: 5,
  changePercent: 5.0
});

export const mockGetPortfolios = () => Promise.resolve([]);

export const mockGetMarketOverview = () => Promise.resolve({
  indices: []
});

// Export empty object to make this a module
export {};