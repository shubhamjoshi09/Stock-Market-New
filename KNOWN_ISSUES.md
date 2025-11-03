# Known Issues

## Trading System

### Trade Placement Error

**Issue:** Getting 500 error when placing any trade  
**Location:** Backend API `/api/trading/place-order`  
**Symptoms:** Frontend shows "Internal server error", trade fails even with sufficient balance  
**Likely cause:** Database save operation failing in portfolio or transaction

### WebSocket Connectivity

**Issue:** Real-time price updates not working consistently  
**Location:** WebSocket connection between frontend and backend  
**Symptoms:** Connection drops frequently, shows 1006 error codes  
**Impact:** Live stock prices don't update properly

## API Integration

### Yahoo Finance

**Status:** Currently using mock data in development  
**Reason:** API compatibility issues with current library version  
**Workaround:** Mock price generation for demo purposes

## Server Setup

### Port Conflicts

**Issue:** Sometimes server won't start due to port 5000 being in use  
**Solution:** Check and kill existing processes before starting  
**Command:** `netstat -ano | findstr :5000` then `taskkill /PID <number> /F`

### CORS Errors

**Issue:** Frontend requests getting blocked  
**Cause:** Multiple server instances or port conflicts  
**Fix:** Ensure only one backend instance running

## Working Features

- User authentication and registration
- Portfolio display and balance tracking
- Frontend navigation and UI components
- Database connectivity
- Mock real-time price simulation

## Quick Fixes Needed

1. Add proper error handling in trade placement API
2. Stabilize WebSocket connection management
3. Implement fallback mechanisms for API failures
4. Add validation for all numeric calculations

## Testing

- Demo stocks (DEMO1, DEMO2, TEST) work for testing
- Default portfolio balance: ₹1,00,000
- WebSocket connects but may disconnect randomly
