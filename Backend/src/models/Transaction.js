import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Transaction Details
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },

    // Stock Details
    symbol: {
      type: String,
      required: true,
      uppercase: true,
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

    // Transaction Type
    type: {
      type: String,
      required: true,
      enum: ["buy", "sell"],
    },
    orderType: {
      type: String,
      required: true,
      enum: ["market", "limit", "stop_loss", "stop_loss_market"],
    },
    segment: {
      type: String,
      required: true,
      enum: ["equity", "futures", "options", "currency", "commodity"],
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
    },
    stopPrice: {
      type: Number,
      default: 0,
    },

    // Financial Details
    grossAmount: {
      type: Number,
      required: true,
    },

    // Charges Breakdown
    charges: {
      brokerage: {
        type: Number,
        default: 0,
      },
      stt: {
        // Securities Transaction Tax
        type: Number,
        default: 0,
      },
      transactionCharges: {
        type: Number,
        default: 0,
      },
      gst: {
        type: Number,
        default: 0,
      },
      sebiCharges: {
        type: Number,
        default: 0,
      },
      stampCharges: {
        type: Number,
        default: 0,
      },
      dpCharges: {
        type: Number,
        default: 0,
      },
      totalCharges: {
        type: Number,
        default: 0,
      },
    },

    netAmount: {
      type: Number,
      required: true,
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
    },

    // Execution Details
    executedQuantity: {
      type: Number,
      default: 0,
    },
    pendingQuantity: {
      type: Number,
      default: 0,
    },
    averageExecutionPrice: {
      type: Number,
      default: 0,
    },

    // Timestamps
    orderPlacedAt: {
      type: Date,
      default: Date.now,
    },
    executedAt: {
      type: Date,
    },

    // Validity
    validity: {
      type: String,
      enum: ["day", "ioc", "gtc"], // Day, Immediate or Cancel, Good Till Cancelled
      default: "day",
    },

    // Options specific fields (for F&O)
    optionType: {
      type: String,
      enum: ["call", "put"],
    },
    strikePrice: {
      type: Number,
    },
    expiryDate: {
      type: Date,
    },

    // Additional Details
    remarks: {
      type: String,
      maxlength: 500,
    },
    source: {
      type: String,
      enum: ["web", "mobile", "api"],
      default: "web",
    },

    // Market Data at time of order
    marketData: {
      ltp: Number, // Last Traded Price
      open: Number,
      high: Number,
      low: Number,
      close: Number,
      volume: Number,
    },

    // Cancel/Modify Details
    cancelReason: String,
    modifiedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
transactionSchema.index({ userId: 1, createdAt: -1 });
// `transactionId` is declared with `unique: true` above which creates an index automatically.
// Avoid declaring the same index twice to prevent duplicate-index warnings.
transactionSchema.index({ orderId: 1 });
transactionSchema.index({ symbol: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ orderPlacedAt: -1 });

// Pre-save middleware to generate transaction ID
transactionSchema.pre("save", function (next) {
  if (this.isNew && !this.transactionId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.transactionId = `TXN${timestamp}${random}`;
  }

  // Calculate pending quantity
  this.pendingQuantity = this.quantity - this.executedQuantity;

  // Calculate total charges
  const charges = this.charges;
  charges.totalCharges =
    charges.brokerage +
    charges.stt +
    charges.transactionCharges +
    charges.gst +
    charges.sebiCharges +
    charges.stampCharges +
    charges.dpCharges;

  // Calculate net amount
  if (this.type === "buy") {
    this.netAmount = this.grossAmount + charges.totalCharges;
  } else {
    this.netAmount = this.grossAmount - charges.totalCharges;
  }

  next();
});

// Virtual for profit/loss (for sell transactions)
transactionSchema.virtual("pnl").get(function () {
  if (this.type === "sell") {
    return this.netAmount; // This would need to be calculated against buy price
  }
  return 0;
});

// Method to calculate charges based on transaction
transactionSchema.methods.calculateCharges = function () {
  const grossAmount = this.grossAmount;
  const charges = {};

  // Basic charge calculation (simplified)
  // In production, you'd have more complex calculations based on segment, exchange, etc.

  if (this.segment === "equity") {
    if (this.type === "buy" || this.type === "sell") {
      charges.brokerage =
        this.segment === "equity" && this.orderType === "delivery"
          ? 0
          : Math.min(grossAmount * 0.0003, 20);
      charges.stt =
        this.type === "sell" ? grossAmount * 0.001 : grossAmount * 0.001;
      charges.transactionCharges = grossAmount * 0.00297;
      charges.sebiCharges = grossAmount * 0.000001;
      charges.stampCharges = this.type === "buy" ? grossAmount * 0.00015 : 0;
      charges.dpCharges = this.type === "sell" ? 15.34 : 0;
    }
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

  // GST on total charges (except STT and stamp charges)
  const gstableAmount =
    charges.brokerage + charges.transactionCharges + charges.sebiCharges;
  charges.gst = gstableAmount * 0.18;

  this.charges = charges;
  return charges;
};

// Static method to get user transactions with filters
transactionSchema.statics.getUserTransactions = function (
  userId,
  filters = {}
) {
  const query = { userId };

  if (filters.symbol) {
    query.symbol = filters.symbol;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.segment) {
    query.segment = filters.segment;
  }

  if (filters.startDate || filters.endDate) {
    query.orderPlacedAt = {};
    if (filters.startDate) {
      query.orderPlacedAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.orderPlacedAt.$lte = new Date(filters.endDate);
    }
  }

  return this.find(query)
    .sort({ orderPlacedAt: -1 })
    .populate("userId", "firstName lastName email");
};

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
