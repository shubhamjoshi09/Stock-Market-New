import User from "../models/User.js";
import Portfolio from "../models/Portfolio.js";
import Transaction from "../models/Transaction.js";

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res, next) => {
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = [
      "firstName",
      "lastName",
      "phone",
      "dateOfBirth",
      "gender",
      "address",
      "annualIncome",
      "investmentExperience",
      "preferences",
    ];

    const updateObject = {};
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateObject[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updateObject, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete KYC verification
// @route   POST /api/users/kyc
// @access  Private
export const completeKYC = async (req, res, next) => {
  try {
    const {
      panNumber,
      aadharNumber,
      dateOfBirth,
      address,
      annualIncome,
      investmentExperience,
    } = req.body;

    // Check if PAN already exists for another user
    const existingPANUser = await User.findOne({
      panNumber,
      _id: { $ne: req.user._id },
    });

    if (existingPANUser) {
      return res.status(400).json({
        success: false,
        message: "PAN number already registered with another account",
      });
    }

    // Check if Aadhar already exists for another user
    const existingAadharUser = await User.findOne({
      aadharNumber,
      _id: { $ne: req.user._id },
    });

    if (existingAadharUser) {
      return res.status(400).json({
        success: false,
        message: "Aadhar number already registered with another account",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        panNumber,
        aadharNumber,
        dateOfBirth,
        address,
        annualIncome,
        investmentExperience,
        isKYCCompleted: true,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "KYC completed successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile image
// @route   POST /api/users/profile-image
// @access  Private
export const uploadProfileImage = async (req, res, next) => {
  try {
    // This would typically use a file upload service like Cloudinary
    // For now, we'll just simulate the response

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please provide an image file",
      });
    }

    // TODO: Upload to Cloudinary or similar service
    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      data: {
        user,
        imageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    // Check current password
    const isCurrentPasswordCorrect = await user.comparePassword(
      currentPassword
    );
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;

    // Clear all refresh tokens to force re-login on all devices
    user.refreshTokens = [];

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
export const getDashboard = async (req, res, next) => {
  try {
    // Get user's portfolio
    const portfolio = await Portfolio.findOne({ userId: req.user._id });

    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("symbol type quantity price status createdAt");

    // Calculate some basic stats
    const totalTransactions = await Transaction.countDocuments({
      userId: req.user._id,
    });
    const totalBuyOrders = await Transaction.countDocuments({
      userId: req.user._id,
      type: "buy",
      status: "completed",
    });
    const totalSellOrders = await Transaction.countDocuments({
      userId: req.user._id,
      type: "sell",
      status: "completed",
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          fullName: req.user.fullName,
          accountNumber: req.user.tradingAccountNumber,
          accountStatus: req.user.accountStatus,
          isKYCCompleted: req.user.isKYCCompleted,
        },
        portfolio: portfolio || {
          totalInvestedAmount: 0,
          totalCurrentValue: 0,
          totalPnL: 0,
          totalPnLPercentage: 0,
          availableCash: 0,
          holdings: [],
        },
        stats: {
          totalTransactions,
          totalBuyOrders,
          totalSellOrders,
          activeHoldings: portfolio ? portfolio.holdings.length : 0,
        },
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
export const updatePreferences = async (req, res, next) => {
  try {
    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: {
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enable/disable two-factor authentication
// @route   PUT /api/users/two-factor
// @access  Private
export const toggleTwoFactor = async (req, res, next) => {
  try {
    const { enabled } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { twoFactorEnabled: enabled },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: `Two-factor authentication ${
        enabled ? "enabled" : "disabled"
      } successfully`,
      data: {
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get account activity/audit log
// @route   GET /api/users/activity
// @access  Private
export const getAccountActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // This would typically fetch from an audit/activity log collection
    // For now, we'll return transaction history as activity
    const activities = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("symbol type quantity price status createdAt orderPlacedAt");

    const total = await Transaction.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // Check if user has any active holdings
    const portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (portfolio && portfolio.holdings.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete account with active holdings. Please sell all stocks first.",
      });
    }

    // Check for pending transactions
    const pendingTransactions = await Transaction.countDocuments({
      userId: req.user._id,
      status: { $in: ["pending", "open"] },
    });

    if (pendingTransactions > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete account with pending transactions. Please cancel or complete all pending orders first.",
      });
    }

    // Mark account as closed instead of deleting
    user.accountStatus = "closed";
    user.email = `deleted_${Date.now()}_${user.email}`;
    user.phone = `deleted_${Date.now()}_${user.phone}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Account closed successfully",
    });
  } catch (error) {
    next(error);
  }
};
