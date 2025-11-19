# Stock Market Trading Platform

A full-stack web application for stock market trading with real-time price updates and portfolio management.

## Features

- User registration and authentication with OTP verification
- Portfolio management with balance tracking
- Real-time stock price updates via WebSocket
- Buy/sell stock trading functionality
- Transaction history and performance tracking
- Responsive web interface

## Tech Stack

**Frontend:**

- React 18 with Vite
- React Router for navigation
- WebSocket for real-time updates
- Tailwind CSS for styling

**Backend:**

- Node.js with Express
- MongoDB database
- JWT authentication
- WebSocket server
- Yahoo Finance API integration

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. Navigate to backend directory:

```bash
cd Backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file with following variables:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

4. Start the server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd Frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

### Database Setup

The application will automatically create necessary collections in MongoDB. Default portfolio balance is set to ₹1,00,000 for new users.

## Usage

1. Register a new account with email verification
2. Login to access the trading dashboard
3. View portfolio and available balance
4. Search and select stocks to trade
5. Place buy/sell orders
6. Monitor real-time price changes

## Default Test Data

For testing purposes, the following demo stocks are available:

- DEMO1 - Demo Stock 1
- DEMO2 - Demo Stock 2
- TEST - Test Company

## Development Notes

- WebSocket connection provides real-time price updates
- In development mode, mock data is used when external APIs are unavailable
- Default starting balance: ₹1,00,000
- Stock prices range between ₹50-250 for demo stocks

## Troubleshooting

If you encounter port conflicts:

```bash
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

Make sure MongoDB is running before starting the backend server.

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/portfolio` - Get user portfolio
- `POST /api/trading/place-order` - Place buy/sell order    
- `GET /api/trading/history` - Get transaction history

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
