import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    // Basic Stock Information
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      // `unique: true` already creates an index for `symbol`. Remove the explicit
      // `index: true` to avoid duplicate index warnings.
    },
    companyName: {
      type: String,
      required: true,
      index: true,
    },
    isin: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Exchange Information
    exchange: {
      type: String,
      required: true,
      enum: ["NSE", "BSE", "MCX"],
      default: "NSE",
    },
    segment: {
      type: String,
      required: true,
      enum: ["equity", "futures", "options", "currency", "commodity"],
      default: "equity",
    },

    // Market Data
    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    openPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    highPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    lowPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    previousClose: {
      type: Number,
      required: true,
      min: 0,
    },

    // Price Change
    change: {
      type: Number,
      default: 0,
    },
    changePercent: {
      type: Number,
      default: 0,
    },

    // Volume and Value
    volume: {
      type: Number,
      default: 0,
      min: 0,
    },
    value: {
      type: Number,
      default: 0,
      min: 0,
    },
    avgVolume: {
      type: Number,
      default: 0,
    },

    // Market Cap and Valuation
    marketCap: {
      type: Number,
      min: 0,
    },
    sharesOutstanding: {
      type: Number,
      min: 0,
    },

    // Trading Limits
    upperCircuit: {
      type: Number,
      min: 0,
    },
    lowerCircuit: {
      type: Number,
      min: 0,
    },

    // 52-week data
    fiftyTwoWeekHigh: {
      type: Number,
      min: 0,
    },
    fiftyTwoWeekLow: {
      type: Number,
      min: 0,
    },

    // Company Classification
    sector: {
      type: String,
      // `sector` is indexed via `stockSchema.index({ sector: 1 })` below. Avoid
      // `index: true` here to prevent duplicate-index warnings.
    },
    industry: {
      type: String,
    },
    marketCapCategory: {
      type: String,
      enum: ["Large Cap", "Mid Cap", "Small Cap"],
      // Index declared via `stockSchema.index({ marketCapCategory: 1 })` below.
    },

    // Financial Ratios
    pe: {
      type: Number, // Price to Earnings
      min: 0,
    },
    pb: {
      type: Number, // Price to Book
      min: 0,
    },
    eps: {
      type: Number, // Earnings Per Share
    },
    bookValue: {
      type: Number,
      min: 0,
    },
    dividendYield: {
      type: Number,
      min: 0,
      max: 100,
    },

    // Options Data (for options contracts)
    optionData: {
      optionType: {
        type: String,
        enum: ["call", "put"],
      },
      strikePrice: {
        type: Number,
        min: 0,
      },
      expiryDate: {
        type: Date,
      },
      impliedVolatility: {
        type: Number,
        min: 0,
      },
      delta: Number,
      gamma: Number,
      theta: Number,
      vega: Number,
      openInterest: {
        type: Number,
        min: 0,
      },
    },

    // Futures Data
    futuresData: {
      expiryDate: {
        type: Date,
      },
      openInterest: {
        type: Number,
        min: 0,
      },
      changeInOI: {
        type: Number,
      },
    },

    // Status and Flags
    isActive: {
      type: Boolean,
      default: true,
    },
    isTradable: {
      type: Boolean,
      default: true,
    },
    isInWatchlist: {
      type: Boolean,
      default: false,
    },

    // Timestamps
    lastTradeTime: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    // Historical data reference
    historicalDataUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
stockSchema.index({ symbol: 1, exchange: 1 });
stockSchema.index({ companyName: "text", symbol: "text" });
stockSchema.index({ sector: 1 });
stockSchema.index({ marketCapCategory: 1 });
stockSchema.index({ lastUpdated: -1 });
stockSchema.index({ changePercent: -1 });
stockSchema.index({ volume: -1 });

// Virtual for market status
stockSchema.virtual("marketStatus").get(function () {
  const now = new Date();
  const marketOpen = new Date();
  const marketClose = new Date();

  marketOpen.setHours(9, 15, 0, 0);
  marketClose.setHours(15, 30, 0, 0);

  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const isMarketHours = now >= marketOpen && now <= marketClose;

  if (isWeekend) return "closed";
  if (isMarketHours) return "open";
  if (now < marketOpen) return "pre-market";
  return "post-market";
});

// Pre-save middleware to calculate change and change percentage
stockSchema.pre("save", function (next) {
  if (this.currentPrice && this.previousClose) {
    this.change = this.currentPrice - this.previousClose;
    this.changePercent =
      this.previousClose > 0
        ? ((this.currentPrice - this.previousClose) / this.previousClose) * 100
        : 0;
  }

  this.lastUpdated = new Date();
  next();
});

// Method to update market data
stockSchema.methods.updateMarketData = function (marketData) {
  Object.assign(this, marketData);
  this.lastUpdated = new Date();
  return this.save();
};

// Static method to get trending stocks
stockSchema.statics.getTrendingStocks = function (limit = 10) {
  return this.find({ isActive: true, isTradable: true })
    .sort({ volume: -1, changePercent: -1 })
    .limit(limit)
    .select("symbol companyName currentPrice change changePercent volume");
};

// Static method to get top gainers
stockSchema.statics.getTopGainers = function (limit = 10) {
  return this.find({
    isActive: true,
    isTradable: true,
    changePercent: { $gt: 0 },
  })
    .sort({ changePercent: -1 })
    .limit(limit)
    .select("symbol companyName currentPrice change changePercent volume");
};

// Static method to get top losers
stockSchema.statics.getTopLosers = function (limit = 10) {
  return this.find({
    isActive: true,
    isTradable: true,
    changePercent: { $lt: 0 },
  })
    .sort({ changePercent: 1 })
    .limit(limit)
    .select("symbol companyName currentPrice change changePercent volume");
};

// Static method to search stocks
stockSchema.statics.searchStocks = function (query, limit = 20) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { symbol: { $regex: query, $options: "i" } },
          { companyName: { $regex: query, $options: "i" } },
        ],
      },
    ],
  })
    .limit(limit)
    .select(
      "symbol companyName currentPrice change changePercent exchange sector"
    );
};

// Static method to get stocks by sector
stockSchema.statics.getStocksBySector = function (sector, limit = 50) {
  return this.find({
    sector: sector,
    isActive: true,
    isTradable: true,
  })
    .sort({ marketCap: -1 })
    .limit(limit)
    .select("symbol companyName currentPrice change changePercent marketCap");
};

const Stock = mongoose.model("Stock", stockSchema);

export default Stock;
