import Transaction from "../models/Transaction.js";
import Portfolio from "../models/Portfolio.js";
import Stock from "../models/Stock.js";

// Utility to send validation error nicely
const sendValidationError = (res, err) => {
  if (err && err.name === "ValidationError") {
    const details = {};
    for (const key in err.errors) {
      details[key] = err.errors[key].message;
    }
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: details,
    });
  }
  return null;
};

// @desc    Place a new order
// @route   POST /api/transactions/place-order
// @access  Private
export const placeOrder = async (req, res, next) => {
  try {
    // Parse and normalize incoming fields
    const raw = req.body || {};
    const symbol = (raw.symbol || "").toString().toUpperCase();
    const type = (raw.type || raw.action || "").toString().toLowerCase(); // accept "action" too
    const orderType = (raw.orderType || "").toString().toLowerCase();
    const segment = (raw.segment || "equity").toString().toLowerCase();
    const validity = (raw.validity || "day").toString().toLowerCase();
    const quantity = Number(raw.quantity || 0);
    const limitPrice =
      raw.limitPrice !== undefined ? Number(raw.limitPrice) : 0;
    const stopPrice = raw.stopPrice !== undefined ? Number(raw.stopPrice) : 0;
    let price = raw.price !== undefined ? Number(raw.price) : undefined;

    // Basic validations
    if (!symbol) {
      return res
        .status(400)
        .json({ success: false, message: "Symbol is required" });
    }
    if (!["buy", "sell"].includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "type must be 'buy' or 'sell'" });
    }
    if (
      !["market", "limit", "stop_loss", "stop_loss_market"].includes(orderType)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid orderType" });
    }
    if (
      !["equity", "futures", "options", "currency", "commodity"].includes(
        segment
      )
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid segment" });
    }
    if (!quantity || quantity < 1) {
      return res
        .status(400)
        .json({ success: false, message: "quantity must be >= 1" });
    }
    // For limit orders, ensure limitPrice exists
    if (orderType === "limit" && (!limitPrice || limitPrice <= 0)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Limit price is required for limit orders",
        });
    }
    if (
      orderType === "stop_loss" &&
      (!stopPrice || stopPrice <= 0 || !limitPrice || limitPrice <= 0)
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Stop price and limit price are required for stop loss orders",
        });
    }

    // fetch stock (live-data only)
    // Try exact match first, then fallback to prefix-before-dot (e.g., 'TCS.NS' -> 'TCS')
    const prefix = (symbol || "").split(".")[0];
    const stock = await Stock.findOne({
      $or: [{ symbol }, { symbol: prefix }],
      isActive: true,
      isTradable: true,
    });

    if (!stock) {
      return res
        .status(404)
        .json({ success: false, message: "Stock not found or not tradable" });
    }

    // ensure portfolio exists
    let portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (!portfolio) {
      portfolio = await Portfolio.create({
        userId: req.user._id,
        availableCash: 0,
      });
    }

    // Determine order price (market uses current price)
    if (orderType === "market") {
      price =
        price !== undefined && price > 0 ? price : stock.currentPrice || 0;
    } else if (!price || price <= 0) {
      // for non-market, use provided limitPrice if not provided as price
      price = limitPrice || price || stock.currentPrice || 0;
    }

    const grossAmount = quantity * price;

    // Build transaction payload
    const transactionData = {
      userId: req.user._id,
      orderId: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
      symbol,
      companyName: stock.companyName,
      exchange: stock.exchange || "NSE",
      type,
      orderType,
      segment,
      quantity,
      price,
      limitPrice: limitPrice || 0,
      stopPrice: stopPrice || 0,
      grossAmount,
      validity,
      status: "pending",
      pendingQuantity: quantity,
      marketData: {
        ltp: stock.currentPrice || 0,
        open: stock.openPrice || 0,
        high: stock.highPrice || 0,
        low: stock.lowPrice || 0,
        close: stock.previousClose || 0,
        volume: stock.volume || 0,
      },
    };

    // create transaction instance and compute charges
    const transaction = new Transaction(transactionData);
    transaction.calculateCharges();

    // VALIDATIONS: funds / holdings
    if (type === "buy") {
      const requiredAmount =
        transaction.netAmount || transaction.grossAmount || 0;
      portfolio.availableCash = Number(portfolio.availableCash || 0);
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
      // block funds
      portfolio.availableCash = portfolio.availableCash - requiredAmount;
      portfolio.usedMargin = (portfolio.usedMargin || 0) + requiredAmount;
    }

    if (type === "sell") {
      const existingHolding = (portfolio.holdings || []).find(
        (h) => h.symbol === symbol
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

    // Execute immediate for market orders (simulation)
    if (orderType === "market") {
      transaction.status = "completed";
      transaction.executedQuantity = quantity;
      transaction.pendingQuantity = 0;
      transaction.averageExecutionPrice = stock.currentPrice || price;
      transaction.executedAt = new Date();

      // Update portfolio holdings using helper (safe)
      if (typeof portfolio.updateHolding === "function") {
        portfolio.updateHolding(
          symbol,
          quantity,
          transaction.averageExecutionPrice,
          type,
          {
            companyName: stock.companyName,
            exchange: stock.exchange,
          }
        );
      } else {
        // fallback manual: simple adjustment (best-effort)
        const idx = (portfolio.holdings || []).findIndex(
          (h) => h.symbol === symbol
        );
        if (type === "buy") {
          if (idx >= 0) {
            const h = portfolio.holdings[idx];
            const newQty = h.quantity + quantity;
            const newAvg =
              (h.quantity * h.averagePrice +
                quantity * transaction.averageExecutionPrice) /
              newQty;
            portfolio.holdings[idx].quantity = newQty;
            portfolio.holdings[idx].averagePrice = newAvg;
          } else {
            portfolio.holdings.push({
              symbol,
              quantity,
              averagePrice: transaction.averageExecutionPrice,
            });
          }
        } else {
          // sell
          if (idx >= 0) {
            const h = portfolio.holdings[idx];
            if (h.quantity <= quantity) {
              portfolio.holdings.splice(idx, 1);
            } else {
              portfolio.holdings[idx].quantity = h.quantity - quantity;
            }
          }
        }
      }

      // For sells, credit available cash with net proceeds
      if (type === "sell") {
        portfolio.availableCash =
          Number(portfolio.availableCash || 0) +
          Number(transaction.netAmount || transaction.grossAmount || 0);
      }
    }

    // Save transaction & portfolio
    await transaction.save();
    await portfolio.save();

    return res.status(201).json({
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
    // If mongoose validation error, return nice structure
    if (error && error.name === "ValidationError") {
      return sendValidationError(res, error);
    }
    // other errors => pass to next (global error handler)
    next(error);
  }
};

// --------- Other controllers left largely unchanged but with safe parsing ----------

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
    if (type) filters.type = type.toLowerCase();
    if (status) filters.status = status.toLowerCase();
    if (segment) filters.segment = segment.toLowerCase();

    if (startDate || endDate) {
      filters.orderPlacedAt = {};
      if (startDate) filters.orderPlacedAt.$gte = new Date(startDate);
      if (endDate) filters.orderPlacedAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filters)
      .sort({ orderPlacedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

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
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({ success: true, data: { transaction } });
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
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    if (!["pending", "open", "partial"].includes(transaction.status)) {
      return res
        .status(400)
        .json({ success: false, message: "Order cannot be cancelled" });
    }

    // Refund blocked amount for buy orders
    if (transaction.type === "buy" && transaction.pendingQuantity > 0) {
      const portfolio = await Portfolio.findOne({ userId: req.user._id });
      if (portfolio) {
        const refundAmount =
          (transaction.pendingQuantity / transaction.quantity) *
          transaction.netAmount;
        portfolio.availableCash =
          Number(portfolio.availableCash || 0) + Number(refundAmount || 0);
        portfolio.usedMargin = Math.max(
          0,
          Number(portfolio.usedMargin || 0) - Number(refundAmount || 0)
        );
        await portfolio.save();
      }
    }

    // For sell orders: nothing to unblock (holdings remained until execution) - if your design blocked holdings, you'd restore here.

    transaction.status = "cancelled";
    transaction.cancelReason = cancelReason || "Cancelled by user";
    await transaction.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Order cancelled successfully",
        data: { transaction },
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
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    if (!["pending", "open", "partial"].includes(originalTransaction.status)) {
      return res
        .status(400)
        .json({ success: false, message: "Order cannot be modified" });
    }

    // Cancel original order and refund/block adjustments
    originalTransaction.status = "cancelled";
    originalTransaction.cancelReason = "Modified by user";
    await originalTransaction.save();

    // If buy order had blocked funds, refund them (proportionally)
    if (
      originalTransaction.type === "buy" &&
      originalTransaction.pendingQuantity > 0
    ) {
      const portfolio = await Portfolio.findOne({ userId: req.user._id });
      if (portfolio) {
        const refundAmount =
          (originalTransaction.pendingQuantity / originalTransaction.quantity) *
          originalTransaction.netAmount;
        portfolio.availableCash =
          Number(portfolio.availableCash || 0) + Number(refundAmount || 0);
        portfolio.usedMargin = Math.max(
          0,
          Number(portfolio.usedMargin || 0) - Number(refundAmount || 0)
        );
        await portfolio.save();
      }
    }

    // Create new order object using modified params
    const modifiedOrderData = {
      ...originalTransaction.toObject(),
      _id: undefined,
      transactionId: undefined,
      orderId: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
      quantity: Number(quantity || originalTransaction.quantity),
      price: price !== undefined ? Number(price) : originalTransaction.price,
      limitPrice:
        limitPrice !== undefined
          ? Number(limitPrice)
          : originalTransaction.limitPrice,
      stopPrice:
        stopPrice !== undefined
          ? Number(stopPrice)
          : originalTransaction.stopPrice,
      status: "pending",
      modifiedFrom: originalTransaction._id,
      orderPlacedAt: new Date(),
      executedAt: undefined,
    };

    const newTransaction = new Transaction(modifiedOrderData);
    newTransaction.calculateCharges();
    await newTransaction.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Order modified successfully",
        data: { originalTransaction, newTransaction },
      });
  } catch (error) {
    if (error && error.name === "ValidationError")
      return sendValidationError(res, error);
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
    res
      .status(200)
      .json({
        success: true,
        data: { orders: pendingOrders, count: pendingOrders.length },
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

    const filters = { userId: req.user._id, status: "completed" };
    if (startDate || endDate) {
      filters.executedAt = {};
      if (startDate) filters.executedAt.$gte = new Date(startDate);
      if (endDate) filters.executedAt.$lte = new Date(endDate);
    }

    const trades = await Transaction.find(filters)
      .sort({ executedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    const total = await Transaction.countDocuments(filters);

    const summary = await Transaction.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          totalTrades: { $sum: 1 },
          totalBuyValue: {
            $sum: { $cond: [{ $eq: ["$type", "buy"] }, "$netAmount", 0] },
          },
          totalSellValue: {
            $sum: { $cond: [{ $eq: ["$type", "sell"] }, "$netAmount", 0] },
          },
          totalCharges: { $sum: { $ifNull: ["$charges.totalCharges", 0] } },
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
