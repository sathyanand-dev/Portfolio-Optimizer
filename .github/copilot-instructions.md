# Copilot Instructions for Indian Stock Portfolio Optimizer

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a FastAPI backend for an Indian stock market portfolio optimizer. When working on this project, please follow these guidelines:

## Project Context
- Focus on Indian stock market (NSE/BSE symbols ending in .NS/.BO)
- Use yfinance for data fetching
- Implement advanced portfolio optimization models (Black-Litterman, Risk Parity, Mean-Variance)
- Support Indian market specifics (gold/silver ETFs, sector allocation)
- All monetary values are in INR unless specified otherwise

## Code Style Guidelines
- Use async/await patterns where appropriate
- Follow FastAPI best practices for API design
- Implement proper error handling and validation
- Use Pydantic models for request/response validation
- Include comprehensive docstrings
- Maintain clean separation between services, models, and API layers

## Indian Market Specifics
- Default to .NS suffix for Indian stocks
- Popular symbols: RELIANCE.NS, TCS.NS, HDFCBANK.NS, etc.
- Include gold (GOLDBEES.NS) and silver (SILVERBEES.NS) ETFs
- Use ^NSEI (Nifty 50) and ^BSESN (Sensex) as benchmark indices
- Consider Indian trading hours (9:15 AM - 3:30 PM IST)
- Use 7% as default risk-free rate (Indian government bonds)

## Portfolio Optimization
- Implement multiple optimization methods: Black-Litterman, Risk Parity, Mean-Variance, Minimum Variance
- Consider risk tolerance levels: Conservative, Moderate, Aggressive
- Include sector-wise diversification for Indian market
- Support asset allocation suggestions (equity/gold/silver/cash)

## Data Handling
- Cache market data for 15 minutes to reduce API calls
- Handle missing data gracefully
- Implement proper error handling for API failures
- Support historical data analysis with sufficient lookback periods

## Authentication & Security
- Use JWT tokens for authentication
- Implement proper password hashing
- Protect sensitive endpoints with authentication
- Support user preferences and portfolio persistence

## API Design
- Follow RESTful conventions
- Use appropriate HTTP status codes
- Provide clear error messages
- Include comprehensive API documentation
- Support pagination where appropriate

## Testing Considerations
- Mock external API calls in tests
- Test edge cases (missing data, API failures)
- Validate portfolio optimization results
- Test authentication flows

## Performance
- Optimize database queries
- Implement caching strategies
- Handle concurrent requests efficiently
- Monitor API response times

Remember to maintain backwards compatibility and provide clear migration paths when making schema changes.
