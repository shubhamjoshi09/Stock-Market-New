import express from "express";
import yahooFinance from "yahoo-finance2";
import Portfolio from "../models/Portfolio.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import emailService from "../utils/emailService.js";

const router = express.Router();

/**
 * ✅ Utility: Send trade confirmation email
 */
async function sendTradeConfirmationEmail(
  email,
  { symbol, action, quantity, price, totalValue, date }
) {
  try {
    const subject = `Trade Confirmation: ${action} ${symbol}`;
    const message = `
      <h2>Trade Confirmation</h2>
      <p>Dear Trader,</p>
      <p>Your trade has been executed successfully.</p>
      <ul>
        <li><strong>Symbol:</strong> ${symbol}</li>
        <li><strong>Action:</strong> ${action}</li>
        <li><strong>Quantity:</strong> ${quantity}</li>
        <li><strong>Price:</strong> ₹${price}</li>
        <li><strong>Total Value:</strong> ₹${totalValue.toFixed(2)}</li>
        <li><strong>Date:</strong> ${date}</li>
      </ul>
      <p>Thank you for trading with us.<br/>- Zerodha Clone Team</p>
    `;
    await emailService.sendEmail(email, subject, message);
    console.log(`📧 Trade confirmation email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send trade confirmation email:", error.message);
  }
}

/**
 * 📈 Fetch live or mock stock price
 */
router.get("/price/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    let priceData;

    try {
      priceData = await yahooFinance.quote(symbol);
    } catch (error) {
      console.warn(
        `⚠️ Yahoo Finance error for ${symbol}, generating mock data`
      );
      priceData = {
        regularMarketPrice: (Math.random() * 500 + 100).toFixed(2),
        regularMarketChangePercent: (Math.random() * 4 - 2).toFixed(2),
      };
    }

    res.json({
      symbol,
      price: priceData.regularMarketPrice,
      changePercent: priceData.regularMarketChangePercent,
    });
  } catch (err) {
    console.error("Error fetching stock price:", err);
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

/**
 * 💹 Place an order (BUY/SELL)
 */
router.post("/place-order", async (req, res) => {
  console.log("📥 Incoming Order Request:", req.body);

  try {
    const { userId, symbol, action, quantity } = req.body;

    if (!userId || !symbol || !action || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get current price
    let priceData;
    try {
      priceData = await yahooFinance.quote(symbol);
    } catch {
      console.warn(`⚠️ Yahoo error for ${symbol}, using demo price`);
      priceData = {
        regularMarketPrice: (Math.random() * 500 + 100).toFixed(2),
      };
    }

    const currentPrice = parseFloat(priceData.regularMarketPrice);
    const totalValue = currentPrice * quantity;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio)
      return res.status(404).json({ error: "Portfolio not found" });

    if (action === "BUY" && portfolio.availableCash < totalValue) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Update portfolio cash and holdings
    if (action === "BUY") {
      // Deduct from portfolio available cash
      portfolio.availableCash = parseFloat(
        (portfolio.availableCash - totalValue).toFixed(2)
      );

      // Ensure symbol casing matches schema
      const sym = String(symbol).toUpperCase();
      const existingHolding = portfolio.holdings.find((s) => s.symbol === sym);

      if (existingHolding) {
        // Recalculate invested amount and average price
        existingHolding.quantity += quantity;
        existingHolding.investedAmount =
          (existingHolding.investedAmount || 0) + quantity * currentPrice;
        existingHolding.averagePrice =
          existingHolding.investedAmount / existingHolding.quantity;
        existingHolding.currentPrice = currentPrice;
        existingHolding.currentValue = existingHolding.quantity * currentPrice;
      } else {
        // Add new holding with required fields
        portfolio.holdings.push({
          symbol: sym,
          companyName: sym,
          exchange: "NSE",
          quantity,
          averagePrice: currentPrice,
          investedAmount: quantity * currentPrice,
          currentPrice: currentPrice,
          currentValue: quantity * currentPrice,
          lastUpdated: new Date(),
        });
      }
    } else if (action === "SELL") {
      const sym = String(symbol).toUpperCase();
      const holdingIndex = portfolio.holdings.findIndex((s) => s.symbol === sym);
      if (holdingIndex === -1 || portfolio.holdings[holdingIndex].quantity < quantity) {
        return res.status(400).json({ error: "Not enough shares to sell" });
      }

      const holding = portfolio.holdings[holdingIndex];
      // Reduce quantity and update invested amount based on averagePrice
      holding.quantity -= quantity;
      holding.investedAmount = holding.quantity * holding.averagePrice;
      holding.currentPrice = currentPrice;
      holding.currentValue = holding.quantity * currentPrice;

      // Credit cash to portfolio
      portfolio.availableCash = parseFloat(
        (portfolio.availableCash + totalValue).toFixed(2)
      );

      if (holding.quantity <= 0) {
        portfolio.holdings.splice(holdingIndex, 1);
      }
    }

    await user.save();
    await portfolio.save();

    // 🧾 Record transaction
    const transaction = new Transaction({
      userId,
      symbol,
      companyName: symbol,
      type: action.toUpperCase(),
      segment: "EQUITY",
      quantity,
      price: currentPrice,
      grossAmount: totalValue,
      netAmount: totalValue,
      orderType: "MARKET",
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: "completed",
      timestamp: new Date(),
    });

    await transaction.save();

    // 📧 Send confirmation email
    await sendTradeConfirmationEmail(user.email, {
      symbol,
      action,
      quantity,
      price: currentPrice,
      totalValue,
      date: new Date().toLocaleString(),
    });

    res.status(200).json({
      message: "Trade executed successfully",
      transaction,
      balance: portfolio.availableCash,
    });
  } catch (err) {
    console.error("Error placing trade:", err);
    res.status(500).json({ error: "Failed to place order" });
  }
});

/**
 * 🧾 Get all transactions of a user
 */
router.get("/transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await Transaction.find({ userId }).sort({
      timestamp: -1,
    });
    res.json(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

export default router;
