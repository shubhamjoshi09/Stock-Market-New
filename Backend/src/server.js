import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import dotenv from "dotenv";

// Import configuration
import connectDB from "./config/database.js";

// Import services
import priceUpdateScheduler from "./services/priceUpdateScheduler.js";
import websocketService from "./services/websocketService.js";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import portfolioRoutes from "./routes/portfolio.js";
import stockRoutes from "./routes/stock.js";
import transactionRoutes from "./routes/transaction.js";
import tradingRoutes from "./routes/trading.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Development: allow local frontend automatically to reduce friction.
    const devAllow = process.env.NODE_ENV !== "production";

    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:5173",
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // If running in development, allow localhost origins to simplify testing
    if (devAllow && /localhost|127\.0\.0\.1/.test(origin)) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

// Ensure preflight OPTIONS are handled for all routes (helpful for CORS checks)
app.options("*", cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression middleware
app.use(compression());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/trading", tradingRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Stock Market API is running successfully",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// WebSocket stats endpoint
app.get("/api/websocket/stats", (req, res) => {
  const stats = websocketService.getStats();
  res.status(200).json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString(),
  });
});

// Welcome route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Stock Market Trading Platform API",
    version: "1.0.0",
    documentation: "/api/docs",
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server with better error handling when the port is already in use.
const PORT = parseInt(process.env.PORT, 10) || 5000;

// Start server with retry logic: if desired port is in use, try subsequent ports.
function startServer(port, retries = 3) {
  const server = http.createServer(app);

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      if (retries > 0) {
        console.warn(
          `Port ${port} is in use, trying port ${port + 1} (retries left: ${
            retries - 1
          })...`
        );
        setTimeout(() => startServer(port + 1, retries - 1), 300);
        return;
      }

      console.error(
        `Port ${port} is already in use and no retries remain. Please stop the other process or set a different PORT in your .env.`
      );
      console.error(
        "To find the process using the port (Windows PowerShell): Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess"
      );
      process.exit(1);
    }

    console.error("Server error:", err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV} mode on port ${port}`
    );
    console.log(`📊 Stock Market API: http://localhost:${port}`);
    console.log(`🏥 Health Check: http://localhost:${port}/api/health`);

    // Initialize WebSocket service for real-time data
    console.log("🔌 Initializing WebSocket service for real-time data...");
    websocketService.initialize(server);
    console.log("✅ WebSocket service activated!");

    // Start real-time price updates (FREE)
    console.log("🔄 Starting FREE real-time stock price updates...");
    priceUpdateScheduler.startPriceUpdates();
    console.log("✅ Real-time price updates activated!");
  });
}

startServer(PORT, 3);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

export default app;
