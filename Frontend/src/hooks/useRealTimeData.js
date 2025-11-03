import { useState, useEffect, useCallback, useRef } from "react";
import websocketClient from "../services/websocketClient";

// Custom hook for real-time stock data
export const useRealTimeStock = (symbols = []) => {
  const [stockData, setStockData] = useState({});
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [error, setError] = useState(null);
  const subscribedSymbolsRef = useRef(new Set());
  const isInitializedRef = useRef(false);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isInitializedRef.current) {
      console.log("🚀 Initializing WebSocket connection...");

      // Connect to WebSocket
      websocketClient.connect();

      // Listen for connection status changes
      const connectionUnsubscribe = websocketClient.addEventListener(
        "connection",
        (data) => {
          setConnectionStatus(data.connected ? "connected" : "disconnected");
          if (data.connected) {
            setError(null);
          }
        }
      );

      // Listen for price updates
      const priceUnsubscribe = websocketClient.addEventListener(
        "price_update",
        (data) => {
          setStockData((prevData) => ({
            ...prevData,
            [data.symbol]: {
              ...prevData[data.symbol],
              ...data,
              lastUpdated: new Date().toISOString(),
            },
          }));
        }
      );

      isInitializedRef.current = true;

      // Cleanup on unmount
      return () => {
        connectionUnsubscribe();
        priceUnsubscribe();
        websocketClient.disconnect();
        isInitializedRef.current = false;
      };
    }
  }, []);

  // Subscribe to symbols
  useEffect(() => {
    if (connectionStatus === "connected" && symbols.length > 0) {
      const symbolsArray = Array.isArray(symbols) ? symbols : [symbols];

      // Find new symbols to subscribe
      const newSymbols = symbolsArray.filter(
        (symbol) => !subscribedSymbolsRef.current.has(symbol)
      );

      // Find symbols to unsubscribe
      const symbolsToUnsubscribe = Array.from(
        subscribedSymbolsRef.current
      ).filter((symbol) => !symbolsArray.includes(symbol));

      // Subscribe to new symbols
      if (newSymbols.length > 0) {
        console.log("📊 Subscribing to new symbols:", newSymbols);
        websocketClient.subscribe(newSymbols);
        newSymbols.forEach((symbol) =>
          subscribedSymbolsRef.current.add(symbol)
        );
      }

      // Unsubscribe from removed symbols
      if (symbolsToUnsubscribe.length > 0) {
        console.log("📊 Unsubscribing from symbols:", symbolsToUnsubscribe);
        websocketClient.unsubscribe(symbolsToUnsubscribe);
        symbolsToUnsubscribe.forEach((symbol) =>
          subscribedSymbolsRef.current.delete(symbol)
        );
      }
    }
  }, [symbols, connectionStatus]);

  // Get current price for a symbol
  const getCurrentPrice = useCallback(
    (symbol) => {
      if (connectionStatus === "connected") {
        websocketClient.getPrice(symbol);
      }
    },
    [connectionStatus]
  );

  // Subscribe to additional symbols
  const subscribeToSymbol = useCallback(
    (symbol) => {
      if (
        connectionStatus === "connected" &&
        !subscribedSymbolsRef.current.has(symbol)
      ) {
        websocketClient.subscribe([symbol]);
        subscribedSymbolsRef.current.add(symbol);
      }
    },
    [connectionStatus]
  );

  // Unsubscribe from symbols
  const unsubscribeFromSymbol = useCallback(
    (symbol) => {
      if (
        connectionStatus === "connected" &&
        subscribedSymbolsRef.current.has(symbol)
      ) {
        websocketClient.unsubscribe([symbol]);
        subscribedSymbolsRef.current.delete(symbol);
      }
    },
    [connectionStatus]
  );

  return {
    stockData,
    connectionStatus,
    error,
    isConnected: connectionStatus === "connected",
    getCurrentPrice,
    subscribeToSymbol,
    unsubscribeFromSymbol,
    subscribedSymbols: Array.from(subscribedSymbolsRef.current),
  };
};

// Custom hook for market status
export const useMarketStatus = () => {
  const [marketStatus, setMarketStatus] = useState({
    isOpen: false,
    nextOpenTime: null,
    nextCloseTime: null,
    lastUpdated: null,
  });

  useEffect(() => {
    // Listen for market status updates
    const unsubscribe = websocketClient.addEventListener(
      "market_status",
      (data) => {
        setMarketStatus({
          isOpen: data.isOpen,
          nextOpenTime: data.nextOpenTime,
          nextCloseTime: data.nextCloseTime,
          lastUpdated: data.timestamp,
        });
      }
    );

    return unsubscribe;
  }, []);

  return marketStatus;
};

// Custom hook for WebSocket connection status
export const useWebSocketStatus = () => {
  const [status, setStatus] = useState("disconnected");

  useEffect(() => {
    const unsubscribe = websocketClient.addEventListener(
      "connection",
      (data) => {
        setStatus(data.connected ? "connected" : "disconnected");
      }
    );

    // Get initial status
    const initialStatus = websocketClient.getConnectionStatus();
    setStatus(initialStatus.connected ? "connected" : "disconnected");

    return unsubscribe;
  }, []);

  return {
    status,
    isConnected: status === "connected",
    isDisconnected: status === "disconnected",
  };
};

// Custom hook for portfolio real-time updates
export const useRealTimePortfolio = (holdings = []) => {
  const symbols = holdings.map((holding) => holding.symbol);
  const { stockData, connectionStatus, isConnected } =
    useRealTimeStock(symbols);

  // Calculate updated portfolio data
  const updatedHoldings = holdings.map((holding) => {
    const realTimeData = stockData[holding.symbol];

    if (realTimeData) {
      const currentPrice = realTimeData.price;
      const currentValue = holding.quantity * currentPrice;
      const investedValue = holding.quantity * holding.avgPrice;
      const pnl = currentValue - investedValue;
      const pnlPercentage = (pnl / investedValue) * 100;

      return {
        ...holding,
        currentPrice: currentPrice,
        currentValue: currentValue,
        pnl: pnl,
        pnlPercentage: pnlPercentage,
        dayChange: realTimeData.change,
        dayChangePercentage: realTimeData.changePercent,
        lastUpdated: realTimeData.lastUpdated,
        marketState: realTimeData.marketState,
      };
    }

    return holding;
  });

  // Calculate portfolio totals
  const portfolioTotals = updatedHoldings.reduce(
    (totals, holding) => {
      return {
        totalCurrentValue:
          totals.totalCurrentValue + (holding.currentValue || 0),
        totalInvestedValue:
          totals.totalInvestedValue + holding.quantity * holding.avgPrice,
        totalPnL: totals.totalPnL + (holding.pnl || 0),
      };
    },
    {
      totalCurrentValue: 0,
      totalInvestedValue: 0,
      totalPnL: 0,
    }
  );

  portfolioTotals.totalPnLPercentage =
    portfolioTotals.totalInvestedValue > 0
      ? (portfolioTotals.totalPnL / portfolioTotals.totalInvestedValue) * 100
      : 0;

  return {
    holdings: updatedHoldings,
    totals: portfolioTotals,
    connectionStatus,
    isConnected,
    lastUpdated: new Date().toISOString(),
  };
};

export default {
  useRealTimeStock,
  useMarketStatus,
  useWebSocketStatus,
  useRealTimePortfolio,
};
