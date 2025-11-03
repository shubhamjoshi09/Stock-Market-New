import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../utils/api.js";
import {
  useRealTimePortfolio,
  useWebSocketStatus,
} from "../hooks/useRealTimeData.js";
import "./Portfolio.css";

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [staticHoldings, setStaticHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedView, setSelectedView] = useState("holdings"); // holdings, positions, orders

  const navigate = useNavigate();

  // Real-time data hooks
  const { status: wsStatus, isConnected } = useWebSocketStatus();
  const realTimePortfolio = useRealTimePortfolio(staticHoldings);

  // Use real-time holdings if available, otherwise fallback to static
  const holdings =
    realTimePortfolio.holdings.length > 0
      ? realTimePortfolio.holdings
      : staticHoldings;

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      // Get portfolio summary
      let portfolioResponse = await apiService.getPortfolio();
      if (portfolioResponse.success) {
        const portfolioData =
          portfolioResponse.data.portfolio || portfolioResponse.data;
        setPortfolio(portfolioData);
        setStaticHoldings(portfolioData.holdings || []);

        // If no balance, create/update portfolio
        if (
          !portfolioData?.availableCash ||
          portfolioData.availableCash === 0
        ) {
          console.log("🔄 Creating/updating portfolio with balance...");
          const createResponse = await apiService.createPortfolio();
          if (createResponse.success) {
            setPortfolio(createResponse.data);
            setStaticHoldings(createResponse.data.holdings || []);
            console.log(
              "✅ Portfolio updated with balance:",
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
          setStaticHoldings(createResponse.data.holdings || []);
          console.log("✅ New portfolio created:", createResponse.data);
        }
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      setError("Failed to load portfolio data");

      // Try to create portfolio on error
      try {
        console.log("🔄 Error occurred, attempting to create portfolio...");
        const createResponse = await apiService.createPortfolio();
        if (createResponse.success) {
          setPortfolio(createResponse.data);
          setStaticHoldings(createResponse.data.holdings || []);
          setError(""); // Clear error
          console.log("✅ Portfolio created after error:", createResponse.data);
        }
      } catch (createError) {
        console.error("Error creating portfolio:", createError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBuyMore = (symbol) => {
    navigate(`/trading/buy?symbol=${symbol}`);
  };

  const handleSell = (symbol) => {
    navigate(`/trading/sell?symbol=${symbol}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="portfolio-loading">
        <div className="loading-spinner"></div>
        <p>Loading your portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-error">
        <h3>Error Loading Portfolio</h3>
        <p>{error}</p>
        <button onClick={fetchPortfolioData} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  const totalInvestment =
    realTimePortfolio.totals.totalInvestedValue ||
    portfolio?.totalInvestedAmount ||
    0;
  const currentValue =
    realTimePortfolio.totals.totalCurrentValue ||
    portfolio?.totalCurrentValue ||
    0;
  const totalPnL =
    realTimePortfolio.totals.totalPnL ||
    portfolio?.totalPnL ||
    currentValue - totalInvestment;
  const totalPnLPercentage =
    realTimePortfolio.totals.totalPnLPercentage ||
    portfolio?.totalPnLPercentage ||
    (totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0);
  const dayPnL = portfolio?.daysPnL || 0;

  return (
    <div className="portfolio-container">
      {/* Portfolio Header */}
      <div className="portfolio-header">
        <div className="portfolio-title">
          <h1>📊 Portfolio</h1>
          <p>Track your investments and performance</p>
          <button
            onClick={fetchPortfolioData}
            className="refresh-balance-btn"
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
            🔄 Refresh Portfolio
          </button>
          {/* Real-time connection status */}
          <div
            className={`realtime-status ${
              isConnected ? "connected" : "disconnected"
            }`}
          >
            <span className="status-dot"></span>
            <span className="status-text">
              {isConnected ? "Live Data" : "Offline Mode"}
            </span>
            {realTimePortfolio.lastUpdated && (
              <span className="last-updated">
                Updated:{" "}
                {new Date(realTimePortfolio.lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="portfolio-actions">
          <button className="add-money-btn">💳 Add money</button>
          <button className="withdraw-btn">💸 Withdraw</button>
          <div className="cash-balance">
            💰 Available: {formatCurrency(portfolio?.availableCash || 0)}
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="portfolio-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-title">Current value</div>
            <div className="card-value primary">
              {formatCurrency(currentValue)}
            </div>
          </div>

          <div className="summary-card">
            <div className="card-title">Total investment</div>
            <div className="card-value">{formatCurrency(totalInvestment)}</div>
          </div>

          <div className="summary-card">
            <div className="card-title">Total P&L</div>
            <div className={`card-value ${totalPnL >= 0 ? "profit" : "loss"}`}>
              {formatCurrency(totalPnL)} ({formatPercentage(totalPnLPercentage)}
              )
            </div>
          </div>

          <div className="summary-card">
            <div className="card-title">Today's P&L</div>
            <div className={`card-value ${dayPnL >= 0 ? "profit" : "loss"}`}>
              {formatCurrency(dayPnL)}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Tabs */}
      <div className="portfolio-tabs">
        <button
          className={`tab-btn ${selectedView === "holdings" ? "active" : ""}`}
          onClick={() => setSelectedView("holdings")}
        >
          Holdings ({holdings.length})
        </button>
        <button
          className={`tab-btn ${selectedView === "positions" ? "active" : ""}`}
          onClick={() => setSelectedView("positions")}
        >
          Positions (0)
        </button>
        <button
          className={`tab-btn ${selectedView === "orders" ? "active" : ""}`}
          onClick={() => setSelectedView("orders")}
        >
          Orders (0)
        </button>
      </div>

      {/* Portfolio Content */}
      <div className="portfolio-content">
        {selectedView === "holdings" && (
          <div className="holdings-section">
            {holdings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📈</div>
                <h3>No holdings yet</h3>
                <p>Start investing to see your holdings here</p>
                <button
                  className="start-investing-btn"
                  onClick={() => navigate("/trading")}
                >
                  Start investing
                </button>
              </div>
            ) : (
              <>
                {/* Holdings Header */}
                <div className="holdings-header">
                  <div className="holding-col">Instrument</div>
                  <div className="holding-col">Qty.</div>
                  <div className="holding-col">Avg.</div>
                  <div className="holding-col">LTP</div>
                  <div className="holding-col">P&L</div>
                  <div className="holding-col">Chg.</div>
                  <div className="holding-col">Actions</div>
                </div>

                {/* Holdings List */}
                <div className="holdings-list">
                  {holdings.map((holding, index) => (
                    <div
                      key={`holding-${holding.symbol}-${index}`}
                      className="holding-row"
                    >
                      <div className="holding-col instrument">
                        <div className="instrument-info">
                          <span className="symbol">{holding.symbol}</span>
                          <span className="exchange">{holding.exchange}</span>
                        </div>
                      </div>

                      <div className="holding-col quantity">
                        {holding.quantity}
                      </div>

                      <div className="holding-col avg-price">
                        {formatCurrency(
                          holding.averagePrice || holding.avgPrice
                        )}
                      </div>

                      <div className="holding-col ltp">
                        {formatCurrency(holding.currentPrice)}
                      </div>

                      <div
                        className={`holding-col pnl ${
                          holding.pnl >= 0 ? "profit" : "loss"
                        }`}
                      >
                        <div>{formatCurrency(holding.pnl)}</div>
                        <div className="pnl-percent">
                          ({formatPercentage(holding.pnlPercentage)})
                        </div>
                      </div>

                      <div
                        className={`holding-col change ${
                          holding.dayChange >= 0 ? "profit" : "loss"
                        }`}
                      >
                        {formatPercentage(holding.dayChangePercentage)}
                      </div>

                      <div className="holding-col actions">
                        <button
                          className="action-btn buy-btn"
                          onClick={() => handleBuyMore(holding.symbol)}
                        >
                          B
                        </button>
                        <button
                          className="action-btn sell-btn"
                          onClick={() => handleSell(holding.symbol)}
                        >
                          S
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {selectedView === "positions" && (
          <div className="positions-section">
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No positions</h3>
              <p>Your open positions will appear here</p>
            </div>
          </div>
        )}

        {selectedView === "orders" && (
          <div className="orders-section">
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>No orders</h3>
              <p>Your recent orders will appear here</p>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Section */}
      <div className="portfolio-analytics">
        <div className="analytics-card">
          <h3>📊 Performance Analytics</h3>
          <div className="analytics-grid">
            <div className="analytics-item">
              <span className="analytics-label">XIRR</span>
              <span className="analytics-value">--</span>
            </div>
            <div className="analytics-item">
              <span className="analytics-label">Absolute returns</span>
              <span
                className={`analytics-value ${
                  totalPnL >= 0 ? "profit" : "loss"
                }`}
              >
                {formatPercentage(totalPnLPercentage)}
              </span>
            </div>
            <div className="analytics-item">
              <span className="analytics-label">Total holdings</span>
              <span className="analytics-value">{holdings.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
