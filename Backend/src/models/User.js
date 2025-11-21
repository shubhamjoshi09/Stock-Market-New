import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Portfolio from "./Portfolio.js";
import Transaction from "./Transaction.js";

const userSchema = new mongoose.Schema(
  {
    // Personal Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [/^[\d\-\+\(\)\s]+$/, "Please provide a valid phone number"],
    },
    countryCode: {
      type: String,
      required: true,
      default: "+91",
    },

    // Authentication
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },

    // Account Status
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isKYCCompleted: {
      type: Boolean,
      default: false,
    },
    accountStatus: {
      type: String,
      enum: ["pending", "active", "suspended", "closed"],
      default: "pending",
    },

    // KYC Information
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    panNumber: {
      type: String,
      uppercase: true,
      sparse: true, // Allows multiple null values
      match: [
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        "Please provide a valid PAN number",
      ],
    },
    aadharNumber: {
      type: String,
      sparse: true,
      match: [/^\d{12}$/, "Please provide a valid Aadhar number"],
    },

    // Address Information
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: "India",
      },
    },

    // Trading Account Information
    tradingAccountNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    dematAccountNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Financial Information
    annualIncome: {
      type: String,
      enum: [
        "below-1-lakh",
        "1-5-lakh",
        "5-10-lakh",
        "10-25-lakh",
        "above-25-lakh",
      ],
    },
    investmentExperience: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },

    // Security
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
          expires: 2592000, // 30 days
        },
      },
    ],

    // OTP for verification
    emailOTP: {
      code: String,
      expiresAt: Date,
    },
    phoneOTP: {
      code: String,
      expiresAt: Date,
    },

    // Password Reset
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Preferences
    preferences: {
      newsletter: {
        type: Boolean,
        default: true,
      },
      smsAlerts: {
        type: Boolean,
        default: true,
      },
      emailAlerts: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        default: "en",
      },
    },

    // Profile Image
    profileImage: {
      type: String,
      default: "",
    },

    // Last Activity
    lastLoginAt: Date,
    lastLoginIP: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes for better query performance
// Note: `email`, `phone`, and `tradingAccountNumber` are declared with
// `unique: true` above which creates indexes automatically. Remove the
// redundant explicit index declarations to avoid duplicate-index warnings.
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash password if it's been modified
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to generate account numbers
userSchema.pre("save", async function (next) {
  if (this.isNew && !this.tradingAccountNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.tradingAccountNumber = `TRD${timestamp.slice(-6)}${random}`;
    this.dematAccountNumber = `DMT${timestamp.slice(-6)}${random}`;
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to generate JWT token
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      accountStatus: this.accountStatus,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });
};

// Instance method to generate OTP
userSchema.methods.generateOTP = function () {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Static method to find by credentials
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Invalid login credentials");
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new Error("Invalid login credentials");
  }

  return user;
};

const User = mongoose.model("User", userSchema);

export default User;

// Cascade delete related documents when a user is removed via Mongoose
// - document removal: userDoc.remove()
// - query removal: User.deleteOne({ _id }) or User.findOneAndDelete({ _id })
// Note: deletions done directly in Mongo shell will NOT trigger these hooks.
userSchema.pre(
  "remove",
  { document: true, query: false },
  async function (next) {
    try {
      const userId = this._id;
      await Promise.all([
        Portfolio.deleteOne({ userId }),
        Transaction.deleteMany({ userId }),
      ]);
      next();
    } catch (err) {
      next(err);
    }
  }
);

// Query middleware for deleteOne / findOneAndDelete
async function cascadeDeleteQueryMiddleware() {
  try {
    const filter = this.getFilter ? this.getFilter() : {};
    const userId = filter._id || filter.id;
    if (!userId) return;
    await Promise.all([
      Portfolio.deleteOne({ userId }),
      Transaction.deleteMany({ userId }),
    ]);
  } catch (err) {
    // Log and allow the query to continue; errors will bubble if needed
    console.warn("⚠️ Error during cascade delete middleware:", err.message);
  }
}

userSchema.pre(
  "deleteOne",
  { document: false, query: true },
  cascadeDeleteQueryMiddleware
);
userSchema.pre(
  "findOneAndDelete",
  { document: false, query: true },
  cascadeDeleteQueryMiddleware
);
