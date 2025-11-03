import express from "express";
import { body, validationResult } from "express-validator";
import Transaction from "../models/Transaction.js";
import Portfolio from "../models/Portfolio.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import yahooFinance from "yahoo-finance2";

const router = express.Router();

// Place a trade (buy/sell)
router.post(
  "/place-order",
  [
    protect,
    body("symbol").notEmpty().withMessage("Stock symbol is required"),
    body("action")
      .isIn(["buy", "sell"])
      .withMessage("Action must be buy or sell"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be a positive integer"),
    body("orderType")
      .isIn(["market", "limit"])
      .withMessage("Order type must be market or limit"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { symbol, action, quantity, orderType, price } = req.body;
      const userId = req.user.id;

      // Get current stock price if market order
      let currentPrice = price;
      if (orderType === "market") {
        try {
          // Handle demo stocks
          if (symbol.startsWith("DEMO") || symbol === "TEST") {
            console.log(`Using demo price for ${symbol}`);
            // Lower prices for demo stocks to avoid balance issues
            currentPrice = 50 + Math.random() * 200; // Random price between 50-250 for demo
          } else {
            const quote = await yahooFinance.quote(symbol);
            currentPrice = quote.regularMarketPrice;

            if (!currentPrice || currentPrice <= 0) {
              throw new Error("Invalid price received");
            }
          }
        } catch (error) {
          console.error("Error fetching stock price:", error);
          // Fallback to a demo price for testing
          console.log("Using fallback price for testing...");
          currentPrice = 100 + Math.random() * 1000; // Random price between 100-1100 for demo
        }
      }

      // Get user portfolio
      let portfolio = await Portfolio.findOne({ userId });
      if (!portfolio) {
        // Create new portfolio if doesn't exist
        portfolio = new Portfolio({
          userId,
          availableCash: 100000, // Default starting balance of 1 lakh
          totalCurrentValue: 0,
          totalInvestedAmount: 0,
          holdings: [],
        });

        // Save the new portfolio first
        await portfolio.save();
        console.log(
          `✅ Created new portfolio for user ${userId} with balance: ₹${portfolio.availableCash}`
        );
      }

      console.log(
        `💰 Current portfolio balance: ₹${
          portfolio.availableCash
        }, Required: ₹${currentPrice * quantity}`
      );

      const totalValue = currentPrice * quantity;

      if (action === "buy") {
        // Check if user has enough balance
        if (portfolio.availableCash < totalValue) {
          return res.status(400).json({
            success: false,
            message: "Insufficient balance",
          });
        }

        // Update portfolio for buy order
        portfolio.availableCash -= totalValue;

        // Check if user already has this stock
        const existingHolding = portfolio.holdings.find(
          (h) => h.symbol === symbol
        );

        if (existingHolding) {
          // Update existing holding
          const newTotalShares = existingHolding.quantity + quantity;
          const newTotalCost =
            existingHolding.averagePrice * existingHolding.quantity +
            totalValue;
          existingHolding.averagePrice = newTotalCost / newTotalShares;
          existingHolding.quantity = newTotalShares;
          existingHolding.currentPrice = currentPrice;
          existingHolding.investedAmount =
            newTotalShares * existingHolding.averagePrice;
          existingHolding.currentValue = newTotalShares * currentPrice;
        } else {
          // Add new holding
          portfolio.holdings.push({
            symbol,
            companyName: symbol, // You can enhance this with actual company name
            exchange: "NSE",
            quantity,
            averagePrice: currentPrice,
            currentPrice,
            investedAmount: totalValue,
            currentValue: totalValue,
            pnl: 0,
            pnlPercentage: 0,
          });
        }

        portfolio.totalInvestedAmount += totalValue;
      } else if (action === "sell") {
        // Check if user has enough shares
        const holding = portfolio.holdings.find((h) => h.symbol === symbol);

        if (!holding || holding.quantity < quantity) {
          return res.status(400).json({
            success: false,
            message: "Insufficient shares to sell",
          });
        }

        // Update portfolio for sell order
        portfolio.availableCash += totalValue;

        // Calculate P&L for sold shares
        const soldValue = holding.averagePrice * quantity;
        const sellValue = currentPrice * quantity;
        const pnl = sellValue - soldValue;

        // Update holding
        holding.quantity -= quantity;
        holding.investedAmount = holding.quantity * holding.averagePrice;
        holding.currentValue = holding.quantity * currentPrice;

        if (holding.quantity === 0) {
          // Remove holding if all shares sold
          portfolio.holdings = portfolio.holdings.filter(
            (h) => h.symbol !== symbol
          );
        }

        portfolio.totalInvestedAmount -= soldValue;
      }

      // Calculate total portfolio value
      let totalHoldingsValue = 0;
      for (const holding of portfolio.holdings) {
        try {
          const quote = await yahooFinance.quote(holding.symbol);
          if (quote && quote.regularMarketPrice > 0) {
            holding.currentPrice = quote.regularMarketPrice;
          } else {
            // Use fallback price calculation
            holding.currentPrice =
              holding.averagePrice * (1 + (Math.random() - 0.5) * 0.1); // ±5% random change
          }
          holding.currentValue = holding.currentPrice * holding.quantity;
          holding.pnl =
            (holding.currentPrice - holding.averagePrice) * holding.quantity;
          holding.pnlPercentage =
            ((holding.currentPrice - holding.averagePrice) /
              holding.averagePrice) *
            100;
          totalHoldingsValue += holding.currentValue;
        } catch (error) {
          console.error(`Error updating price for ${holding.symbol}:`, error);
          // Use average price as fallback
          holding.currentPrice = holding.averagePrice;
          holding.currentValue = holding.averagePrice * holding.quantity;
          holding.pnl = 0;
          holding.pnlPercentage = 0;
          totalHoldingsValue += holding.currentValue;
        }
      }

      // Update portfolio totals
      portfolio.totalCurrentValue = totalHoldingsValue;
      portfolio.updateSummary();

      // Save portfolio
      await portfolio.save();

      // Create transaction record
      const transaction = new Transaction({
        userId,
        symbol,
        action,
        quantity,
        price: currentPrice,
        totalValue,
        orderType,
        status: "completed",
        timestamp: new Date(),
      });

      await transaction.save();

      res.status(200).json({
        success: true,
        message: `${
          action.charAt(0).toUpperCase() + action.slice(1)
        } order placed successfully`,
        data: {
          transaction: {
            id: transaction._id,
            symbol,
            action,
            quantity,
            price: currentPrice,
            totalValue,
            timestamp: transaction.timestamp,
          },
          portfolio: {
            availableCash: portfolio.availableCash,
            totalCurrentValue: portfolio.totalCurrentValue,
            totalInvestedAmount: portfolio.totalInvestedAmount,
            totalPnL: portfolio.totalPnL,
            totalPnLPercentage: portfolio.totalPnLPercentage,
          },
        },
      });
    } catch (error) {
      console.error("Error placing trade:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Get trading history
router.get("/history", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, symbol, action } = req.query;

    const filter = { userId };
    if (symbol) filter.symbol = symbol;
    if (action) filter.action = action;

    const transactions = await Transaction.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalTransactions: total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching trading history:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get market data for a symbol
router.get("/market-data/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;

    let quote;

    // Handle demo stocks
    if (symbol.startsWith("DEMO") || symbol === "TEST") {
      console.log(`Generating demo data for ${symbol}`);
      const basePrice = 50 + Math.random() * 200; // Lower prices for demo
      const change = (Math.random() - 0.5) * 10;

      quote = {
        symbol: symbol,
        regularMarketPrice: basePrice,
        regularMarketChange: change,
        regularMarketChangePercent: (change / basePrice) * 100,
        regularMarketPreviousClose: basePrice - change,
        regularMarketOpen: basePrice + (Math.random() - 0.5) * 10,
        regularMarketDayHigh: basePrice + Math.random() * 20,
        regularMarketDayLow: basePrice - Math.random() * 20,
        regularMarketVolume: Math.floor(Math.random() * 1000000),
        marketCap: Math.floor(Math.random() * 100000000000),
      };
    } else {
      try {
        quote = await yahooFinance.quote(symbol);
      } catch (error) {
        console.error("Yahoo Finance API error, using fallback data:", error);
        // Generate demo data for testing
        const basePrice = 100 + Math.random() * 1000;
        const change = (Math.random() - 0.5) * 20;

        quote = {
          symbol: symbol,
          regularMarketPrice: basePrice,
          regularMarketChange: change,
          regularMarketChangePercent: (change / basePrice) * 100,
          regularMarketPreviousClose: basePrice - change,
          regularMarketOpen: basePrice + (Math.random() - 0.5) * 10,
          regularMarketDayHigh: basePrice + Math.random() * 20,
          regularMarketDayLow: basePrice - Math.random() * 20,
          regularMarketVolume: Math.floor(Math.random() * 1000000),
          marketCap: Math.floor(Math.random() * 100000000000),
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        symbol: quote.symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        previousClose: quote.regularMarketPreviousClose,
        open: quote.regularMarketOpen,
        dayHigh: quote.regularMarketDayHigh,
        dayLow: quote.regularMarketDayLow,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error("Error fetching market data:", error);
    res.status(400).json({
      success: false,
      message: "Unable to fetch market data for the symbol",
    });
  }
});

// Search stocks
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    // Popular Indian stocks for demo (clean list without duplicates)
    const popularStocks = [
      { symbol: "RELIANCE.NS", name: "Reliance Industries", exchange: "NSE" },
      { symbol: "TCS.NS", name: "Tata Consultancy Services", exchange: "NSE" },
      { symbol: "HDFCBANK.NS", name: "HDFC Bank", exchange: "NSE" },
      { symbol: "INFY.NS", name: "Infosys", exchange: "NSE" },
      { symbol: "ITC.NS", name: "ITC Limited", exchange: "NSE" },
      { symbol: "SBIN.NS", name: "State Bank of India", exchange: "NSE" },
      { symbol: "AIRTEL.NS", name: "Bharti Airtel", exchange: "NSE" },
      { symbol: "LT.NS", name: "Larsen & Toubro", exchange: "NSE" },
      { symbol: "MARUTI.NS", name: "Maruti Suzuki", exchange: "NSE" },
      { symbol: "ASIANPAINT.NS", name: "Asian Paints", exchange: "NSE" },
      // Demo stocks for testing
      { symbol: "DEMO1", name: "Demo Stock 1", exchange: "NSE" },
      { symbol: "DEMO2", name: "Demo Stock 2", exchange: "NSE" },
      { symbol: "TEST", name: "Test Company", exchange: "NSE" },
    ];

    // Filter based on query
    const results = popularStocks.filter(
      (stock) =>
        stock.name.toLowerCase().includes(query.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(query.toLowerCase())
    );

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error searching stocks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get popular stocks
router.get("/popular", async (req, res) => {
  try {
    const popularStocks = [
      { symbol: "RELIANCE.NS", name: "Reliance Industries", exchange: "NSE" },
      { symbol: "TCS.NS", name: "Tata Consultancy Services", exchange: "NSE" },
      { symbol: "HDFCBANK.NS", name: "HDFC Bank", exchange: "NSE" },
      { symbol: "INFY.NS", name: "Infosys", exchange: "NSE" },
      { symbol: "ITC.NS", name: "ITC Limited", exchange: "NSE" },
      { symbol: "SBIN.NS", name: "State Bank of India", exchange: "NSE" },
      { symbol: "AIRTEL.NS", name: "Bharti Airtel", exchange: "NSE" },
      { symbol: "LT.NS", name: "Larsen & Toubro", exchange: "NSE" },
      // Demo stocks for testing
      { symbol: "DEMO1", name: "Demo Stock 1", exchange: "NSE" },
      { symbol: "DEMO2", name: "Demo Stock 2", exchange: "NSE" },
      { symbol: "TEST", name: "Test Company", exchange: "NSE" },
    ];

    // Get current prices for popular stocks
    const stocksWithPrices = await Promise.all(
      popularStocks.map(async (stock) => {
        try {
          // Handle demo stocks
          if (stock.symbol.startsWith("DEMO") || stock.symbol === "TEST") {
            const basePrice = 50 + Math.random() * 200; // Lower prices for demo
            const change = (Math.random() - 0.5) * 10;
            return {
              ...stock,
              price: basePrice,
              change: change,
              changePercent: (change / basePrice) * 100,
            };
          }

          const quote = await yahooFinance.quote(stock.symbol);
          if (quote && quote.regularMarketPrice) {
            return {
              ...stock,
              price: quote.regularMarketPrice,
              change: quote.regularMarketChange,
              changePercent: quote.regularMarketChangePercent,
            };
          } else {
            throw new Error("Invalid quote data");
          }
        } catch (error) {
          // Generate demo prices for testing
          const basePrice = 100 + Math.random() * 1500;
          const change = (Math.random() - 0.5) * 50;
          return {
            ...stock,
            price: basePrice,
            change: change,
            changePercent: (change / basePrice) * 100,
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      data: stocksWithPrices,
    });
  } catch (error) {
    console.error("Error fetching popular stocks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Check portfolio balance (for testing)
router.get("/check-balance", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    let portfolio = await Portfolio.findOne({ userId });

    if (!portfolio) {
      // Create new portfolio if doesn't exist
      portfolio = new Portfolio({
        userId,
        availableCash: 100000, // Default starting balance
        totalCurrentValue: 0,
        totalInvestedAmount: 0,
        holdings: [],
      });
      await portfolio.save();
      console.log(
        `✅ Created new portfolio for user ${userId} with balance: ₹${portfolio.availableCash}`
      );
    }

    res.status(200).json({
      success: true,
      data: {
        availableCash: portfolio.availableCash,
        totalCurrentValue: portfolio.totalCurrentValue,
        totalInvestedAmount: portfolio.totalInvestedAmount,
        holdings: portfolio.holdings.length,
      },
    });
  } catch (error) {
    console.error("Error checking balance:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Force create portfolio with balance (for testing)
router.post("/create-portfolio", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if portfolio already exists
    let portfolio = await Portfolio.findOne({ userId });

    if (portfolio) {
      // Update existing portfolio to ensure balance
      if (!portfolio.availableCash || portfolio.availableCash === 0) {
        portfolio.availableCash = 100000;
        await portfolio.save();
        console.log(
          `✅ Updated portfolio balance for user ${userId}: ₹${portfolio.availableCash}`
        );
      }
    } else {
      // Create new portfolio
      portfolio = new Portfolio({
        userId,
        availableCash: 100000,
        totalCurrentValue: 0,
        totalInvestedAmount: 0,
        holdings: [],
      });
      await portfolio.save();
      console.log(
        `✅ Created new portfolio for user ${userId}: ₹${portfolio.availableCash}`
      );
    }

    res.status(200).json({
      success: true,
      message: "Portfolio created/updated successfully",
      data: {
        availableCash: portfolio.availableCash,
        totalCurrentValue: portfolio.totalCurrentValue,
        totalInvestedAmount: portfolio.totalInvestedAmount,
        holdings: portfolio.holdings,
      },
    });
  } catch (error) {
    console.error("Error creating portfolio:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
