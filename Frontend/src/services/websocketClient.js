class WebSocketClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.subscribers = new Map();
    this.isConnected = false;
    this.heartbeatInterval = null;
  }

  // Connect to WebSocket server
  connect() {
    const wsUrl = `ws://localhost:5000/ws`;

    console.log("🔌 Connecting to WebSocket server...");

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.onOpen.bind(this);
      this.ws.onmessage = this.onMessage.bind(this);
      this.ws.onclose = this.onClose.bind(this);
      this.ws.onerror = this.onError.bind(this);
    } catch (error) {
      console.error("❌ Failed to create WebSocket connection:", error);
      this.scheduleReconnect();
    }
  }

  // Handle connection open
  onOpen(event) {
    console.log("✅ WebSocket connected successfully");
    this.isConnected = true;
    this.reconnectAttempts = 0;

    // Start heartbeat
    this.startHeartbeat();

    // Notify all subscribers about connection
    this.notifySubscribers("connection", { connected: true });
  }

  // Handle incoming messages
  onMessage(event) {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "connected":
          console.log("🎉 WebSocket connection confirmed:", data.message);
          break;

        case "price_update":
          this.handlePriceUpdate(data);
          break;

        case "market_status":
          this.handleMarketStatus(data);
          break;

        case "subscribed":
          console.log("📊 Subscribed to symbols:", data.symbols);
          break;

        case "unsubscribed":
          console.log("📊 Unsubscribed from symbols:", data.symbols);
          break;

        case "pong":
          // Heartbeat response received
          break;

        case "error":
          console.error("❌ WebSocket error:", data.message);
          break;

        default:
          console.log("📨 Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("❌ Error parsing WebSocket message:", error);
    }
  }

  // Handle connection close
  onClose(event) {
    console.log("🔌 WebSocket connection closed:", event.code, event.reason);
    this.isConnected = false;

    // Stop heartbeat
    this.stopHeartbeat();

    // Notify subscribers about disconnection
    this.notifySubscribers("connection", { connected: false });

    // Attempt to reconnect
    this.scheduleReconnect();
  }

  // Handle connection error
  onError(error) {
    console.error("❌ WebSocket error:", error);
  }

  // Handle price updates
  handlePriceUpdate(data) {
    const { symbol, data: priceData, timestamp } = data;

    // Notify price subscribers
    this.notifySubscribers("price_update", {
      symbol: symbol,
      price: priceData.price,
      change: priceData.change,
      changePercent: priceData.changePercent,
      previousClose: priceData.previousClose,
      open: priceData.open,
      dayHigh: priceData.dayHigh,
      dayLow: priceData.dayLow,
      volume: priceData.volume,
      marketCap: priceData.marketCap,
      marketState: priceData.marketState,
      timestamp: timestamp,
    });
  }

  // Handle market status updates
  handleMarketStatus(data) {
    this.notifySubscribers("market_status", {
      isOpen: data.isOpen,
      timestamp: data.timestamp,
      nextOpenTime: data.nextOpenTime,
      nextCloseTime: data.nextCloseTime,
    });
  }

  // Subscribe to stock symbols
  subscribe(symbols) {
    if (!this.isConnected) {
      console.warn("⚠️ WebSocket not connected. Cannot subscribe to symbols.");
      return false;
    }

    const symbolArray = Array.isArray(symbols) ? symbols : [symbols];

    this.send({
      type: "subscribe",
      symbols: symbolArray,
    });

    return true;
  }

  // Unsubscribe from stock symbols
  unsubscribe(symbols) {
    if (!this.isConnected) {
      console.warn(
        "⚠️ WebSocket not connected. Cannot unsubscribe from symbols."
      );
      return false;
    }

    const symbolArray = Array.isArray(symbols) ? symbols : [symbols];

    this.send({
      type: "unsubscribe",
      symbols: symbolArray,
    });

    return true;
  }

  // Get current price for a symbol
  getPrice(symbol) {
    if (!this.isConnected) {
      console.warn("⚠️ WebSocket not connected. Cannot get price.");
      return false;
    }

    this.send({
      type: "get_price",
      symbol: symbol,
    });

    return true;
  }

  // Add event listener
  addEventListener(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      this.removeEventListener(eventType, callback);
    };
  }

  // Remove event listener
  removeEventListener(eventType, callback) {
    if (this.subscribers.has(eventType)) {
      this.subscribers.get(eventType).delete(callback);
    }
  }

  // Notify subscribers
  notifySubscribers(eventType, data) {
    if (this.subscribers.has(eventType)) {
      this.subscribers.get(eventType).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in ${eventType} callback:`, error);
        }
      });
    }
  }

  // Send message to server
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    } else {
      console.warn("⚠️ WebSocket not ready. Message not sent:", data);
      return false;
    }
  }

  // Start heartbeat to keep connection alive
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: "ping" });
      }
    }, 30000); // Ping every 30 seconds
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Schedule reconnection attempt
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Max reconnection attempts reached. Giving up.");
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(
      `🔄 Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`
    );

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, delay);
  }

  // Disconnect from WebSocket
  disconnect() {
    console.log("🔌 Disconnecting from WebSocket...");

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }

    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Create singleton instance
const websocketClient = new WebSocketClient();

export default websocketClient;
