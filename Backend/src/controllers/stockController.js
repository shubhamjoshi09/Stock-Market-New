import Stock from "../models/Stock.js";
import freeStockDataService from "../services/freeStockDataService.js";
import priceUpdateScheduler from "../services/priceUpdateScheduler.js";

// @desc    Get all stocks with filtering
// @route   GET /api/stocks
// @access  Public
export const getAllStocks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      sector,
      exchange = "NSE",
      segment = "equity",
      marketCap,
      sortBy = "marketCap",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {
      isActive: true,
      isTradable: true,
      exchange,
      segment,
    };

    if (sector) {
      filter.sector = sector;
    }

    if (marketCap) {
      filter.marketCapCategory = marketCap;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query
    const stocks = await Stock.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select(
        "symbol companyName currentPrice change changePercent volume marketCap sector"
      );

    const total = await Stock.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        stocks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search stocks
// @route   GET /api/stocks/search
// @access  Public
export const searchStocks = async (req, res, next) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const stocks = await Stock.searchStocks(q.trim(), parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        stocks,
        query: q,
        totalResults: stocks.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock details by symbol
// @route   GET /api/stocks/:symbol
// @access  Public
export const getStockBySymbol = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { exchange = "NSE" } = req.query;

    const stock = await Stock.findOne({
      symbol: symbol.toUpperCase(),
      exchange,
      isActive: true,
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        stock,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending stocks
// @route   GET /api/stocks/trending
// @access  Public
export const getTrendingStocks = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const stocks = await Stock.getTrendingStocks(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        stocks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top gainers
// @route   GET /api/stocks/top-gainers
// @access  Public
export const getTopGainers = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const stocks = await Stock.getTopGainers(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        stocks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top losers
// @route   GET /api/stocks/top-losers
// @access  Public
export const getTopLosers = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const stocks = await Stock.getTopLosers(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        stocks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stocks by sector
// @route   GET /api/stocks/sector/:sector
// @access  Public
export const getStocksBySector = async (req, res, next) => {
  try {
    const { sector } = req.params;
    const { limit = 50 } = req.query;

    const stocks = await Stock.getStocksBySector(sector, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        stocks,
        sector,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get market overview
// @route   GET /api/stocks/market-overview
// @access  Public
export const getMarketOverview = async (req, res, next) => {
  try {
    // Get market statistics
    const totalStocks = await Stock.countDocuments({
      isActive: true,
      segment: "equity",
    });
    const gainersCount = await Stock.countDocuments({
      isActive: true,
      segment: "equity",
      changePercent: { $gt: 0 },
    });
    const losersCount = await Stock.countDocuments({
      isActive: true,
      segment: "equity",
      changePercent: { $lt: 0 },
    });
    const unchangedCount = await Stock.countDocuments({
      isActive: true,
      segment: "equity",
      changePercent: 0,
    });

    // Get top performers
    const topGainers = await Stock.getTopGainers(5);
    const topLosers = await Stock.getTopLosers(5);
    const mostActive = await Stock.getTrendingStocks(5);

    // Get sector performance
    const sectorPerformance = await Stock.aggregate([
      {
        $match: {
          isActive: true,
          segment: "equity",
          sector: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$sector",
          avgChange: { $avg: "$changePercent" },
          totalVolume: { $sum: "$volume" },
          stockCount: { $sum: 1 },
        },
      },
      {
        $sort: { avgChange: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        marketStats: {
          totalStocks,
          gainers: gainersCount,
          losers: losersCount,
          unchanged: unchangedCount,
        },
        topPerformers: {
          gainers: topGainers,
          losers: topLosers,
          mostActive,
        },
        sectorPerformance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock price history
// @route   GET /api/stocks/:symbol/history
// @access  Public
export const getStockHistory = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { period = "1M", interval = "1D" } = req.query;

    // This would typically fetch from a historical data service or database
    // For now, we'll return mock data
    const stock = await Stock.findOne({
      symbol: symbol.toUpperCase(),
      isActive: true,
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found",
      });
    }

    // Mock historical data
    const mockData = generateMockHistoricalData(stock.currentPrice, period);

    res.status(200).json({
      success: true,
      data: {
        symbol: stock.symbol,
        companyName: stock.companyName,
        period,
        interval,
        history: mockData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to generate mock historical data
const generateMockHistoricalData = (currentPrice, period) => {
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

    const randomChange = (Math.random() - 0.5) * 0.1; // ±5% random change
    const price = currentPrice * (1 + randomChange);
    const volume = Math.floor(Math.random() * 1000000) + 100000;

    data.push({
      date: date.toISOString().split("T")[0],
      open: price * (1 + (Math.random() - 0.5) * 0.02),
      high: price * (1 + Math.random() * 0.03),
      low: price * (1 - Math.random() * 0.03),
      close: price,
      volume,
    });
  }

  return data;
};

// @desc    Update stock prices (Admin only)
// @route   PUT /api/stocks/update-prices
// @access  Private (Admin)
export const updateStockPrices = async (req, res, next) => {
  try {
    const { stocks } = req.body;

    if (!stocks || !Array.isArray(stocks)) {
      return res.status(400).json({
        success: false,
        message: "Stocks array is required",
      });
    }

    const updatePromises = stocks.map(async (stockData) => {
      const { symbol, price, volume, ...otherData } = stockData;

      return Stock.findOneAndUpdate(
        { symbol: symbol.toUpperCase() },
        {
          currentPrice: price,
          volume,
          ...otherData,
          lastUpdated: new Date(),
        },
        { new: true }
      );
    });

    const updatedStocks = await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Stock prices updated successfully",
      data: {
        updatedCount: updatedStocks.filter((stock) => stock !== null).length,
        stocks: updatedStocks.filter((stock) => stock !== null),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get real-time quote for a stock (FREE API)
// @route   GET /api/stocks/:symbol/realtime
// @access  Public
export const getRealTimeQuote = async (req, res, next) => {
  try {
    const { symbol } = req.params;

    console.log(`📊 Fetching real-time data for ${symbol}...`);

    // Get real-time data from FREE API
    const realTimeData = await freeStockDataService.getRealTimeQuote(
      symbol.toUpperCase()
    );

    if (!realTimeData) {
      return res.status(404).json({
        success: false,
        message: `Real-time data not available for ${symbol}`,
      });
    }

    // Update database with latest data
    await priceUpdateScheduler.updateSingleStock(symbol.toUpperCase());

    res.status(200).json({
      success: true,
      data: {
        stock: realTimeData,
        source: "Yahoo Finance (FREE)",
        isRealTime: realTimeData.isRealTime,
        lastUpdated: realTimeData.lastUpdated,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get real-time market indices (NIFTY, SENSEX)
// @route   GET /api/stocks/indices
// @access  Public
export const getMarketIndices = async (req, res, next) => {
  try {
    console.log("📊 Fetching market indices...");

    const indices = await freeStockDataService.getIndices();

    res.status(200).json({
      success: true,
      data: {
        indices,
        source: "Yahoo Finance (FREE)",
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Force update all stock prices
// @route   POST /api/stocks/force-update
// @access  Public
export const forceUpdatePrices = async (req, res, next) => {
  try {
    console.log("🔄 Force updating all stock prices...");

    await priceUpdateScheduler.forceUpdateAll();

    res.status(200).json({
      success: true,
      message: "Stock prices updated successfully",
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get price update scheduler status
// @route   GET /api/stocks/update-status
// @access  Public
export const getUpdateStatus = async (req, res, next) => {
  try {
    const status = priceUpdateScheduler.getStatus();

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};
