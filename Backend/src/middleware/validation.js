import { body, param, query, validationResult } from "express-validator";

// Helper function to handle validation results
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// User registration validation
export const validateSignup = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name should only contain letters"),

  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name should only contain letters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("phone")
    .isLength({ min: 10, max: 15 })
    .matches(/^[0-9]+$/)
    .withMessage("Please provide a valid phone number (only digits)"),

  body("countryCode")
    .optional()
    .matches(/^\+\d{1,4}$/)
    .withMessage("Please provide a valid country code"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  handleValidationErrors,
];

// User login validation
export const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

// OTP validation
export const validateOTP = [
  body("otp")
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage("OTP must be a 6-digit number"),

  body("type")
    .isIn(["email", "phone"])
    .withMessage("OTP type must be either email or phone"),

  handleValidationErrors,
];

// Password reset validation
export const validatePasswordReset = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  handleValidationErrors,
];

// New password validation
export const validateNewPassword = [
  body("token").notEmpty().withMessage("Reset token is required"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  handleValidationErrors,
];

// Profile update validation
export const validateProfileUpdate = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name should only contain letters"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name should only contain letters"),

  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth"),

  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),

  handleValidationErrors,
];

// KYC validation
export const validateKYC = [
  body("panNumber")
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage("Please provide a valid PAN number"),

  body("aadharNumber")
    .matches(/^\d{12}$/)
    .withMessage("Please provide a valid Aadhar number"),

  body("dateOfBirth")
    .isISO8601()
    .withMessage("Please provide a valid date of birth"),

  body("address.street").notEmpty().withMessage("Street address is required"),

  body("address.city").notEmpty().withMessage("City is required"),

  body("address.state").notEmpty().withMessage("State is required"),

  body("address.pincode")
    .matches(/^\d{6}$/)
    .withMessage("Please provide a valid 6-digit pincode"),

  handleValidationErrors,
];

// Transaction validation
export const validateTransaction = [
  body("symbol")
    .notEmpty()
    // Allow symbols like 'TCS', 'TCS.NS', 'NIFTY-50', 'ABC_1' etc.
    .matches(/^[A-Za-z0-9._-]+$/)
    .withMessage(
      "Stock symbol is required and may contain letters, numbers, dots, hyphens or underscores"
    ),

  body("type")
    .isIn(["buy", "sell"])
    .withMessage("Transaction type must be buy or sell"),

  body("orderType")
    .isIn(["market", "limit", "stop_loss", "stop_loss_market"])
    .withMessage("Invalid order type"),

  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("segment")
    .isIn(["equity", "futures", "options", "currency", "commodity"])
    .withMessage("Invalid segment"),

  handleValidationErrors,
];

// Stock search validation
export const validateStockSearch = [
  query("q")
    .notEmpty()
    .isLength({ min: 1, max: 50 })
    .withMessage("Search query must be between 1-50 characters"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1-100"),

  handleValidationErrors,
];

// Portfolio query validation
export const validatePortfolioQuery = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO8601 date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO8601 date"),

  handleValidationErrors,
];

// Pagination validation
export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1-100"),

  handleValidationErrors,
];

// MongoDB ObjectId validation
export const validateObjectId = (field = "id") => [
  param(field).isMongoId().withMessage(`Invalid ${field} format`),

  handleValidationErrors,
];
