import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Transaction Details
    transactionId: {
      type: String,
      unique: true,
      // keep not required
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },

    // Stock Details
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    exchange: {
      type: String,
      required: true,
      enum: ["NSE", "BSE", "MCX"],
      default: "NSE",
    },

    // Transaction Type (lowercase strings expected: "buy" / "sell")
    type: {
      type: String,
      required: true,
      enum: ["buy", "sell"],
      lowercase: true,
      index: true,
    },
    orderType: {
      type: String,
      required: true,
      enum: ["market", "limit", "stop_loss", "stop_loss_market"],
      lowercase: true,
    },
    segment: {
      type: String,
      required: true,
      // include 'cash' for deposit/withdrawal transactions
      enum: ["equity", "futures", "options", "currency", "commodity", "cash"],
      lowercase: true,
    },

    // Quantity and Pricing
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    limitPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    stopPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Financial Details
    grossAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Charges Breakdown
    charges: {
      brokerage: { type: Number, default: 0, min: 0 },
      stt: { type: Number, default: 0, min: 0 },
      transactionCharges: { type: Number, default: 0, min: 0 },
      gst: { type: Number, default: 0, min: 0 },
      sebiCharges: { type: Number, default: 0, min: 0 },
      stampCharges: { type: Number, default: 0, min: 0 },
      dpCharges: { type: Number, default: 0, min: 0 },
      totalCharges: { type: Number, default: 0, min: 0 },
    },

    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Order Status
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "open",
        "completed",
        "cancelled",
        "rejected",
        "partial",
      ],
      default: "pending",
      lowercase: true,
      index: true,
    },

    // Execution Details
    executedQuantity: { type: Number, default: 0, min: 0 },
    pendingQuantity: { type: Number, default: 0, min: 0 },
    averageExecutionPrice: { type: Number, default: 0, min: 0 },

    // Timestamps
    orderPlacedAt: { type: Date, default: Date.now, index: true },
    executedAt: { type: Date },

    // Validity
    validity: {
      type: String,
      enum: ["day", "ioc", "gtc"],
      default: "day",
      lowercase: true,
    },

    // Options specific fields (for F&O)
    optionType: { type: String, enum: ["call", "put"], lowercase: true },
    strikePrice: { type: Number },
    expiryDate: { type: Date },

    // Additional Details
    remarks: { type: String, maxlength: 500 },
    source: { type: String, enum: ["web", "mobile", "api"], default: "web" },

    // Market Data at time of order
    marketData: {
      ltp: { type: Number, default: 0 },
      open: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      close: { type: Number, default: 0 },
      volume: { type: Number, default: 0 },
    },

    // Cancel/Modify Details
    cancelReason: String,
    modifiedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// indexes (already applied on fields where useful)
// keep these to speed queries:
transactionSchema.index({ userId: 1, createdAt: -1 });
// `transactionId` is declared with `unique: true` above which creates an index automatically.
// Avoid declaring the same index twice to prevent duplicate-index warnings.
transactionSchema.index({ orderId: 1 });
transactionSchema.index({ symbol: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ orderPlacedAt: -1 });

// Ensure charges object exists before validation/saving
transactionSchema.pre("validate", function (next) {
  if (!this.charges) {
    this.charges = {
      brokerage: 0,
      stt: 0,
      transactionCharges: 0,
      gst: 0,
      sebiCharges: 0,
      stampCharges: 0,
      dpCharges: 0,
      totalCharges: 0,
    };
  }
  next();
});

// Pre-save middleware to generate transaction ID and compute derived fields
transactionSchema.pre("save", function (next) {
  if (this.isNew && !this.transactionId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.transactionId = `TXN${timestamp}${random}`;
  }

  // Calculate pending quantity
  this.pendingQuantity = Math.max(
    0,
    (this.quantity || 0) - (this.executedQuantity || 0)
  );

  // Ensure charges.totalCharges exists
  const charges = this.charges || {};
  charges.totalCharges =
    (charges.brokerage || 0) +
    (charges.stt || 0) +
    (charges.transactionCharges || 0) +
    (charges.gst || 0) +
    (charges.sebiCharges || 0) +
    (charges.stampCharges || 0) +
    (charges.dpCharges || 0);
  this.charges = charges;

  // Calculate net amount (buy adds charges, sell subtracts)
  if (this.type === "buy") {
    this.netAmount = (this.grossAmount || 0) + (charges.totalCharges || 0);
  } else if (this.type === "sell") {
    this.netAmount = (this.grossAmount || 0) - (charges.totalCharges || 0);
  } else {
    // Fallback
    this.netAmount = this.grossAmount || 0;
  }

  next();
});

// Virtual for profit/loss (basic)
transactionSchema.virtual("pnl").get(function () {
  if (this.type === "sell") {
    return this.netAmount;
  }
  return 0;
});

// Method to calculate charges based on transaction
transactionSchema.methods.calculateCharges = function () {
  const grossAmount = this.grossAmount || 0;
  const charges = {
    brokerage: 0,
    stt: 0,
    transactionCharges: 0,
    gst: 0,
    sebiCharges: 0,
    stampCharges: 0,
    dpCharges: 0,
    totalCharges: 0,
  };

  // Basic charge calculation (simplified)
  try {
    if (this.segment === "equity") {
      charges.brokerage =
        this.orderType === "delivery" ? 0 : Math.min(grossAmount * 0.0003, 20);
      charges.stt = grossAmount * 0.001; // conservative
      charges.transactionCharges = grossAmount * 0.00297;
      charges.sebiCharges = grossAmount * 0.000001;
      charges.stampCharges = this.type === "buy" ? grossAmount * 0.00015 : 0;
      charges.dpCharges = this.type === "sell" ? 15.34 : 0;
    } else if (this.segment === "futures") {
      charges.brokerage = Math.min(grossAmount * 0.0003, 20);
      charges.stt = this.type === "sell" ? grossAmount * 0.0001 : 0;
      charges.transactionCharges = grossAmount * 0.00173;
      charges.sebiCharges = grossAmount * 0.000001;
      charges.stampCharges = this.type === "buy" ? grossAmount * 0.00002 : 0;
    } else if (this.segment === "options") {
      charges.brokerage = 20;
      charges.stt = this.type === "sell" ? grossAmount * 0.00125 : 0;
      charges.transactionCharges = grossAmount * 0.03503;
      charges.sebiCharges = grossAmount * 0.000001;
      charges.stampCharges = this.type === "buy" ? grossAmount * 0.00003 : 0;
    }

    const gstableAmount =
      (charges.brokerage || 0) +
      (charges.transactionCharges || 0) +
      (charges.sebiCharges || 0);
    charges.gst = gstableAmount * 0.18;

    charges.totalCharges =
      (charges.brokerage || 0) +
      (charges.stt || 0) +
      (charges.transactionCharges || 0) +
      (charges.gst || 0) +
      (charges.sebiCharges || 0) +
      (charges.stampCharges || 0) +
      (charges.dpCharges || 0);

    this.charges = charges;

    // recompute netAmount
    if (this.type === "buy")
      this.netAmount = (this.grossAmount || 0) + charges.totalCharges;
    else this.netAmount = (this.grossAmount || 0) - charges.totalCharges;

    return charges;
  } catch (err) {
    // fallback safe values
    this.charges = charges;
    this.netAmount = this.grossAmount || 0;
    return charges;
  }
};

// Static helper to fetch user transactions with filters
transactionSchema.statics.getUserTransactions = function (
  userId,
  filters = {}
) {
  const query = { userId };

  if (filters.symbol) query.symbol = filters.symbol;
  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  if (filters.segment) query.segment = filters.segment;

  if (filters.startDate || filters.endDate) {
    query.orderPlacedAt = {};
    if (filters.startDate)
      query.orderPlacedAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.orderPlacedAt.$lte = new Date(filters.endDate);
  }

  return this.find(query)
    .sort({ orderPlacedAt: -1 })
    .populate("userId", "firstName lastName email");
};

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
