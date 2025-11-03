# Stock Market Trading Platform - Backend API

A comprehensive RESTful API for a stock market trading platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Management**: Registration, authentication, profile management, KYC verification
- **Portfolio Management**: Holdings tracking, performance analytics, diversification analysis
- **Trading Operations**: Buy/sell orders, order management, trade history
- **Market Data**: Real-time stock prices, market trends, stock search
- **Security**: JWT authentication, input validation, rate limiting, data sanitization

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with refresh tokens
- **Security**: Helmet, CORS, Rate Limiting, Data Sanitization
- **Validation**: Express Validator
- **File Upload**: Multer (ready for Cloudinary integration)
- **Environment**: dotenv for configuration

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18.0.0 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd Stock-Market-New/Backend
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Configuration

Copy the example environment file and configure your settings:
\`\`\`bash
cp .env.example .env
\`\`\`

Edit the \`.env\` file with your configuration:

\`\`\`env

# Database

MONGODB_URI=mongodb://localhost:27017/stock-market-db

# JWT Secrets (change these in production!)

JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here

# API Keys (sign up for these services)

ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
FINNHUB_API_KEY=your_finnhub_api_key

# Frontend URL

FRONTEND_URL=http://localhost:5173
\`\`\`

### 4. Start MongoDB

Make sure MongoDB is running on your system:
\`\`\`bash

# For local MongoDB installation

mongod

# Or use MongoDB Compass/Atlas

\`\`\`

### 5. Run the Application

**Development Mode:**
\`\`\`bash
npm run dev
\`\`\`

**Production Mode:**
\`\`\`bash
npm start
\`\`\`

The API will be available at: \`http://localhost:5000\`

## 📚 API Documentation

### Base URL

\`\`\`
http://localhost:5000/api
\`\`\`

### Authentication Endpoints

#### Register User

\`\`\`http
POST /api/auth/signup
Content-Type: application/json

{
"firstName": "John",
"lastName": "Doe",
"email": "john@example.com",
"phone": "9876543210",
"countryCode": "+91",
"password": "SecurePass123!"
}
\`\`\`

#### Login

\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
"email": "john@example.com",
"password": "SecurePass123!"
}
\`\`\`

#### Verify OTP

\`\`\`http
POST /api/auth/verify-otp
Authorization: Bearer <token>
Content-Type: application/json

{
"otp": "123456",
"type": "email"
}
\`\`\`

### User Management Endpoints

#### Get Profile

\`\`\`http
GET /api/users/profile
Authorization: Bearer <token>
\`\`\`

#### Complete KYC

\`\`\`http
POST /api/users/kyc
Authorization: Bearer <token>
Content-Type: application/json

{
"panNumber": "ABCDE1234F",
"aadharNumber": "123412341234",
"dateOfBirth": "1990-01-01",
"address": {
"street": "123 Main St",
"city": "Mumbai",
"state": "Maharashtra",
"pincode": "400001"
}
}
\`\`\`

### Stock Market Endpoints

#### Search Stocks

\`\`\`http
GET /api/stocks/search?q=RELIANCE&limit=10
\`\`\`

#### Get Stock Details

\`\`\`http
GET /api/stocks/RELIANCE?exchange=NSE
\`\`\`

#### Get Market Overview

\`\`\`http
GET /api/stocks/market-overview
\`\`\`

### Trading Endpoints

#### Place Order

\`\`\`http
POST /api/transactions/place-order
Authorization: Bearer <token>
Content-Type: application/json

{
"symbol": "RELIANCE",
"type": "buy",
"orderType": "market",
"quantity": 10,
"segment": "equity"
}
\`\`\`

#### Get Portfolio

\`\`\`http
GET /api/portfolio
Authorization: Bearer <token>
\`\`\`

### Portfolio Endpoints

#### Add Cash

\`\`\`http
POST /api/portfolio/add-cash
Authorization: Bearer <token>
Content-Type: application/json

{
"amount": 10000
}
\`\`\`

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### Token Refresh

Tokens can be refreshed using the refresh endpoint:
\`\`\`http
POST /api/auth/refresh
Content-Type: application/json

{
"refreshToken": "<your-refresh-token>"
}
\`\`\`

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured for frontend origins
- **Helmet**: Security headers protection
- **Data Sanitization**: Protection against NoSQL injection
- **Input Validation**: Comprehensive validation for all endpoints
- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Secure token generation and validation

## 📊 Database Schema

### User Model

- Personal information (name, email, phone)
- Authentication data (password, tokens)
- KYC information (PAN, Aadhar, address)
- Account status and preferences

### Portfolio Model

- User holdings with real-time P&L
- Available cash and margin
- Performance metrics
- Diversification data

### Transaction Model

- Order details and execution
- Charges breakdown
- Order status tracking
- Market data snapshot

### Stock Model

- Real-time market data
- Company information
- Financial ratios
- Historical data references

## 🚀 Deployment

### Environment Variables for Production

\`\`\`env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stock-market
JWT_SECRET=super-secure-random-string
FRONTEND_URL=https://your-frontend-domain.com
\`\`\`

### Docker Deployment (Optional)

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package\*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
\`\`\`

## 🧪 Testing

Run the test suite:
\`\`\`bash
npm test
\`\`\`

## 📈 Performance Monitoring

The API includes:

- Health check endpoint: \`GET /api/health\`
- Request logging
- Error tracking
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Email: support@stockmarket.com
- Documentation: [API Docs](http://localhost:5000/api/docs)

## 🔄 API Versioning

Current version: v1.0.0
Base URL: \`/api/v1\` (future versions will use versioned URLs)

---

**Note**: This is a development setup. For production deployment, ensure proper security configurations, environment variables, and database optimizations.
