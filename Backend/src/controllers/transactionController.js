import Transaction from "../models/Transaction.js";
import Portfolio from "../models/Portfolio.js";
import Stock from "../models/Stock.js";

// @desc    Place a new order
// @route   POST /api/transactions/place-order
// @access  Private
export const placeOrder = async (req, res, next) => {
  try {
    const {
      symbol,
      type,
      orderType,
      quantity,
      price,
      limitPrice,
      stopPrice,
      segment = "equity",
      validity = "day",
    } = req.body;

    // Get stock details
    const stock = await Stock.findOne({
      symbol: symbol.toUpperCase(),
      isActive: true,
      isTradable: true,
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found or not tradable",
      });
    }

    // Get user's portfolio
    let portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: req.user._id });
    }

    // Validate order based on type
    let orderPrice = price || stock.currentPrice;

    if (orderType === "limit" && !limitPrice) {
      return res.status(400).json({
        success: false,
        message: "Limit price is required for limit orders",
      });
    }

    if (orderType === "stop_loss" && (!stopPrice || !limitPrice)) {
      return res.status(400).json({
        success: false,
        message: "Stop price and limit price are required for stop loss orders",
      });
    }

    if (orderType === "limit") {
      orderPrice = limitPrice;
    }

    const grossAmount = quantity * orderPrice;

    // Create transaction object
    const transactionData = {
      userId: req.user._id,
      orderId: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
      symbol: symbol.toUpperCase(),
      companyName: stock.companyName,
      exchange: stock.exchange,
      type,
      orderType,
      segment,
      quantity,
      price: orderPrice,
      limitPrice: limitPrice || 0,
      stopPrice: stopPrice || 0,
      grossAmount,
      validity,
      status: "pending",
      pendingQuantity: quantity,
      marketData: {
        ltp: stock.currentPrice,
        open: stock.openPrice,
        high: stock.highPrice,
        low: stock.lowPrice,
        close: stock.previousClose,
        volume: stock.volume,
      },
    };

    // Calculate charges
    const transaction = new Transaction(transactionData);
    transaction.calculateCharges();

    // Validate available funds for buy orders
    if (type === "buy") {
      const requiredAmount = transaction.netAmount;
      if (portfolio.availableCash < requiredAmount) {
        return res.status(400).json({
          success: false,
          message: "Insufficient funds",
          data: {
            required: requiredAmount,
            available: portfolio.availableCash,
            shortfall: requiredAmount - portfolio.availableCash,
          },
        });
      }

      // Block the funds
      portfolio.availableCash -= requiredAmount;
      portfolio.usedMargin += requiredAmount;
    }

    // Validate holdings for sell orders
    if (type === "sell") {
      const existingHolding = portfolio.holdings.find(
        (h) => h.symbol === symbol.toUpperCase()
      );
      if (!existingHolding || existingHolding.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: "Insufficient holdings",
          data: {
            required: quantity,
            available: existingHolding ? existingHolding.quantity : 0,
          },
        });
      }
    }

    // For market orders, execute immediately (simulation)
    if (orderType === "market") {
      transaction.status = "completed";
      transaction.executedQuantity = quantity;
      transaction.pendingQuantity = 0;
      transaction.averageExecutionPrice = stock.currentPrice;
      transaction.executedAt = new Date();

      // Update portfolio
      portfolio.updateHolding(
        symbol.toUpperCase(),
        quantity,
        stock.currentPrice,
        type
      );

      if (type === "sell") {
        // Add proceeds to available cash
        portfolio.availableCash += transaction.netAmount;
      }
    }

    await transaction.save();
    await portfolio.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: {
        transaction,
        portfolioUpdate: {
          availableCash: portfolio.availableCash,
          usedMargin: portfolio.usedMargin,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user transactions
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      symbol,
      type,
      status,
      segment,
      startDate,
      endDate,
    } = req.query;

    const filters = { userId: req.user._id };

    if (symbol) filters.symbol = symbol.toUpperCase();
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (segment) filters.segment = segment;

    if (startDate || endDate) {
      filters.orderPlacedAt = {};
      if (startDate) filters.orderPlacedAt.$gte = new Date(startDate);
      if (endDate) filters.orderPlacedAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filters)
      .sort({ orderPlacedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filters);

    res.status(200).json({
      success: true,
      data: {
        transactions,
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

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an order
// @route   PUT /api/transactions/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const { cancelReason } = req.body;

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (!["pending", "open", "partial"].includes(transaction.status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled",
      });
    }

    // Update transaction status
    transaction.status = "cancelled";
    transaction.cancelReason = cancelReason || "Cancelled by user";

    // Refund blocked amount for buy orders
    if (transaction.type === "buy" && transaction.pendingQuantity > 0) {
      const portfolio = await Portfolio.findOne({ userId: req.user._id });
      if (portfolio) {
        const refundAmount =
          (transaction.pendingQuantity / transaction.quantity) *
          transaction.netAmount;
        portfolio.availableCash += refundAmount;
        portfolio.usedMargin -= refundAmount;
        await portfolio.save();
      }
    }

    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Modify an order
// @route   PUT /api/transactions/:id/modify
// @access  Private
export const modifyOrder = async (req, res, next) => {
  try {
    const { quantity, price, limitPrice, stopPrice } = req.body;

    const originalTransaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!originalTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (!["pending", "open", "partial"].includes(originalTransaction.status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be modified",
      });
    }

    // Cancel original order
    originalTransaction.status = "cancelled";
    originalTransaction.cancelReason = "Modified by user";
    await originalTransaction.save();

    // Create new order with modified parameters
    const modifiedOrderData = {
      ...originalTransaction.toObject(),
      _id: undefined,
      transactionId: undefined,
      orderId: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
      quantity: quantity || originalTransaction.quantity,
      price: price || originalTransaction.price,
      limitPrice: limitPrice || originalTransaction.limitPrice,
      stopPrice: stopPrice || originalTransaction.stopPrice,
      status: "pending",
      modifiedFrom: originalTransaction._id,
      orderPlacedAt: new Date(),
      executedAt: undefined,
    };

    const newTransaction = new Transaction(modifiedOrderData);
    newTransaction.calculateCharges();
    await newTransaction.save();

    res.status(200).json({
      success: true,
      message: "Order modified successfully",
      data: {
        originalTransaction,
        newTransaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order book (pending orders)
// @route   GET /api/transactions/order-book
// @access  Private
export const getOrderBook = async (req, res, next) => {
  try {
    const pendingOrders = await Transaction.find({
      userId: req.user._id,
      status: { $in: ["pending", "open", "partial"] },
    }).sort({ orderPlacedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        orders: pendingOrders,
        count: pendingOrders.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trade history (completed transactions)
// @route   GET /api/transactions/trade-history
// @access  Private
export const getTradeHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;

    const filters = {
      userId: req.user._id,
      status: "completed",
    };

    if (startDate || endDate) {
      filters.executedAt = {};
      if (startDate) filters.executedAt.$gte = new Date(startDate);
      if (endDate) filters.executedAt.$lte = new Date(endDate);
    }

    const trades = await Transaction.find(filters)
      .sort({ executedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filters);

    // Calculate summary statistics
    const summary = await Transaction.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          totalTrades: { $sum: 1 },
          totalBuyValue: {
            $sum: {
              $cond: [{ $eq: ["$type", "buy"] }, "$netAmount", 0],
            },
          },
          totalSellValue: {
            $sum: {
              $cond: [{ $eq: ["$type", "sell"] }, "$netAmount", 0],
            },
          },
          totalCharges: { $sum: "$charges.totalCharges" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        trades,
        summary: summary[0] || {
          totalTrades: 0,
          totalBuyValue: 0,
          totalSellValue: 0,
          totalCharges: 0,
        },
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
