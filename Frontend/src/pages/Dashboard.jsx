import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../utils/api.js";
import {
  useMarketStatus,
  useWebSocketStatus,
} from "../hooks/useRealTimeData.js";
import "./Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Real-time hooks
  const marketStatus = useMarketStatus();
  const { isConnected } = useWebSocketStatus();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Get user profile
      const userResponse = await apiService.getProfile();
      if (userResponse.success) {
        setUser(userResponse.data.user);
      }

      // Get user portfolio
      const portfolioResponse = await apiService.getPortfolio();
      if (portfolioResponse.success) {
        setPortfolio(portfolioResponse.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load user data");
      // If unauthorized, redirect to login
      if (
        error.message.includes("unauthorized") ||
        error.message.includes("token")
      ) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchUserData} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.firstName}! 👋</h1>
          <p>Here's your trading dashboard</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          🔓 Logout
        </button>
      </div>

      {/* User Info Cards */}
      <div className="dashboard-grid">
        {/* Profile Card */}
        <div className="dashboard-card profile-card">
          <div className="card-header">
            <h3>👤 Profile Information</h3>
          </div>
          <div className="card-content">
            <div className="info-row">
              <span className="label">Name:</span>
              <span className="value">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Email:</span>
              <span className="value">{user?.email}</span>
            </div>
            <div className="info-row">
              <span className="label">Phone:</span>
              <span className="value">{user?.phone}</span>
            </div>
            <div className="info-row">
              <span className="label">Trading A/C:</span>
              <span className="value">{user?.tradingAccountNumber}</span>
            </div>
            <div className="status-badges">
              <span
                className={`badge ${
                  user?.isEmailVerified ? "verified" : "pending"
                }`}
              >
                📧 Email {user?.isEmailVerified ? "Verified" : "Pending"}
              </span>
              <span
                className={`badge ${
                  user?.isPhoneVerified ? "verified" : "pending"
                }`}
              >
                📱 Phone {user?.isPhoneVerified ? "Verified" : "Pending"}
              </span>
              <span
                className={`badge ${
                  user?.accountStatus === "active" ? "active" : "inactive"
                }`}
              >
                🔐 Account {user?.accountStatus || "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Portfolio Card */}
        <div className="dashboard-card portfolio-card">
          <div className="card-header">
            <h3>💰 Portfolio Summary</h3>
          </div>
          <div className="card-content">
            <div className="portfolio-stats">
              <div className="stat-item">
                <span className="stat-label">Total Value</span>
                <span className="stat-value">
                  ₹{portfolio?.totalValue?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Available Cash</span>
                <span className="stat-value cash">
                  ₹{portfolio?.cashBalance?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Invested Amount</span>
                <span className="stat-value">
                  ₹{portfolio?.investedAmount?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Day's P&L</span>
                <span
                  className={`stat-value ${
                    portfolio?.dayPnL >= 0 ? "profit" : "loss"
                  }`}
                >
                  ₹{portfolio?.dayPnL?.toLocaleString() || "0"}
                </span>
              </div>
            </div>
            <button className="add-cash-btn">💳 Add Cash</button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card actions-card">
          <div className="card-header">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="card-content">
            <div className="action-buttons">
              <button
                className="action-btn buy-btn"
                onClick={() => navigate("/trading?action=buy")}
              >
                📈 Buy Stocks
              </button>
              <button
                className="action-btn sell-btn"
                onClick={() => navigate("/trading?action=sell")}
              >
                📉 Sell Stocks
              </button>
              <button
                className="action-btn portfolio-btn"
                onClick={() => navigate("/portfolio")}
              >
                📊 View Portfolio
              </button>
              <button
                className="action-btn history-btn"
                onClick={() => navigate("/trading")}
              >
                🎯 Trading Hub
              </button>
            </div>
          </div>
        </div>

        {/* Market Status */}
        <div className="dashboard-card market-card">
          <div className="card-header">
            <h3>📊 Market Status</h3>
            <div
              className={`realtime-indicator ${
                isConnected ? "connected" : "disconnected"
              }`}
            >
              <span className="indicator-dot"></span>
              <span className="indicator-text">
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>
          <div className="card-content">
            <div className="market-status">
              <div className="status-indicator">
                <span
                  className={`status-dot ${
                    marketStatus.isOpen ? "active" : "inactive"
                  }`}
                ></span>
                <span>
                  {marketStatus.isOpen ? "Market Open" : "Market Closed"}
                </span>
              </div>
              <div className="market-time">
                <p>Trading Hours: 9:15 AM - 3:30 PM</p>
                {marketStatus.lastUpdated && (
                  <p className="last-updated">
                    Last updated:{" "}
                    {new Date(marketStatus.lastUpdated).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <div className="market-indices">
              <div className="index-item">
                <span>NIFTY 50</span>
                <span className="index-value profit">19,674.25 (+0.85%)</span>
              </div>
              <div className="index-item">
                <span>SENSEX</span>
                <span className="index-value profit">65,832.12 (+0.92%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-card activity-card">
        <div className="card-header">
          <h3>📈 Recent Activity</h3>
        </div>
        <div className="card-content">
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">🎉</span>
              <span className="activity-text">
                Welcome! Your account has been successfully created.
              </span>
              <span className="activity-time">Just now</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon">✅</span>
              <span className="activity-text">
                Email verification completed successfully.
              </span>
              <span className="activity-time">2 mins ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
