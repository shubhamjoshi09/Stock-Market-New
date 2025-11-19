import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found. Please log in again.",
        });
      }

      // Check if user account is active
      if (
        req.user.accountStatus !== "active" &&
        req.user.accountStatus !== "pending"
      ) {
        return res.status(401).json({
          success: false,
          message: "Account is suspended or closed. Please contact support.",
        });
      }

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({
        success: false,
        message: "Not authorized. Invalid token.",
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Not authorized. No token provided.",
    });
  }
};

// Optional authentication - doesn't require token but sets user if provided
export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // Token invalid but continue without user
      req.user = null;
    }
  }

  next();
};

// Require specific user roles/permissions
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

// Check if user's KYC is completed for trading operations
// export const requireKYC = (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({
//       success: false,
//       message: "Authentication required",
//     });
//   }

//   if (!req.user.isKYCCompleted) {
//     return res.status(403).json({
//       success: false,
//       message: "KYC verification required to perform this action",
//     });
//   }

//   next();
// };

export const requireKYC = (req, res, next) => {
  return next(); // KYC disabled
};


// Check if user's email is verified
export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Email verification required",
    });
  }

  next();
};

// Check if user's phone is verified
// export const requirePhoneVerification = (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({
//       success: false,
//       message: "Authentication required",
//     });
//   }

//   if (!req.user.isPhoneVerified) {
//     return res.status(403).json({
//       success: false,
//       message: "Phone verification required",
//     });
//   }

//   next();
// };

export const requirePhoneVerification = (req, res, next) => {
  return next(); // Phone verification disabled
};

