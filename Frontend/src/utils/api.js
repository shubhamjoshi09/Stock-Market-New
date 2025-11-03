// API Service for Stock Market Platform
const API_BASE_URL = "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("token");
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem("token", token);
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }

  // Get headers with authentication
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // ===== AUTHENTICATION APIs =====

  async signup(userData) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.success) {
      this.setToken(response.data.token);
      localStorage.setItem("refreshToken", response.data.refreshToken);
    }

    return response;
  }

  async logout() {
    const refreshToken = localStorage.getItem("refreshToken");
    await this.request("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    this.removeToken();
  }

  async verifyOTP(data) {
    return this.request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        otp: data.otp,
        type: data.type || "email",
      }),
    });
  }

  async resendOTP(data) {
    return this.request("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        type: data.type || "email",
      }),
    });
  }

  async getProfile() {
    return this.request("/auth/me");
  }

  // ===== STOCK APIs =====

  async searchStocks(query, limit = 20) {
    return this.request(
      `/stocks/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  }

  async getStockDetails(symbol, exchange = "NSE") {
    return this.request(`/stocks/${symbol}?exchange=${exchange}`);
  }

  async getMarketOverview() {
    return this.request("/stocks/market-overview");
  }

  async getTopGainers(limit = 10) {
    return this.request(`/stocks/top-gainers?limit=${limit}`);
  }

  async getTopLosers(limit = 10) {
    return this.request(`/stocks/top-losers?limit=${limit}`);
  }

  // ===== PORTFOLIO APIs =====

  async getPortfolio() {
    return this.request("/portfolio");
  }

  async addCash(amount) {
    return this.request("/portfolio/add-cash", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  }

  // ===== TRADING APIs =====

  async placeTrade(tradeData) {
    console.log("🚀 Sending trade request:", tradeData);
    try {
      const response = await this.request("/trading/place-order", {
        method: "POST",
        body: JSON.stringify(tradeData),
      });
      console.log("📊 Trade API response:", response);
      return response;
    } catch (error) {
      console.error("💥 Trade API error:", error);
      throw error;
    }
  }

  async getTradingHistory(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/trading/history?${queryParams}`);
  }

  async getMarketData(symbol) {
    return this.request(`/trading/market-data/${symbol}`);
  }

  async searchStocks(query) {
    return this.request(`/trading/search?query=${encodeURIComponent(query)}`);
  }

  async getPopularStocks() {
    return this.request("/trading/popular");
  }

  async createPortfolio() {
    return this.request("/trading/create-portfolio", {
      method: "POST",
    });
  }

  async checkBalance() {
    return this.request("/trading/check-balance");
  }

  async placeOrder(orderData) {
    return this.request("/transactions/place-order", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async getTransactions(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/transactions?${queryParams}`);
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export { ApiService }; // Named export for class
export default apiService;
