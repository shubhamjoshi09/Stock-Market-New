// API Service for Stock Market Platform
const API_BASE_URL = "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("token");
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem("token", token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }

  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

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

  // --- AUTH ---
  async login(credentials) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response;
  }

  // --- PORTFOLIO ---
  async getPortfolio() {
    return this.request("/portfolio");
  }

  async createPortfolio() {
    return this.request("/trading/create-portfolio", {
      method: "POST",
    });
  }

  // --- TRADING ---
  async placeTrade(tradeData) {
    console.log("🚀 Sending Trade Data to API:", tradeData);

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;

    if (!userId) throw new Error("User not logged in");

    const payload = { ...tradeData, userId };
    console.log("📦 Final Payload:", payload);

    return this.request("/transactions/place-order", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
