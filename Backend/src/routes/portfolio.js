import express from "express";
import {
  getPortfolio,
  getHoldings,
  getPortfolioPerformance,
  getPortfolioDiversification,
  addCash,
  withdrawCash,
  getPortfolioAnalytics,
} from "../controllers/portfolioController.js";
import { protect, requireKYC } from "../middleware/auth.js";
import { validatePortfolioQuery } from "../middleware/validation.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Portfolio overview
router.get("/", getPortfolio);
router.get("/holdings", getHoldings);
router.get("/performance", validatePortfolioQuery, getPortfolioPerformance);
router.get("/diversification", getPortfolioDiversification);
router.get("/analytics", getPortfolioAnalytics);

// Cash management (requires KYC)
router.post("/add-cash", requireKYC, addCash);
router.post("/withdraw-cash", requireKYC, withdrawCash);

export default router;
