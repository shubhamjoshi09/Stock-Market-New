import { WebSocketServer, WebSocket } from "ws";
import YahooFinance from "yahoo-finance2";

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Store client connections with their subscriptions
    this.priceUpdateInterval = null;
    this.stockSymbols = new Set();
    // instantiate yahoo-finance2 client to use instance methods
    try {
      this.yahoo = new YahooFinance();
    } catch (e) {
      // If instantiation fails, keep a null client and let calls fallback to demo data
      this.yahoo = null;
      console.warn("⚠️ Could not instantiate YahooFinance client:", e.message);
    }
  }

  // Initialize WebSocket server
  initialize(server) {
    this.wss = new WebSocketServer({
      server,
      path: "/ws",
    });

    this.wss.on("connection", (ws, req) => {
      console.log("🔌 New WebSocket connection established");

      // Generate unique client ID
      const clientId = this.generateClientId();

      // Store client with empty subscriptions
      this.clients.set(clientId, {
        ws: ws,
        subscriptions: new Set(),
        lastSeen: Date.now(),
      });

      // Send welcome message
      this.sendToClient(clientId, {
        type: "connected",
        message: "WebSocket connection established",
        clientId: clientId,
      });

      // Handle incoming messages
      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(clientId, data);
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
          this.sendToClient(clientId, {
            type: "error",
            message: "Invalid message format",
          });
        }
      });

      // Handle client disconnect
      ws.on("close", () => {
        console.log(`🔌 Client ${clientId} disconnected`);
        this.clients.delete(clientId);
        this.updateActiveSymbols();
      });

      // Handle errors
      ws.on("error", (error) => {
        console.error(`❌ WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });

    // Start price update service
    this.startPriceUpdates();

    console.log("📡 WebSocket server initialized on /ws endpoint");
  }

  // Handle messages from clients
  handleClientMessage(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (data.type) {
      case "subscribe":
        this.handleSubscribe(clientId, data.symbols || []);
        break;

      case "unsubscribe":
        this.handleUnsubscribe(clientId, data.symbols || []);
        break;

      case "get_price":
        this.handleGetPrice(clientId, data.symbol);
        break;

      case "ping":
        this.sendToClient(clientId, { type: "pong", timestamp: Date.now() });
        break;

      default:
        this.sendToClient(clientId, {
          type: "error",
          message: `Unknown message type: ${data.type}`,
        });
    }
  }

  // Subscribe client to stock symbols
  handleSubscribe(clientId, symbols) {
    const client = this.clients.get(clientId);
    if (!client) return;

    symbols.forEach((symbol) => {
      client.subscriptions.add(symbol.toUpperCase());
      this.stockSymbols.add(symbol.toUpperCase());
    });

    this.sendToClient(clientId, {
      type: "subscribed",
      symbols: Array.from(client.subscriptions),
      message: `Subscribed to ${symbols.length} symbols`,
    });

    console.log(`📊 Client ${clientId} subscribed to:`, symbols);
  }

  // Unsubscribe client from stock symbols
  handleUnsubscribe(clientId, symbols) {
    const client = this.clients.get(clientId);
    if (!client) return;

    symbols.forEach((symbol) => {
      client.subscriptions.delete(symbol.toUpperCase());
    });

    this.updateActiveSymbols();

    this.sendToClient(clientId, {
      type: "unsubscribed",
      symbols: symbols,
      message: `Unsubscribed from ${symbols.length} symbols`,
    });

    console.log(`📊 Client ${clientId} unsubscribed from:`, symbols);
  }

  // Get current price for a specific symbol
  async handleGetPrice(clientId, symbol) {
    try {
      const quote = this.yahoo
        ? await this.yahoo.quote(symbol)
        : await yahooFinance.quote(symbol);

      this.sendToClient(clientId, {
        type: "price_update",
        symbol: symbol,
        data: this.formatPriceData(quote),
      });
    } catch (error) {
      console.error(`❌ Error fetching price for ${symbol}:`, error);
      this.sendToClient(clientId, {
        type: "error",
        message: `Failed to get price for ${symbol}`,
      });
    }
  }

  // Send message to specific client
  sendToClient(clientId, data) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error(`❌ Error sending message to client ${clientId}:`, error);
        this.clients.delete(clientId);
      }
    }
  }

  // Broadcast message to all connected clients
  broadcast(data) {
    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify(data));
        } catch (error) {
          console.error(`❌ Error broadcasting to client ${clientId}:`, error);
          this.clients.delete(clientId);
        }
      }
    });
  }

  // Broadcast price updates to subscribed clients
  broadcastPriceUpdate(symbol, priceData) {
    this.clients.forEach((client, clientId) => {
      if (
        client.subscriptions.has(symbol) &&
        client.ws.readyState === WebSocket.OPEN
      ) {
        this.sendToClient(clientId, {
          type: "price_update",
          symbol: symbol,
          data: priceData,
          timestamp: Date.now(),
        });
      }
    });
  }

  // Start real-time price updates
  startPriceUpdates() {
    // Update prices every 5 seconds for subscribed symbols
    this.priceUpdateInterval = setInterval(async () => {
      if (this.stockSymbols.size === 0) return;

      try {
        // Get popular symbols if no subscriptions
        let symbolsToUpdate = Array.from(this.stockSymbols);

        if (symbolsToUpdate.length === 0) {
          symbolsToUpdate = [
            "RELIANCE.NS",
            "TCS.NS",
            "INFY.NS",
            "HDFCBANK.NS",
            "ITC.NS",
          ];
        }

        // Update prices in batches to avoid rate limits
        const batchSize = 5;
        for (let i = 0; i < symbolsToUpdate.length; i += batchSize) {
          const batch = symbolsToUpdate.slice(i, i + batchSize);
          await this.updatePricesForBatch(batch);

          // Small delay between batches
          if (i + batchSize < symbolsToUpdate.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        console.error("❌ Error in price update cycle:", error);
      }
    }, 5000); // Update every 5 seconds

    console.log("🔄 Real-time price updates started");
  }

  // Update prices for a batch of symbols
  async updatePricesForBatch(symbols) {
    const promises = symbols.map(async (symbol) => {
      try {
        let quote;
        try {
          quote = this.yahoo
            ? await this.yahoo.quote(symbol)
            : await yahooFinance.quote(symbol);
          if (
            !quote ||
            !quote.regularMarketPrice ||
            quote.regularMarketPrice <= 0
          ) {
            throw new Error("Invalid quote data from Yahoo Finance");
          }
        } catch (yahooError) {
          console.log(
            `⚠️  Yahoo Finance error for ${symbol}, generating demo data:`,
            yahooError.message
          );
          // Generate realistic demo data with lower prices
          const basePrice = 50 + Math.random() * 200; // Lower prices for demo
          const change = (Math.random() - 0.5) * 10;
          quote = {
            symbol: symbol,
            regularMarketPrice: basePrice,
            regularMarketChange: change,
            regularMarketChangePercent: (change / basePrice) * 100,
            regularMarketPreviousClose: basePrice - change,
            regularMarketOpen: basePrice + (Math.random() - 0.5) * 10,
            regularMarketDayHigh: basePrice + Math.random() * 20,
            regularMarketDayLow: basePrice - Math.random() * 20,
            regularMarketVolume: Math.floor(Math.random() * 1000000),
            marketCap: Math.floor(Math.random() * 100000000000),
            marketState: "REGULAR",
          };
        }

        const priceData = this.formatPriceData(quote);

        // Broadcast to all subscribed clients
        this.broadcastPriceUpdate(symbol, priceData);

        return { symbol, success: true, data: priceData };
      } catch (error) {
        console.error(`❌ Error updating price for ${symbol}:`, error);
        return { symbol, success: false, error: error.message };
      }
    });

    const results = await Promise.allSettled(promises);
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;

    if (successful > 0) {
      console.log(
        `📊 Updated prices for ${successful}/${symbols.length} symbols`
      );
    }
  }

  // Format price data for WebSocket transmission
  formatPriceData(quote) {
    return {
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      previousClose: quote.regularMarketPreviousClose,
      open: quote.regularMarketOpen,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      timestamp: Date.now(),
      marketState: quote.marketState,
    };
  }

  // Update active symbols based on current subscriptions
  updateActiveSymbols() {
    const activeSymbols = new Set();
    this.clients.forEach((client) => {
      client.subscriptions.forEach((symbol) => {
        activeSymbols.add(symbol);
      });
    });
    this.stockSymbols = activeSymbols;

    console.log(
      `📊 Active symbols updated: ${Array.from(activeSymbols).join(", ")}`
    );
  }

  // Generate unique client ID
  generateClientId() {
    return (
      "client_" +
      Math.random().toString(36).substring(2) +
      Date.now().toString(36)
    );
  }

  // Send market status updates
  broadcastMarketStatus() {
    const now = new Date();
    const marketOpen = this.isMarketOpen(now);

    this.broadcast({
      type: "market_status",
      isOpen: marketOpen,
      timestamp: now.toISOString(),
      nextOpenTime: this.getNextMarketOpenTime(now),
      nextCloseTime: this.getNextMarketCloseTime(now),
    });
  }

  // Check if market is currently open
  isMarketOpen(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const day = date.getDay();

    // Market closed on weekends
    if (day === 0 || day === 6) return false;

    // Market hours: 9:15 AM to 3:30 PM IST
    const marketStart = 9 * 60 + 15; // 9:15 AM in minutes
    const marketEnd = 15 * 60 + 30; // 3:30 PM in minutes
    const currentTime = hours * 60 + minutes;

    return currentTime >= marketStart && currentTime <= marketEnd;
  }

  // Get next market open time
  getNextMarketOpenTime(date) {
    const nextOpen = new Date(date);
    nextOpen.setHours(9, 15, 0, 0);

    // If market already opened today, move to next trading day
    if (
      date.getHours() > 9 ||
      (date.getHours() === 9 && date.getMinutes() >= 15)
    ) {
      nextOpen.setDate(nextOpen.getDate() + 1);

      // Skip weekends
      while (nextOpen.getDay() === 0 || nextOpen.getDay() === 6) {
        nextOpen.setDate(nextOpen.getDate() + 1);
      }
    }

    return nextOpen.toISOString();
  }

  // Get next market close time
  getNextMarketCloseTime(date) {
    const nextClose = new Date(date);
    nextClose.setHours(15, 30, 0, 0);

    // If market already closed today, move to next trading day
    if (
      date.getHours() > 15 ||
      (date.getHours() === 15 && date.getMinutes() >= 30)
    ) {
      nextClose.setDate(nextClose.getDate() + 1);

      // Skip weekends
      while (nextClose.getDay() === 0 || nextClose.getDay() === 6) {
        nextClose.setDate(nextClose.getDate() + 1);
      }
    }

    return nextClose.toISOString();
  }

  // Cleanup on server shutdown
  cleanup() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }

    if (this.wss) {
      this.wss.close();
    }

    console.log("🔌 WebSocket service cleaned up");
  }

  // Get connection statistics
  getStats() {
    return {
      totalClients: this.clients.size,
      activeSymbols: Array.from(this.stockSymbols),
      totalSubscriptions: Array.from(this.clients.values()).reduce(
        (total, client) => total + client.subscriptions.size,
        0
      ),
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
