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
      // Attempt to parse JSON (safe guard for empty responses)
      let data = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        // Non-JSON response
        data = null;
      }

      if (!response.ok) {
        // Attach full response data to the thrown error so callers can inspect validation details
        const err = new Error((data && data.message) || "API request failed");
        err.status = response.status;
        err.responseData = data;
        throw err;
      }

      return data;
    } catch (error) {
      // Log full error including any attached response data for easier debugging
      console.error("API Error:", error, error?.responseData || null);
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

  // Signup (register new user) - backend sends OTP for verification
  async signup(signupData) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(signupData),
    });
  }

  // Verify OTP sent after signup
  async verifyOTP(payload) {
    return this.request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Resend OTP
  async resendOTP(payload) {
    return this.request("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // --- PORTFOLIO ---
  async getPortfolio() {
    return this.request("/portfolio");
  }
  // Backend auto-creates portfolio on GET /api/portfolio, so reuse that.
  async createPortfolio() {
    return this.getPortfolio();
  }

  // Add cash to logged-in user's portfolio (amount in server currency units)
  async addCash(amount) {
    return this.request("/portfolio/add-cash", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  }

  // --- PROFILE ---
  async getProfile() {
    return this.request("/auth/me");
  }

  // --- TRADING ---
  async placeTrade(tradeData) {
    console.log("🚀 Sending Trade Data to API:", tradeData);

    // Do not require `user` object in localStorage — backend identifies user
    // from the Authorization token. Send only the trade payload.
    const payload = { ...tradeData };
    console.log("📦 Final Payload:", payload);

    return this.request("/transactions/place-order", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
