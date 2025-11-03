import connectDB from "../config/database.js";
import { seedStockData } from "./seedData.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const runSeeder = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log("🚀 Starting data seeding process...");

    // Seed stock data
    await seedStockData();

    console.log("✅ Data seeding completed successfully!");
    console.log("🎯 You can now start the server with: npm run dev");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

// Run the seeder
runSeeder();
