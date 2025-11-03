import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRealTimeStock } from "../hooks/useRealTimeData";
import apiService from "../utils/api";
import "./Trading.css";

const TradingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSymbol = searchParams.get("symbol") || "";
  const initialAction = searchParams.get("action") || "buy";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeAction, setTradeAction] = useState(initialAction);
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [portfolio, setPortfolio] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  // Real-time data for selected stock
  const symbols = selectedStock ? [selectedStock.symbol] : [];
  const { stockData, isConnected } = useRealTimeStock(symbols);

  // Popular stocks (clean list without duplicates - matches backend)
  const popularStocks = [
    { symbol: "RELIANCE.NS", name: "Reliance Industries", exchange: "NSE" },
    { symbol: "TCS.NS", name: "Tata Consultancy Services", exchange: "NSE" },
    { symbol: "HDFCBANK.NS", name: "HDFC Bank", exchange: "NSE" },
    { symbol: "INFY.NS", name: "Infosys", exchange: "NSE" },
    { symbol: "ITC.NS", name: "ITC Limited", exchange: "NSE" },
    { symbol: "SBIN.NS", name: "State Bank of India", exchange: "NSE" },
    { symbol: "AIRTEL.NS", name: "Bharti Airtel", exchange: "NSE" },
    { symbol: "LT.NS", name: "Larsen & Toubro", exchange: "NSE" },
    { symbol: "MARUTI.NS", name: "Maruti Suzuki", exchange: "NSE" },
    { symbol: "ASIANPAINT.NS", name: "Asian Paints", exchange: "NSE" },
    // Demo stocks for testing
    { symbol: "DEMO1", name: "Demo Stock 1", exchange: "NSE" },
    { symbol: "DEMO2", name: "Demo Stock 2", exchange: "NSE" },
    { symbol: "TEST", name: "Test Company", exchange: "NSE" },
    { symbol: "ICICIBANK.NS", name: "ICICI Bank", exchange: "NSE" },
    { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever", exchange: "NSE" },
    { symbol: "SBIN.NS", name: "State Bank of India", exchange: "NSE" },
    { symbol: "AIRTEL.NS", name: "Bharti Airtel", exchange: "NSE" },
    { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", exchange: "NSE" },
  ];

  useEffect(() => {
    fetchPortfolio();
    if (initialSymbol) {
      const stock = popularStocks.find((s) => s.symbol === initialSymbol);
      if (stock) {
        setSelectedStock(stock);
      }
    }
  }, [initialSymbol]);

  const fetchPortfolio = async () => {
    try {
      console.log("🔐 Auth token:", localStorage.getItem("token"));

      let response = await apiService.getPortfolio();
      console.log("📊 Portfolio API Response:", response);

      if (response.success) {
        const portfolioData = response.data.portfolio || response.data;
        setPortfolio(portfolioData);
        console.log("💰 Portfolio Data:", portfolioData);
        console.log("💵 Available Cash:", portfolioData?.availableCash);

        // If no balance, create/update portfolio
        if (
          !portfolioData?.availableCash ||
          portfolioData.availableCash === 0
        ) {
          console.log("🔄 Creating/updating portfolio with balance...");
          const createResponse = await apiService.createPortfolio();
          if (createResponse.success) {
            setPortfolio(createResponse.data);
            console.log(
              "✅ Portfolio created with balance:",
              createResponse.data.availableCash
            );
          }
        }
      } else {
        // Portfolio doesn't exist, create it
        console.log("🔄 Portfolio not found, creating new one...");
        const createResponse = await apiService.createPortfolio();
        if (createResponse.success) {
          setPortfolio(createResponse.data);
          console.log("✅ New portfolio created:", createResponse.data);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching portfolio:", error);

      // If unauthorized, set a demo portfolio for testing
      if (
        error.message?.includes("unauthorized") ||
        error.message?.includes("401")
      ) {
        console.log("🧪 Setting demo portfolio for testing...");
        setPortfolio({
          availableCash: 100000,
          totalCurrentValue: 0,
          totalInvestedAmount: 0,
          holdings: [],
        });
        return;
      }

      // Try to create portfolio on error
      try {
        console.log("🔄 Error occurred, attempting to create portfolio...");
        const createResponse = await apiService.createPortfolio();
        if (createResponse.success) {
          setPortfolio(createResponse.data);
          console.log("✅ Portfolio created after error:", createResponse.data);
        }
      } catch (createError) {
        console.error("Error creating portfolio:", createError);
      }
    }
  };

  const handleStockSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Filter popular stocks based on search
    const filtered = popularStocks.filter(
      (stock) =>
        stock.name.toLowerCase().includes(query.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filtered);
  };

  const selectStock = (stock) => {
    setSelectedStock(stock);
    setSearchQuery(stock.name);
    setSearchResults([]);
    setError("");
  };

  const getCurrentPrice = () => {
    if (selectedStock && stockData[selectedStock.symbol]) {
      return stockData[selectedStock.symbol].price;
    }
    return 0;
  };

  const getEstimatedValue = () => {
    const price = getCurrentPrice();
    return price * quantity;
  };

  const getAvailableQuantity = () => {
    if (tradeAction === "sell" && portfolio?.holdings) {
      const holding = portfolio.holdings.find(
        (h) => h.symbol === selectedStock?.symbol
      );
      return holding ? holding.quantity : 0;
    }
    return Infinity;
  };

  const getAvailableBalance = () => {
    const balance =
      portfolio?.availableCash ||
      portfolio?.cashBalance ||
      portfolio?.portfolio?.availableCash ||
      0;
    console.log("💵 Checking balance:", {
      portfolio: portfolio,
      availableCash: portfolio?.availableCash,
      cashBalance: portfolio?.cashBalance,
      nestedPortfolio: portfolio?.portfolio?.availableCash,
      finalBalance: balance,
    });
    return balance;
  };

  const canAffordTrade = () => {
    if (tradeAction === "buy") {
      return getEstimatedValue() <= getAvailableBalance();
    } else {
      return quantity <= getAvailableQuantity();
    }
  };

  const handleTrade = async () => {
    if (!selectedStock) {
      setError("Please select a stock");
      return;
    }

    if (quantity <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    if (!canAffordTrade()) {
      if (tradeAction === "buy") {
        setError("Insufficient balance");
      } else {
        setError("Insufficient shares to sell");
      }
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const tradeData = {
        symbol: selectedStock.symbol,
        action: tradeAction,
        quantity: parseInt(quantity),
        orderType: orderType,
        price:
          orderType === "limit" ? parseFloat(limitPrice) : getCurrentPrice(),
      };

      console.log("🔄 Placing trade:", tradeData);
      const response = await apiService.placeTrade(tradeData);
      console.log("📈 Trade response:", response);

      if (response.success) {
        setSuccess(`${tradeAction.toUpperCase()} order placed successfully!`);
        // Reset form
        setQuantity(1);
        setLimitPrice("");
        // Refresh portfolio
        fetchPortfolio();

        // Redirect to portfolio after 2 seconds
        setTimeout(() => {
          navigate("/portfolio");
        }, 2000);
      } else {
        console.error("❌ Trade failed:", response);
        setError(response.message || "Trade failed");
      }
    } catch (error) {
      console.error("💥 Trade error:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Trade failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentStockData = selectedStock
    ? stockData[selectedStock.symbol]
    : null;

  return (
    <div className="trading-container">
      <div className="trading-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <h1>📈 Trading</h1>
        <button
          onClick={() => {
            // Set demo auth token for testing
            localStorage.setItem("token", "demo-token-12345");
            window.location.reload();
          }}
          style={{
            background: "#28a745",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            marginLeft: "10px",
          }}
        >
          🧪 Enable Demo Mode
        </button>
        <div className="connection-status">
          <span
            className={`status-dot ${
              isConnected ? "connected" : "disconnected"
            }`}
          ></span>
          <span>{isConnected ? "Live Data" : "Offline"}</span>
        </div>
      </div>

      <div className="trading-content">
        {/* Stock Search */}
        <div className="stock-search-section">
          <h3>🔍 Search Stocks</h3>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search for stocks..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleStockSearch(e.target.value);
              }}
              className="stock-search-input"
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((stock, index) => (
                  <div
                    key={`search-${stock.symbol}-${index}`}
                    className="search-result-item"
                    onClick={() => selectStock(stock)}
                  >
                    <div className="stock-info">
                      <span className="stock-symbol">{stock.symbol}</span>
                      <span className="stock-name">{stock.name}</span>
                    </div>
                    <span className="stock-exchange">{stock.exchange}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Popular Stocks */}
        {!selectedStock && (
          <div className="popular-stocks-section">
            <h3>🌟 Popular Stocks</h3>
            <p className="demo-hint">
              💡 Try DEMO1, DEMO2, or TEST stocks for testing with lower prices!
            </p>
            <div className="popular-stocks-grid">
              {popularStocks.map((stock, index) => (
                <div
                  key={`popular-${stock.symbol}-${index}`}
                  className="popular-stock-card"
                  onClick={() => selectStock(stock)}
                >
                  <div className="stock-symbol">
                    {stock.symbol.replace(".NS", "")}
                  </div>
                  <div className="stock-name">{stock.name}</div>
                  <div className="stock-exchange">{stock.exchange}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Stock Details */}
        {selectedStock && (
          <div className="selected-stock-section">
            <div className="stock-details">
              <div className="stock-header">
                <h3>{selectedStock.name}</h3>
                <span className="stock-symbol">{selectedStock.symbol}</span>
              </div>

              {currentStockData && (
                <div className="stock-price-info">
                  <div className="current-price">
                    ₹{currentStockData.price?.toFixed(2) || "N/A"}
                  </div>
                  <div
                    className={`price-change ${
                      currentStockData.change >= 0 ? "positive" : "negative"
                    }`}
                  >
                    {currentStockData.change >= 0 ? "+" : ""}
                    {currentStockData.change?.toFixed(2) || "0.00"}(
                    {currentStockData.changePercent?.toFixed(2) || "0.00"}%)
                  </div>
                  <div className="stock-details-grid">
                    <div className="detail-item">
                      <span>Previous Close:</span>
                      <span>
                        ₹{currentStockData.previousClose?.toFixed(2) || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span>Day High:</span>
                      <span>
                        ₹{currentStockData.dayHigh?.toFixed(2) || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span>Day Low:</span>
                      <span>
                        ₹{currentStockData.dayLow?.toFixed(2) || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span>Volume:</span>
                      <span>
                        {currentStockData.volume?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Trading Form */}
            <div className="trading-form">
              <h3>🎯 Place Order</h3>

              {/* Action Selector */}
              <div className="trade-actions">
                <button
                  className={`action-btn ${
                    tradeAction === "buy" ? "active buy" : ""
                  }`}
                  onClick={() => setTradeAction("buy")}
                >
                  BUY
                </button>
                <button
                  className={`action-btn ${
                    tradeAction === "sell" ? "active sell" : ""
                  }`}
                  onClick={() => setTradeAction("sell")}
                >
                  SELL
                </button>
              </div>

              {/* Order Type */}
              <div className="form-group">
                <label>Order Type:</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="form-select"
                >
                  <option value="market">Market Order</option>
                  <option value="limit">Limit Order</option>
                </select>
              </div>

              {/* Limit Price (if limit order) */}
              {orderType === "limit" && (
                <div className="form-group">
                  <label>Limit Price:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder="Enter limit price"
                    className="form-input"
                  />
                </div>
              )}

              {/* Quantity */}
              <div className="form-group">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={
                    tradeAction === "sell" ? getAvailableQuantity() : undefined
                  }
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="form-input"
                />
                {tradeAction === "sell" && (
                  <small>Available: {getAvailableQuantity()} shares</small>
                )}
              </div>

              {/* Estimated Value */}
              <div className="trade-summary">
                <div className="summary-row">
                  <span>Estimated Value:</span>
                  <span className="value">
                    ₹{getEstimatedValue().toFixed(2)}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Available Balance:</span>
                  <span className="value">
                    ₹{getAvailableBalance().toFixed(2)}
                  </span>
                  <button
                    onClick={fetchPortfolio}
                    className="refresh-balance-btn"
                    style={{
                      marginLeft: "10px",
                      padding: "2px 8px",
                      fontSize: "12px",
                    }}
                  >
                    🔄
                  </button>
                </div>
                {!canAffordTrade() && (
                  <div className="warning">
                    {tradeAction === "buy"
                      ? "Insufficient balance"
                      : "Insufficient shares"}
                  </div>
                )}
              </div>

              {/* Messages */}
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              {/* Place Order Button */}
              <button
                className={`place-order-btn ${tradeAction}`}
                onClick={handleTrade}
                disabled={loading || !selectedStock || !canAffordTrade()}
              >
                {loading
                  ? "Placing Order..."
                  : `Place ${tradeAction.toUpperCase()} Order`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingPage;
