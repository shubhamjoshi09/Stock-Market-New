import yahooFinance from "yahoo-finance2";

const runTest = async () => {
  try {
    console.log("Testing yahoo-finance2 import and quote()...");
    console.log(
      "yahooFinance:",
      typeof yahooFinance,
      yahooFinance && Object.keys(yahooFinance).slice(0, 10)
    );
    const q = await yahooFinance.quote("RELIANCE.NS");
    console.log("Quote result:", q && q.regularMarketPrice);
  } catch (err) {
    console.error("Test error:", err);
    if (err && err.stack) console.error(err.stack);
  }
};

runTest();
