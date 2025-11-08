import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  averagePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  currentPrice: {
    type: Number,
    default: 0,
  },
  investedAmount: {
    type: Number,
    required: true,
  },
  currentValue: {
    type: Number,
    default: 0,
  },
  pnl: {
    type: Number,
    default: 0,
  },
  pnlPercentage: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Holdings
    holdings: [holdingSchema],

    // Portfolio Summary
    totalInvestedAmount: {
      type: Number,
      default: 0,
    },
    totalCurrentValue: {
      type: Number,
      default: 0,
    },
    totalPnL: {
      type: Number,
      default: 0,
    },
    totalPnLPercentage: {
      type: Number,
      default: 0,
    },
    daysPnL: {
      type: Number,
      default: 0,
    },
    daysPnLPercentage: {
      type: Number,
      default: 0,
    },

    // Available Cash
    availableCash: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Used Margin
    usedMargin: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Available Margin
    availableMargin: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Portfolio Analytics
    diversification: {
      sectorWise: [
        {
          sector: String,
          percentage: Number,
          value: Number,
        },
      ],
      marketCapWise: [
        {
          category: {
            type: String,
            enum: ["Large Cap", "Mid Cap", "Small Cap"],
          },
          percentage: Number,
          value: Number,
        },
      ],
    },

    // Performance Metrics
    performance: {
      oneDay: { type: Number, default: 0 },
      oneWeek: { type: Number, default: 0 },
      oneMonth: { type: Number, default: 0 },
      threeMonths: { type: Number, default: 0 },
      sixMonths: { type: Number, default: 0 },
      oneYear: { type: Number, default: 0 },
      allTime: { type: Number, default: 0 },
    },

    // Last market update
    lastMarketUpdate: {
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

// Indexes for better performance
// Note: `userId` is declared with `unique: true` in the schema which already creates
// an index. Declaring the same index again causes a duplicate-index warning, so
// we avoid redeclaring it here.
portfolioSchema.index({ "holdings.symbol": 1 });
portfolioSchema.index({ lastMarketUpdate: -1 });

// Virtual to calculate total portfolio value
portfolioSchema.virtual("totalPortfolioValue").get(function () {
  return this.totalCurrentValue + this.availableCash;
});

// Method to update portfolio summary
portfolioSchema.methods.updateSummary = function () {
  let totalInvested = 0;
  let totalCurrent = 0;

  this.holdings.forEach((holding) => {
    totalInvested += holding.investedAmount;
    totalCurrent += holding.currentValue;
  });

  this.totalInvestedAmount = totalInvested;
  this.totalCurrentValue = totalCurrent;
  this.totalPnL = totalCurrent - totalInvested;
  this.totalPnLPercentage =
    totalInvested > 0
      ? ((totalCurrent - totalInvested) / totalInvested) * 100
      : 0;
  this.lastMarketUpdate = new Date();
};

// Method to add/update holding
portfolioSchema.methods.updateHolding = function (
  symbol,
  quantity,
  price,
  type = "buy"
) {
  const existingHoldingIndex = this.holdings.findIndex(
    (h) => h.symbol === symbol
  );

  if (existingHoldingIndex !== -1) {
    const holding = this.holdings[existingHoldingIndex];

    if (type === "buy") {
      const totalQuantity = holding.quantity + quantity;
      const totalInvested = holding.investedAmount + quantity * price;
      holding.averagePrice = totalInvested / totalQuantity;
      holding.quantity = totalQuantity;
      holding.investedAmount = totalInvested;
    } else if (type === "sell") {
      holding.quantity -= quantity;
      holding.investedAmount = holding.quantity * holding.averagePrice;

      // Remove holding if quantity becomes 0
      if (holding.quantity <= 0) {
        this.holdings.splice(existingHoldingIndex, 1);
      }
    }
  } else if (type === "buy") {
    // Add new holding
    this.holdings.push({
      symbol,
      quantity,
      averagePrice: price,
      investedAmount: quantity * price,
      currentPrice: price,
      currentValue: quantity * price,
      lastUpdated: new Date(),
    });
  }

  this.updateSummary();
};

// Method to update current prices
portfolioSchema.methods.updateCurrentPrices = function (priceData) {
  this.holdings.forEach((holding) => {
    if (priceData[holding.symbol]) {
      holding.currentPrice = priceData[holding.symbol];
      holding.currentValue = holding.quantity * holding.currentPrice;
      holding.pnl = holding.currentValue - holding.investedAmount;
      holding.pnlPercentage =
        holding.investedAmount > 0
          ? ((holding.currentValue - holding.investedAmount) /
              holding.investedAmount) *
            100
          : 0;
      holding.lastUpdated = new Date();
    }
  });

  this.updateSummary();
};

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;
