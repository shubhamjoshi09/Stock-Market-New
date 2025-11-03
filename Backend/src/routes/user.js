import express from "express";
import {
  getProfile,
  updateProfile,
  completeKYC,
  uploadProfileImage,
  changePassword,
  getDashboard,
  updatePreferences,
  toggleTwoFactor,
  getAccountActivity,
  deleteAccount,
} from "../controllers/userController.js";
import { protect, requireEmailVerification } from "../middleware/auth.js";
import {
  validateProfileUpdate,
  validateKYC,
  validatePagination,
} from "../middleware/validation.js";

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// Profile routes
router.get("/profile", getProfile);
router.put("/profile", validateProfileUpdate, updateProfile);
router.post("/profile-image", uploadProfileImage);

// Dashboard
router.get("/dashboard", getDashboard);

// KYC
router.post("/kyc", requireEmailVerification, validateKYC, completeKYC);

// Security
router.put("/change-password", changePassword);
router.put("/two-factor", toggleTwoFactor);

// Preferences
router.put("/preferences", updatePreferences);

// Activity
router.get("/activity", validatePagination, getAccountActivity);

// Account management
router.delete("/account", deleteAccount);

export default router;
