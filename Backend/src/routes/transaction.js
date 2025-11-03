import express from "express";
import {
  placeOrder,
  getTransactions,
  getTransactionById,
  cancelOrder,
  modifyOrder,
  getOrderBook,
  getTradeHistory,
} from "../controllers/transactionController.js";
import {
  protect,
  requireKYC,
  requirePhoneVerification,
} from "../middleware/auth.js";
import {
  validateTransaction,
  validatePagination,
  validateObjectId,
} from "../middleware/validation.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Trading operations (require KYC and phone verification)
router.post(
  "/place-order",
  requireKYC,
  requirePhoneVerification,
  validateTransaction,
  placeOrder
);
router.put("/:id/cancel", requireKYC, validateObjectId("id"), cancelOrder);
router.put("/:id/modify", requireKYC, validateObjectId("id"), modifyOrder);

// Transaction queries
router.get("/", validatePagination, getTransactions);
router.get("/order-book", getOrderBook);
router.get("/trade-history", validatePagination, getTradeHistory);
router.get("/:id", validateObjectId("id"), getTransactionById);

export default router;
