import cron from "node-cron";
import Stock from "../models/Stock.js";
import freeStockDataService from "./freeStockDataService.js";

class PriceUpdateScheduler {
  constructor() {
    this.isRunning = false;
    this.updateInterval = null;
  }

  // Start real-time price updates
  startPriceUpdates() {
    console.log("🚀 Starting FREE real-time price updates...");

    // Update prices every 2 minutes during market hours (FREE tier friendly)
    this.updateInterval = cron.schedule(
      "*/2 * * * *",
      async () => {
        if (freeStockDataService.checkMarketHours()) {
          await this.updateAllStockPrices();
        } else {
          console.log("📴 Market closed - skipping price updates");
        }
      },
      {
        scheduled: false,
      }
    );

    // Start the cron job
    this.updateInterval.start();
    this.isRunning = true;

    // Also run an immediate update
    this.updateAllStockPrices();

    console.log(
      "✅ Price update scheduler started (every 2 minutes during market hours)"
    );
  }

  // Stop price updates
  stopPriceUpdates() {
    if (this.updateInterval) {
      this.updateInterval.stop();
      this.isRunning = false;
      console.log("⏹️ Price update scheduler stopped");
    }
  }

  // Update all stock prices from database
  async updateAllStockPrices() {
    try {
      console.log("📊 Updating stock prices...");

      // Get all active stocks from database
      const stocks = await Stock.find({ isActive: true }).select("symbol");

      if (stocks.length === 0) {
        console.log("No active stocks found in database");
        return;
      }

      const symbols = stocks.map((stock) => stock.symbol);
      console.log(`Updating ${symbols.length} stocks: ${symbols.join(", ")}`);

      // Get real-time data for all stocks (FREE)
      const realTimeData = await freeStockDataService.getMultipleQuotes(
        symbols
      );

      if (realTimeData.length === 0) {
        console.log("❌ No real-time data received");
        return;
      }

      // Update database with new prices
      let updatedCount = 0;

      for (const stockData of realTimeData) {
        try {
          const updateResult = await Stock.updateOne(
            { symbol: stockData.symbol },
            {
              $set: {
                currentPrice: stockData.currentPrice,
                openPrice: stockData.openPrice,
                highPrice: stockData.highPrice,
                lowPrice: stockData.lowPrice,
                previousClose: stockData.previousClose,
                change: stockData.change,
                changePercent: stockData.changePercent,
                volume: stockData.volume,
                marketCap: stockData.marketCap,
                fiftyTwoWeekHigh: stockData.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: stockData.fiftyTwoWeekLow,
                pe: stockData.pe,
                eps: stockData.eps,
                dividendYield: stockData.dividendYield,
                lastUpdated: new Date(),
                lastTradeTime: new Date(),
              },
            }
          );

          if (updateResult.modifiedCount > 0) {
            updatedCount++;
          }
        } catch (error) {
          console.error(`Error updating ${stockData.symbol}:`, error.message);
        }
      }

      console.log(
        `✅ Successfully updated ${updatedCount}/${realTimeData.length} stocks`
      );

      // Log some sample prices
      if (realTimeData.length > 0) {
        const sample = realTimeData.slice(0, 3);
        sample.forEach((stock) => {
          const changeColor = stock.change >= 0 ? "📈" : "📉";
          console.log(
            `${changeColor} ${stock.symbol}: ₹${stock.currentPrice} (${
              stock.change >= 0 ? "+" : ""
            }${stock.change.toFixed(2)})`
          );
        });
      }
    } catch (error) {
      console.error("❌ Error in price update scheduler:", error.message);
    }
  }

  // Update single stock price
  async updateSingleStock(symbol) {
    try {
      console.log(`📊 Updating single stock: ${symbol}`);

      const realTimeData = await freeStockDataService.getRealTimeQuote(symbol);

      if (!realTimeData) {
        console.log(`❌ No data received for ${symbol}`);
        return null;
      }

      // Update database
      const updateResult = await Stock.updateOne(
        { symbol: symbol },
        {
          $set: {
            currentPrice: realTimeData.currentPrice,
            openPrice: realTimeData.openPrice,
            highPrice: realTimeData.highPrice,
            lowPrice: realTimeData.lowPrice,
            previousClose: realTimeData.previousClose,
            change: realTimeData.change,
            changePercent: realTimeData.changePercent,
            volume: realTimeData.volume,
            marketCap: realTimeData.marketCap,
            fiftyTwoWeekHigh: realTimeData.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: realTimeData.fiftyTwoWeekLow,
            pe: realTimeData.pe,
            eps: realTimeData.eps,
            dividendYield: realTimeData.dividendYield,
            lastUpdated: new Date(),
            lastTradeTime: new Date(),
          },
        }
      );

      if (updateResult.modifiedCount > 0) {
        const changeColor = realTimeData.change >= 0 ? "📈" : "📉";
        console.log(
          `✅ ${changeColor} ${symbol}: ₹${realTimeData.currentPrice} (${
            realTimeData.change >= 0 ? "+" : ""
          }${realTimeData.change.toFixed(2)})`
        );
        return realTimeData;
      } else {
        console.log(`⚠️ No changes made to ${symbol}`);
        return realTimeData;
      }
    } catch (error) {
      console.error(`❌ Error updating ${symbol}:`, error.message);
      return null;
    }
  }

  // Get current status
  getStatus() {
    return {
      isRunning: this.isRunning,
      isMarketOpen: freeStockDataService.checkMarketHours(),
      lastUpdate: new Date(),
      updateFrequency: "2 minutes",
    };
  }

  // Force update all prices (manual trigger)
  async forceUpdateAll() {
    console.log("🔄 Force updating all stock prices...");
    await this.updateAllStockPrices();
  }
}

export default new PriceUpdateScheduler();
