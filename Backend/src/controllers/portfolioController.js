import Portfolio from "../models/Portfolio.js";
import Stock from "../models/Stock.js";
import Transaction from "../models/Transaction.js";

// @desc    Get user portfolio
// @route   GET /api/portfolio
// @access  Private
export const getPortfolio = async (req, res, next) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user._id });

    if (!portfolio) {
      // Create empty portfolio if doesn't exist
      portfolio = await Portfolio.create({
        userId: req.user._id,
        availableCash: 100000, // Default starting balance of 1 lakh
        totalCurrentValue: 0,
        totalInvestedAmount: 0,
        holdings: [],
      });
      console.log(
        `✅ Created new portfolio for user ${req.user._id} with balance: ₹${portfolio.availableCash}`
      );
    }

    // Update current prices for holdings
    if (portfolio.holdings.length > 0) {
      const symbols = portfolio.holdings.map((holding) => holding.symbol);
      const stocks = await Stock.find({ symbol: { $in: symbols } });

      const priceMap = {};
      stocks.forEach((stock) => {
        priceMap[stock.symbol] = stock.currentPrice;
      });

      portfolio.updateCurrentPrices(priceMap);
      await portfolio.save();
    }

    res.status(200).json({
      success: true,
      data: {
        portfolio,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get portfolio holdings
// @route   GET /api/portfolio/holdings
// @access  Private
export const getHoldings = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user._id });

    if (!portfolio) {
      return res.status(200).json({
        success: true,
        data: {
          holdings: [],
        },
      });
    }

    // Get detailed stock information for each holding
    const holdingsWithDetails = await Promise.all(
      portfolio.holdings.map(async (holding) => {
        const stock = await Stock.findOne({ symbol: holding.symbol });
        return {
          ...holding.toObject(),
          stockDetails: stock
            ? {
                companyName: stock.companyName,
                sector: stock.sector,
                marketCap: stock.marketCap,
                pe: stock.pe,
                dividendYield: stock.dividendYield,
              }
            : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        holdings: holdingsWithDetails,
        summary: {
          totalInvestedAmount: portfolio.totalInvestedAmount,
          totalCurrentValue: portfolio.totalCurrentValue,
          totalPnL: portfolio.totalPnL,
          totalPnLPercentage: portfolio.totalPnLPercentage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get portfolio performance
// @route   GET /api/portfolio/performance
// @access  Private
export const getPortfolioPerformance = async (req, res, next) => {
  try {
    const { period = "1M" } = req.query;

    const portfolio = await Portfolio.findOne({ userId: req.user._id });

    if (!portfolio) {
      return res.status(200).json({
        success: true,
        data: {
          performance: {
            oneDay: 0,
            oneWeek: 0,
            oneMonth: 0,
            threeMonths: 0,
            sixMonths: 0,
            oneYear: 0,
            allTime: 0,
          },
          chartData: [],
        },
      });
    }

    // Generate mock performance data
    const chartData = generatePortfolioChartData(
      portfolio.totalCurrentValue,
      period
    );

    res.status(200).json({
      success: true,
      data: {
        performance: portfolio.performance,
        chartData,
        summary: {
          totalValue: portfolio.totalCurrentValue,
          totalInvested: portfolio.totalInvestedAmount,
          totalPnL: portfolio.totalPnL,
          totalPnLPercentage: portfolio.totalPnLPercentage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get portfolio diversification
// @route   GET /api/portfolio/diversification
// @access  Private
export const getPortfolioDiversification = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user._id });

    if (!portfolio || portfolio.holdings.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          sectorWise: [],
          marketCapWise: [],
          topHoldings: [],
        },
      });
    }

    // Calculate sector-wise diversification
    const sectorMap = {};
    const marketCapMap = {};

    for (const holding of portfolio.holdings) {
      const stock = await Stock.findOne({ symbol: holding.symbol });

      if (stock) {
        // Sector-wise
        if (!sectorMap[stock.sector]) {
          sectorMap[stock.sector] = 0;
        }
        sectorMap[stock.sector] += holding.currentValue;

        // Market cap-wise
        const marketCapCategory = stock.marketCapCategory || "Unknown";
        if (!marketCapMap[marketCapCategory]) {
          marketCapMap[marketCapCategory] = 0;
        }
        marketCapMap[marketCapCategory] += holding.currentValue;
      }
    }

    // Convert to percentage
    const totalValue = portfolio.totalCurrentValue;

    const sectorWise = Object.entries(sectorMap)
      .map(([sector, value]) => ({
        sector,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const marketCapWise = Object.entries(marketCapMap)
      .map(([category, value]) => ({
        category,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Top holdings by value
    const topHoldings = portfolio.holdings
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 10)
      .map((holding) => ({
        symbol: holding.symbol,
        value: holding.currentValue,
        percentage:
          totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0,
      }));

    res.status(200).json({
      success: true,
      data: {
        sectorWise,
        marketCapWise,
        topHoldings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add cash to portfolio
// @route   POST /api/portfolio/add-cash
// @access  Private
export const addCash = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    let portfolio = await Portfolio.findOne({ userId: req.user._id });

    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: req.user._id });
    }

    portfolio.availableCash += amount;
    await portfolio.save();

    // Create a transaction record for cash addition
    await Transaction.create({
      userId: req.user._id,
      orderId: `CASH_${Date.now()}`,
      symbol: "CASH",
      companyName: "Cash Addition",
      type: "buy",
      orderType: "market",
      segment: "cash",
      quantity: 1,
      price: amount,
      grossAmount: amount,
      netAmount: amount,
      status: "completed",
      executedQuantity: 1,
      averageExecutionPrice: amount,
      executedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Cash added successfully",
      data: {
        availableCash: portfolio.availableCash,
        amountAdded: amount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw cash from portfolio
// @route   POST /api/portfolio/withdraw-cash
// @access  Private
export const withdrawCash = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const portfolio = await Portfolio.findOne({ userId: req.user._id });

    if (!portfolio) {
      return res.status(400).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    if (portfolio.availableCash < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient cash balance",
      });
    }

    portfolio.availableCash -= amount;
    await portfolio.save();

    // Create a transaction record for cash withdrawal
    await Transaction.create({
      userId: req.user._id,
      orderId: `WITHDRAW_${Date.now()}`,
      symbol: "CASH",
      companyName: "Cash Withdrawal",
      type: "sell",
      orderType: "market",
      segment: "cash",
      quantity: 1,
      price: amount,
      grossAmount: amount,
      netAmount: amount,
      status: "completed",
      executedQuantity: 1,
      averageExecutionPrice: amount,
      executedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Cash withdrawn successfully",
      data: {
        availableCash: portfolio.availableCash,
        amountWithdrawn: amount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to generate portfolio chart data
const generatePortfolioChartData = (currentValue, period) => {
  const data = [];
  const periodDays = {
    "1D": 1,
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "6M": 180,
    "1Y": 365,
  };

  const days = periodDays[period] || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const randomChange = (Math.random() - 0.5) * 0.05; // ±2.5% random change
    const value = currentValue * (1 + randomChange);

    data.push({
      date: date.toISOString().split("T")[0],
      value: parseFloat(value.toFixed(2)),
    });
  }

  return data;
};

// @desc    Get portfolio analytics
// @route   GET /api/portfolio/analytics
// @access  Private
export const getPortfolioAnalytics = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user._id });

    if (!portfolio) {
      return res.status(200).json({
        success: true,
        data: {
          totalStocks: 0,
          totalValue: 0,
          totalInvested: 0,
          totalPnL: 0,
          bestPerformer: null,
          worstPerformer: null,
          allocation: [],
        },
      });
    }

    const analytics = {
      totalStocks: portfolio.holdings.length,
      totalValue: portfolio.totalCurrentValue,
      totalInvested: portfolio.totalInvestedAmount,
      totalPnL: portfolio.totalPnL,
      totalPnLPercentage: portfolio.totalPnLPercentage,
      availableCash: portfolio.availableCash,
    };

    if (portfolio.holdings.length > 0) {
      // Find best and worst performers
      const sortedByPnL = [...portfolio.holdings].sort(
        (a, b) => b.pnlPercentage - a.pnlPercentage
      );
      analytics.bestPerformer = sortedByPnL[0];
      analytics.worstPerformer = sortedByPnL[sortedByPnL.length - 1];

      // Calculate allocation
      analytics.allocation = portfolio.holdings
        .map((holding) => ({
          symbol: holding.symbol,
          value: holding.currentValue,
          percentage:
            portfolio.totalCurrentValue > 0
              ? (holding.currentValue / portfolio.totalCurrentValue) * 100
              : 0,
          pnl: holding.pnl,
          pnlPercentage: holding.pnlPercentage,
        }))
        .sort((a, b) => b.percentage - a.percentage);
    }

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};
