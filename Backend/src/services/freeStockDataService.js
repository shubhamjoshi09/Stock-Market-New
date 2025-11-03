import yahooFinance from "yahoo-finance2";
import axios from "axios";

class FreeStockDataService {
  constructor() {
    this.isMarketOpen = this.checkMarketHours();
  }

  // Check if Indian market is open (9:15 AM to 3:30 PM IST)
  checkMarketHours() {
    const now = new Date();
    const istTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const day = istTime.getDay(); // 0 = Sunday, 6 = Saturday

    // Weekend check
    if (day === 0 || day === 6) return false;

    // Market hours: 9:15 AM to 3:30 PM
    const marketStart = 9 * 60 + 15; // 9:15 AM in minutes
    const marketEnd = 15 * 60 + 30; // 3:30 PM in minutes
    const currentTime = hours * 60 + minutes;

    return currentTime >= marketStart && currentTime <= marketEnd;
  }

  // Convert Indian symbols to Yahoo Finance format
  getYahooSymbol(indianSymbol) {
    const symbolMap = {
      RELIANCE: "RELIANCE.NS",
      TCS: "TCS.NS",
      HDFCBANK: "HDFCBANK.NS",
      INFY: "INFY.NS",
      HINDUNILVR: "HINDUNILVR.NS",
      ICICIBANK: "ICICIBANK.NS",
      SBIN: "SBIN.NS",
      BHARTIARTL: "BHARTIARTL.NS",
      KOTAKBANK: "KOTAKBANK.NS",
      LT: "LT.NS",
      ITC: "ITC.NS",
      HCLTECH: "HCLTECH.NS",
      ASIANPAINT: "ASIANPAINT.NS",
      MARUTI: "MARUTI.NS",
      WIPRO: "WIPRO.NS",
    };

    return symbolMap[indianSymbol] || `${indianSymbol}.NS`;
  }

  // Get real-time quote from Yahoo Finance (FREE)
  async getRealTimeQuote(symbol) {
    // For development, use mock data directly to avoid API issues
    if (process.env.NODE_ENV === "development" || !this.isMarketOpen) {
      console.log(`Using mock data for ${symbol} (dev mode or market closed)`);
      return this.getMockQuote(symbol);
    }

    try {
      const yahooSymbol = this.getYahooSymbol(symbol);

      // Try different Yahoo Finance methods
      let quote = null;

      try {
        // Try quoteSummary first
        const result = await yahooFinance.quoteSummary(yahooSymbol, {
          modules: ["price", "summaryDetail"],
        });
        if (result && result.price) {
          quote = {
            regularMarketPrice:
              result.price.regularMarketPrice?.raw ||
              result.price.regularMarketPrice,
            regularMarketOpen:
              result.price.regularMarketOpen?.raw ||
              result.price.regularMarketOpen,
            regularMarketDayHigh:
              result.price.regularMarketDayHigh?.raw ||
              result.price.regularMarketDayHigh,
            regularMarketDayLow:
              result.price.regularMarketDayLow?.raw ||
              result.price.regularMarketDayLow,
            regularMarketPreviousClose:
              result.price.regularMarketPreviousClose?.raw ||
              result.price.regularMarketPreviousClose,
            regularMarketChange:
              result.price.regularMarketChange?.raw ||
              result.price.regularMarketChange,
            regularMarketChangePercent:
              result.price.regularMarketChangePercent?.raw ||
              result.price.regularMarketChangePercent,
            regularMarketVolume:
              result.price.regularMarketVolume?.raw ||
              result.price.regularMarketVolume,
            marketCap: result.price.marketCap?.raw || result.price.marketCap,
            longName: result.price.longName || result.price.shortName,
            shortName: result.price.shortName,
          };
        }
      } catch (quoteSummaryError) {
        console.log(
          `quoteSummary failed for ${symbol}, trying quote method...`
        );

        try {
          // Try quote method
          quote = await yahooFinance.quote(yahooSymbol);
        } catch (quoteError) {
          console.log(
            `quote failed for ${symbol}, trying historical method...`
          );

          try {
            // Try historical method as last resort
            const historical = await yahooFinance.historical(yahooSymbol, {
              period1: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
              period2: new Date(),
              interval: "1d",
            });

            if (historical && historical.length > 0) {
              const latest = historical[historical.length - 1];
              quote = {
                regularMarketPrice: latest.close,
                regularMarketOpen: latest.open,
                regularMarketDayHigh: latest.high,
                regularMarketDayLow: latest.low,
                regularMarketPreviousClose:
                  historical.length > 1
                    ? historical[historical.length - 2].close
                    : latest.close,
                regularMarketVolume: latest.volume,
                longName: symbol,
                shortName: symbol,
              };
              quote.regularMarketChange =
                quote.regularMarketPrice - quote.regularMarketPreviousClose;
              quote.regularMarketChangePercent =
                (quote.regularMarketChange / quote.regularMarketPreviousClose) *
                100;
            }
          } catch (historicalError) {
            console.log(
              `All Yahoo Finance methods failed for ${symbol}, using mock data`
            );
          }
        }
      }

      if (!quote) {
        console.log(`No data found for symbol: ${symbol}, using mock data`);
        // Return mock data for development
        return this.getMockQuote(symbol);
      }

      return {
        symbol: symbol,
        companyName: quote.longName || quote.shortName || symbol,
        currentPrice: quote.regularMarketPrice || 0,
        openPrice: quote.regularMarketOpen || 0,
        highPrice: quote.regularMarketDayHigh || 0,
        lowPrice: quote.regularMarketDayLow || 0,
        previousClose: quote.regularMarketPreviousClose || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        marketCap: quote.marketCap || 0,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
        lastUpdated: new Date(),
        isRealTime: this.isMarketOpen,
      };
    } catch (error) {
      console.error(
        `Error fetching real-time data for ${symbol}:`,
        error.message
      );
      // Return mock data as fallback
      return this.getMockQuote(symbol);
    }
  }

  // Get multiple quotes at once (FREE)
  async getMultipleQuotes(symbols) {
    try {
      console.log(`📊 Fetching data for ${symbols.length} stocks...`);

      const results = [];

      // Process stocks one by one to avoid API limits
      for (const symbol of symbols) {
        try {
          const quote = await this.getRealTimeQuote(symbol);
          if (quote) {
            results.push(quote);
          }
          // Small delay to be API-friendly
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error.message);
          // Add mock data as fallback
          results.push(this.getMockQuote(symbol));
        }
      }

      return results;
    } catch (error) {
      console.error("Error fetching multiple quotes:", error.message);
      // Return mock data for all symbols as fallback
      return symbols.map((symbol) => this.getMockQuote(symbol));
    }
  }

  // Get market indices (NIFTY, SENSEX) - FREE
  async getIndices() {
    try {
      const indices = await yahooFinance.quote(["^NSEI", "^BSESN"]); // NIFTY 50, SENSEX

      const results = [];

      if (indices["^NSEI"]) {
        results.push({
          name: "NIFTY 50",
          symbol: "^NSEI",
          value: indices["^NSEI"].regularMarketPrice || 0,
          change: indices["^NSEI"].regularMarketChange || 0,
          changePercent: indices["^NSEI"].regularMarketChangePercent || 0,
          lastUpdated: new Date(),
        });
      }

      if (indices["^BSESN"]) {
        results.push({
          name: "SENSEX",
          symbol: "^BSESN",
          value: indices["^BSESN"].regularMarketPrice || 0,
          change: indices["^BSESN"].regularMarketChange || 0,
          changePercent: indices["^BSESN"].regularMarketChangePercent || 0,
          lastUpdated: new Date(),
        });
      }

      return results;
    } catch (error) {
      console.error("Error fetching indices:", error.message);
      return [];
    }
  }

  // Search stocks (FREE)
  async searchStocks(query, limit = 10) {
    try {
      // Simple search implementation
      const searchResults = await yahooFinance.search(query, {
        quotesCount: limit,
        newsCount: 0,
      });

      if (!searchResults.quotes) return [];

      return searchResults.quotes
        .filter((quote) => quote.exchDisp === "NSE" || quote.exchDisp === "BSE")
        .map((quote) => ({
          symbol: quote.symbol.replace(".NS", "").replace(".BO", ""),
          companyName: quote.longname || quote.shortname,
          exchange: quote.exchDisp,
          currentPrice: 0, // Will be fetched separately
          sector: quote.sector || "Unknown",
        }))
        .slice(0, limit);
    } catch (error) {
      console.error("Error searching stocks:", error.message);
      return [];
    }
  }

  // Fallback API using free tier of Alpha Vantage
  async getAlphaVantageData(symbol) {
    try {
      // Using demo API key (replace with actual free key if needed)
      const apiKey = "demo";
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

      const response = await axios.get(url);
      const data = response.data["Global Quote"];

      if (!data) return null;

      return {
        symbol: symbol,
        currentPrice: parseFloat(data["05. price"]) || 0,
        openPrice: parseFloat(data["02. open"]) || 0,
        highPrice: parseFloat(data["03. high"]) || 0,
        lowPrice: parseFloat(data["04. low"]) || 0,
        previousClose: parseFloat(data["08. previous close"]) || 0,
        change: parseFloat(data["09. change"]) || 0,
        changePercent:
          parseFloat(data["10. change percent"].replace("%", "")) || 0,
        volume: parseInt(data["06. volume"]) || 0,
        lastUpdated: new Date(data["07. latest trading day"]),
      };
    } catch (error) {
      console.error(`Alpha Vantage API error for ${symbol}:`, error.message);
      return null;
    }
  }

  // Get historical data (FREE - limited)
  async getHistoricalData(symbol, period = "1mo") {
    try {
      const yahooSymbol = this.getYahooSymbol(symbol);
      const queryOptions = { period1: this.getPeriodStart(period) };

      const result = await yahooFinance.historical(yahooSymbol, queryOptions);

      return result.map((item) => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }));
    } catch (error) {
      console.error(
        `Error fetching historical data for ${symbol}:`,
        error.message
      );
      return [];
    }
  }

  // Mock data generator for development (when APIs fail)
  getMockQuote(symbol) {
    const basePrice = Math.random() * 3000 + 500; // Random price between 500-3500
    const change = (Math.random() - 0.5) * 100; // Random change ±50
    const changePercent = (change / basePrice) * 100;

    const mockData = {
      RELIANCE: { name: "Reliance Industries Limited", basePrice: 2450 },
      TCS: { name: "Tata Consultancy Services Limited", basePrice: 3650 },
      HDFCBANK: { name: "HDFC Bank Limited", basePrice: 1680 },
      INFY: { name: "Infosys Limited", basePrice: 1820 },
      ICICIBANK: { name: "ICICI Bank Limited", basePrice: 1250 },
      HINDUNILVR: { name: "Hindustan Unilever Limited", basePrice: 2380 },
      ITC: { name: "ITC Limited", basePrice: 450 },
      SBIN: { name: "State Bank of India", basePrice: 820 },
      AIRTEL: { name: "Bharti Airtel Limited", basePrice: 980 },
      KOTAKBANK: { name: "Kotak Mahindra Bank Limited", basePrice: 1890 },
    };

    const stockInfo = mockData[symbol] || {
      name: `${symbol} Limited`,
      basePrice: basePrice,
    };
    const currentPrice = stockInfo.basePrice + (Math.random() - 0.5) * 100;
    const dailyChange = (Math.random() - 0.5) * 50;

    return {
      symbol: symbol,
      companyName: stockInfo.name,
      currentPrice: Math.round(currentPrice * 100) / 100,
      openPrice: Math.round((currentPrice - dailyChange) * 100) / 100,
      highPrice: Math.round((currentPrice + Math.random() * 20) * 100) / 100,
      lowPrice: Math.round((currentPrice - Math.random() * 20) * 100) / 100,
      previousClose: Math.round((currentPrice - dailyChange) * 100) / 100,
      change: Math.round(dailyChange * 100) / 100,
      changePercent: Math.round((dailyChange / currentPrice) * 10000) / 100,
      volume: Math.floor(Math.random() * 2000000) + 100000,
      marketCap: Math.floor(Math.random() * 15000000000000) + 1000000000000,
      fiftyTwoWeekHigh:
        Math.round((currentPrice + Math.random() * 500) * 100) / 100,
      fiftyTwoWeekLow:
        Math.round((currentPrice - Math.random() * 500) * 100) / 100,
      pe: Math.round((Math.random() * 30 + 10) * 100) / 100,
      eps: Math.round((Math.random() * 200 + 50) * 100) / 100,
      dividendYield: Math.round((Math.random() * 3 + 0.5) * 100) / 100,
      lastUpdated: new Date(),
      isRealTime: this.isMarketOpen,
      source: "Mock Data (Development Mode)",
    };
  }

  // Helper to get period start date
  getPeriodStart(period) {
    const now = new Date();
    switch (period) {
      case "1d":
        return new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      case "5d":
        return new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      case "1mo":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "3mo":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case "6mo":
        return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      case "1y":
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }
}

export default new FreeStockDataService();
