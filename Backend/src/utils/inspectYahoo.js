(async () => {
  try {
    const mod = await import("yahoo-finance2");
    console.log("Module keys:", Object.keys(mod));
    console.log("Default type:", typeof mod.default);
    console.log("quote type:", typeof mod.quote);
    if (mod.quote) {
      try {
        const q = await mod.quote("RELIANCE.NS");
        console.log("quote result:", q && q.regularMarketPrice);
      } catch (e) {
        console.error("quote call error:", e.message);
      }
    }
    if (mod.default) {
      try {
        // Try calling default as a function
        console.log("Calling default as function...");
        const q2 = await mod.default("RELIANCE.NS");
        console.log(
          "default call result:",
          q2 && (q2.regularMarketPrice || q2.quoteType || q2[0])
        );
      } catch (e) {
        console.error("default call error:", e && e.message);
      }
    }
  } catch (err) {
    console.error("Import error:", err);
  }
})();
