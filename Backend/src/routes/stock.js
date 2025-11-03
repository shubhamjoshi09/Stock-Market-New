import express from "express";
import {
  getAllStocks,
  searchStocks,
  getStockBySymbol,
  getTrendingStocks,
  getTopGainers,
  getTopLosers,
  getStocksBySector,
  getMarketOverview,
  getStockHistory,
  updateStockPrices,
  getRealTimeQuote,
  getMarketIndices,
  forceUpdatePrices,
  getUpdateStatus,
} from "../controllers/stockController.js";
import { optionalAuth } from "../middleware/auth.js";
import {
  validateStockSearch,
  validatePagination,
} from "../middleware/validation.js";

const router = express.Router();

// Public routes with optional authentication
router.get("/", optionalAuth, validatePagination, getAllStocks);
router.get("/search", optionalAuth, validateStockSearch, searchStocks);
router.get("/trending", optionalAuth, getTrendingStocks);
router.get("/top-gainers", optionalAuth, getTopGainers);
router.get("/top-losers", optionalAuth, getTopLosers);
router.get("/market-overview", optionalAuth, getMarketOverview);
router.get("/indices", optionalAuth, getMarketIndices);
router.get("/update-status", optionalAuth, getUpdateStatus);
router.get("/sector/:sector", optionalAuth, getStocksBySector);
router.get("/:symbol", optionalAuth, getStockBySymbol);
router.get("/:symbol/history", optionalAuth, getStockHistory);
router.get("/:symbol/realtime", optionalAuth, getRealTimeQuote);

// Admin routes (would require admin authentication in production)
router.put("/update-prices", updateStockPrices);
router.post("/force-update", forceUpdatePrices);

export default router;
