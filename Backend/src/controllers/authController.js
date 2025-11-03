import User from "../models/User.js";
import Portfolio from "../models/Portfolio.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import emailService from "../utils/emailService.js";

// Helper function to generate and send response with token
const sendTokenResponse = (user, statusCode, res, message) => {
  // Create token
  const token = user.generateToken();
  const refreshToken = user.generateRefreshToken();

  // Add refresh token to user
  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
  });

  // Save refresh token to database (don't wait for it)
  user.save().catch((err) => console.error("Error saving refresh token:", err));

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        accountStatus: user.accountStatus,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isKYCCompleted: user.isKYCCompleted,
        tradingAccountNumber: user.tradingAccountNumber,
        profileImage: user.profileImage,
      },
      token,
      refreshToken,
    },
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, countryCode, password } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Phone number already registered",
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      countryCode: countryCode || "+91",
      password,
    });

    // Create empty portfolio for user
    await Portfolio.create({
      userId: user._id,
    });

    // Generate OTP for email verification
    const emailOTP = user.generateOTP();
    user.emailOTP = {
      code: emailOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    };

    // Generate OTP for phone verification
    const phoneOTP = user.generateOTP();
    user.phoneOTP = {
      code: phoneOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    };

    await user.save();

    // Send OTP via email
    try {
      await emailService.sendOTPEmail(user.email, emailOTP, user.firstName);
      console.log(`Email OTP sent successfully to ${email}`);
    } catch (emailError) {
      console.error("Failed to send email OTP:", emailError);
      // Continue anyway - user can request resend
    }

    // TODO: Send OTP via SMS
    console.log(`Phone OTP for ${phone}: ${phoneOTP}`);

    // Don't send token immediately - wait for email verification
    res.status(201).json({
      success: true,
      message:
        "Account created successfully. Please check your email to verify your account.",
      data: {
        email: user.email,
        otpSent: true,
        emailVerified: user.isEmailVerified,
        // Don't send sensitive user data until verified
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by credentials
    const user = await User.findByCredentials(email, password);

    // Update last login
    user.lastLoginAt = new Date();
    user.lastLoginIP = req.ip || req.connection.remoteAddress;
    await user.save();

    sendTokenResponse(user, 200, res, "Login successful");
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove refresh token from user
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: { token: refreshToken } },
      });
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user and check if refresh token exists
    const user = await User.findOne({
      _id: decoded.id,
      "refreshTokens.token": refreshToken,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new tokens
    const newAccessToken = user.generateToken();
    const newRefreshToken = user.generateRefreshToken();

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.token !== refreshToken
    );
    user.refreshTokens.push({
      token: newRefreshToken,
      createdAt: new Date(),
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public (for email verification) / Private (for other types)
export const verifyOTP = async (req, res, next) => {
  try {
    const { otp, type, email } = req.body;

    let user;

    // For email verification during signup, find user by email
    if (type === "email" && email) {
      user = await User.findOne({ email });
    } else if (req.user) {
      // For other OTP types, user must be authenticated
      user = await User.findById(req.user._id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let isValidOTP = false;

    if (type === "email") {
      if (
        user.emailOTP &&
        user.emailOTP.code === otp &&
        user.emailOTP.expiresAt > new Date()
      ) {
        isValidOTP = true;
        user.isEmailVerified = true;
        user.emailOTP = undefined;

        // For first-time email verification, activate account
        if (user.accountStatus === "pending") {
          user.accountStatus = "active";
        }
      }
    } else if (type === "phone") {
      if (
        user.phoneOTP &&
        user.phoneOTP.code === otp &&
        user.phoneOTP.expiresAt > new Date()
      ) {
        isValidOTP = true;
        user.isPhoneVerified = true;
        user.phoneOTP = undefined;
      }
    }

    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    await user.save();

    // If email verification during signup, send tokens for first login
    if (
      type === "email" &&
      user.isEmailVerified &&
      user.accountStatus === "active"
    ) {
      sendTokenResponse(
        user,
        200,
        res,
        "Email verified successfully! Account activated."
      );
    } else {
      res.status(200).json({
        success: true,
        message: `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } verified successfully`,
        data: {
          user: {
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            accountStatus: user.accountStatus,
          },
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public (for email) / Private (for other types)
export const resendOTP = async (req, res, next) => {
  try {
    const { type, email } = req.body;

    let user;

    // For email resend during signup, find user by email
    if (type === "email" && email) {
      user = await User.findOne({ email });
    } else if (req.user) {
      // For other OTP types, user must be authenticated
      user = await User.findById(req.user._id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (type === "email" && user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    if (type === "phone" && user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Phone is already verified",
      });
    }

    const otp = user.generateOTP();

    if (type === "email") {
      user.emailOTP = {
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      };
      // Send OTP via email
      try {
        await emailService.sendOTPEmail(user.email, otp, user.firstName);
        console.log(`Email OTP resent successfully to ${user.email}`);
      } catch (emailError) {
        console.error("Failed to resend email OTP:", emailError);
        // Continue anyway
      }
    } else if (type === "phone") {
      user.phoneOTP = {
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      };
      // TODO: Send OTP via SMS
      console.log(`Phone OTP for ${user.phone}: ${otp}`);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `OTP sent to your ${type}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash and set to resetPasswordToken field
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    // TODO: Send reset email
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Hash the token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Clear all refresh tokens
    user.refreshTokens = [];

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
