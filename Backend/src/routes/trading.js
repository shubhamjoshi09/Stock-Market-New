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

    if (action === "BUY" && user.balance < totalValue) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Update balance and portfolio
    if (action === "BUY") {
      user.balance -= totalValue;
      const existingStock = portfolio.stocks.find((s) => s.symbol === symbol);
      if (existingStock) {
        existingStock.quantity += quantity;
        existingStock.averagePrice =
          (existingStock.averagePrice + currentPrice) / 2;
      } else {
        portfolio.stocks.push({ symbol, quantity, averagePrice: currentPrice });
      }
    } else if (action === "SELL") {
      const stockIndex = portfolio.stocks.findIndex((s) => s.symbol === symbol);
      if (
        stockIndex === -1 ||
        portfolio.stocks[stockIndex].quantity < quantity
      ) {
        return res.status(400).json({ error: "Not enough shares to sell" });
      }

      portfolio.stocks[stockIndex].quantity -= quantity;
      user.balance += totalValue;

      if (portfolio.stocks[stockIndex].quantity === 0) {
        portfolio.stocks.splice(stockIndex, 1);
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
      balance: user.balance,
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
