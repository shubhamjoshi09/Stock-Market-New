import express from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import {
  validateSignup,
  validateLogin,
  validateOTP,
  validatePasswordReset,
  validateNewPassword,
} from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
router.post("/refresh", refreshToken);
router.post("/forgot-password", validatePasswordReset, forgotPassword);
router.post("/reset-password", validateNewPassword, resetPassword);
router.post("/verify-otp", validateOTP, verifyOTP); // Public for email verification
router.post("/resend-otp", resendOTP); // Public for email resend

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
