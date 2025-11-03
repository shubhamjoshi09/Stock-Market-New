import Stock from "../models/Stock.js";

// Sample Indian stocks data
const sampleStocks = [
  {
    symbol: "RELIANCE",
    companyName: "Reliance Industries Limited",
    exchange: "NSE",
    segment: "equity",
    currentPrice: 2450.75,
    openPrice: 2440.0,
    highPrice: 2465.5,
    lowPrice: 2435.25,
    previousClose: 2445.3,
    volume: 1250000,
    sector: "Oil & Gas",
    marketCapCategory: "Large Cap",
    marketCap: 16500000000000, // 16.5 trillion
    pe: 12.5,
    pb: 1.8,
    eps: 196.0,
    dividendYield: 0.35,
    fiftyTwoWeekHigh: 2856.15,
    fiftyTwoWeekLow: 2220.3,
    isActive: true,
    isTradable: true,
  },
  {
    symbol: "TCS",
    companyName: "Tata Consultancy Services Limited",
    exchange: "NSE",
    segment: "equity",
    currentPrice: 3650.4,
    openPrice: 3640.0,
    highPrice: 3680.75,
    lowPrice: 3635.5,
    previousClose: 3642.8,
    volume: 890000,
    sector: "Information Technology",
    marketCapCategory: "Large Cap",
    marketCap: 13200000000000, // 13.2 trillion
    pe: 28.2,
    pb: 12.5,
    eps: 129.5,
    dividendYield: 1.2,
    fiftyTwoWeekHigh: 4043.9,
    fiftyTwoWeekLow: 3000.15,
    isActive: true,
    isTradable: true,
  },
  {
    symbol: "HDFCBANK",
    companyName: "HDFC Bank Limited",
    exchange: "NSE",
    segment: "equity",
    currentPrice: 1680.25,
    openPrice: 1675.0,
    highPrice: 1695.8,
    lowPrice: 1670.3,
    previousClose: 1678.5,
    volume: 2100000,
    sector: "Banking",
    marketCapCategory: "Large Cap",
    marketCap: 12800000000000, // 12.8 trillion
    pe: 18.7,
    pb: 3.2,
    eps: 89.8,
    dividendYield: 1.0,
    fiftyTwoWeekHigh: 1795.8,
    fiftyTwoWeekLow: 1363.55,
    isActive: true,
    isTradable: true,
  },
  {
    symbol: "INFY",
    companyName: "Infosys Limited",
    exchange: "NSE",
    segment: "equity",
    currentPrice: 1420.15,
    openPrice: 1415.0,
    highPrice: 1435.75,
    lowPrice: 1410.25,
    previousClose: 1418.9,
    volume: 1650000,
    sector: "Information Technology",
    marketCapCategory: "Large Cap",
    marketCap: 5900000000000, // 5.9 trillion
    pe: 24.5,
    pb: 7.8,
    eps: 58.0,
    dividendYield: 2.1,
    fiftyTwoWeekHigh: 1719.95,
    fiftyTwoWeekLow: 1195.0,
    isActive: true,
    isTradable: true,
  },
  {
    symbol: "ICICIBANK",
    companyName: "ICICI Bank Limited",
    exchange: "NSE",
    segment: "equity",
    currentPrice: 950.75,
    openPrice: 948.0,
    highPrice: 958.5,
    lowPrice: 945.25,
    previousClose: 949.3,
    volume: 3200000,
    sector: "Banking",
    marketCapCategory: "Large Cap",
    marketCap: 6600000000000, // 6.6 trillion
    pe: 15.2,
    pb: 2.8,
    eps: 62.5,
    dividendYield: 0.8,
    fiftyTwoWeekHigh: 1036.9,
    fiftyTwoWeekLow: 735.2,
    isActive: true,
    isTradable: true,
  },
  {
    symbol: "HINDUNILVR",
    companyName: "Hindustan Unilever Limited",
    exchange: "NSE",
    segment: "equity",
    currentPrice: 2680.4,
    openPrice: 2675.0,
    highPrice: 2695.8,
    lowPrice: 2670.25,
    previousClose: 2678.15,
    volume: 750000,
    sector: "FMCG",
    marketCapCategory: "Large Cap",
    marketCap: 6300000000000, // 6.3 trillion
    pe: 58.2,
    pb: 12.8,
    eps: 46.1,
    dividendYield: 1.4,
    fiftyTwoWeekHigh: 2844.95,
    fiftyTwoWeekLow: 2172.0,
    isActive: true,
    isTradable: true,
  },
  {
    symbol: "ITC",
    companyName: "ITC Limited",
    exchange: "NSE",
    segment: "equity",
    currentPrice: 425.8,
    openPrice: 424.0,
    highPrice: 428.75,
    lowPrice: 422.5,
    previousClose: 424.6,
    volume: 4500000,
    sector: "FMCG",
    marketCapCategory: "Large Cap",
    marketCap: 5300000000000, // 5.3 trillion
    pe: 28.5,
    pb: 4.2,
    eps: 14.9,
    dividendYield: 3.8,
    fiftyTwoWeekHigh: 480.65,
    fiftyTwoWeekLow: 350.25,
    isActive: true,
    isTradable: true,
  },
  {
    symbol: "SBIN",
    companyName: "State Bank of India",
    exchange: "NSE",
    segment: "equity",
    currentPrice: 585.25,
    openPrice: 582.0,
    highPrice: 592.8,
    lowPrice: 580.15,
    previousClose: 583.4,
    volume: 5200000,
    sector: "Banking",
    marketCapCategory: "Large Cap",
    marketCap: 5200000000000, // 5.2 trillion
    pe: 12.8,
    pb: 1.2,
    eps: 45.7,
    dividendYield: 1.5,
    fiftyTwoWeekHigh: 675.8,
    fiftyTwoWeekLow: 470.55,
    isActive: true,
    isTradable: true,
  },
  {
    symbol: "AIRTEL",
    companyName: "Bharti Airtel Limited",
    exchange: "NSE",
    segment: "equity",
    currentPrice: 1180.5,
    openPrice: 1175.0,
    highPrice: 1195.75,
    lowPrice: 1172.25,
    previousClose: 1178.8,
    volume: 1850000,
    sector: "Telecom",
    marketCapCategory: "Large Cap",
    marketCap: 6500000000000, // 6.5 trillion
    pe: 45.2,
    pb: 8.5,
    eps: 26.1,
    dividendYield: 0.7,
    fiftyTwoWeekHigh: 1349.85,
    fiftyTwoWeekLow: 825.4,
    isActive: true,
    isTradable: true,
  },
  {
    symbol: "KOTAKBANK",
    companyName: "Kotak Mahindra Bank Limited",
    exchange: "NSE",
    segment: "equity",
    currentPrice: 1825.75,
    openPrice: 1820.0,
    highPrice: 1845.5,
    lowPrice: 1815.25,
    previousClose: 1822.9,
    volume: 1250000,
    sector: "Banking",
    marketCapCategory: "Large Cap",
    marketCap: 3600000000000, // 3.6 trillion
    pe: 16.8,
    pb: 2.5,
    eps: 108.7,
    dividendYield: 0.6,
    fiftyTwoWeekHigh: 2075.95,
    fiftyTwoWeekLow: 1543.2,
    isActive: true,
    isTradable: true,
  },
];

// Function to seed sample stock data
export const seedStockData = async () => {
  try {
    console.log("🌱 Seeding stock data...");

    // Clear existing data
    await Stock.deleteMany({});

    // Insert sample data
    const insertedStocks = await Stock.insertMany(sampleStocks);

    console.log(`✅ Successfully seeded ${insertedStocks.length} stocks`);
    console.log(
      "Sample stocks:",
      insertedStocks.map((s) => s.symbol).join(", ")
    );

    return insertedStocks;
  } catch (error) {
    console.error("❌ Error seeding stock data:", error);
    throw error;
  }
};

// Function to update stock prices with random market movements
export const simulateMarketData = async () => {
  try {
    console.log("📈 Simulating market data updates...");

    const stocks = await Stock.find({ isActive: true });

    for (const stock of stocks) {
      // Generate random price movement (-3% to +3%)
      const priceChangePercent = (Math.random() - 0.5) * 0.06; // ±3%
      const newPrice = stock.currentPrice * (1 + priceChangePercent);

      // Generate random volume (±50% of current volume)
      const volumeChange = (Math.random() - 0.5) * 1.0; // ±50%
      const newVolume = Math.max(1000, stock.volume * (1 + volumeChange));

      // Update stock data
      await stock.updateMarketData({
        currentPrice: parseFloat(newPrice.toFixed(2)),
        volume: Math.floor(newVolume),
        highPrice: Math.max(stock.highPrice, newPrice),
        lowPrice: Math.min(stock.lowPrice, newPrice),
        lastTradeTime: new Date(),
      });
    }

    console.log(`✅ Updated market data for ${stocks.length} stocks`);
  } catch (error) {
    console.error("❌ Error simulating market data:", error);
    throw error;
  }
};

export default {
  sampleStocks,
  seedStockData,
  simulateMarketData,
};
