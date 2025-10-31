import React from "react";

const ChargesExplained = () => {
  return (
    <div className="min-h-screen bg-white ">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <h1 className="text-3xl font-semibold text-gray-800 ">
          Charges explained
        </h1>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-gray-700 text-[15px] leading-relaxed">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Securities/Commodities transaction tax
              </h2>
              <p>
                Tax by the government when transacting on the exchanges. Charged
                as above on both buy and sell sides when trading equity delivery.
                Charged only on selling side when trading intraday or on F&O.
              </p>
              <p className="mt-2">
                When trading at Zerodha, STT/CTT can be a lot more than the
                brokerage we charge. Important to keep a tab.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Transaction/Turnover Charges
              </h2>
              <p>
                Charged by exchanges (NSE, BSE, MCX) on the value of your
                transactions.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  BSE has revised transaction charges in XC, XD, XT, Z and ZP
                  groups to ₹10,000 per crore w.e.f 01.01.2016.
                </li>
                <li>
                  Revised transaction charges in SS and ST groups to ₹1,00,000
                  per crore of gross turnover.
                </li>
                <li>
                  For group A, B, and other non-exclusive scrips (non-exclusive
                  scrips from group E, F, FC, G, GC, W, T) — ₹375 per crore of
                  turnover on a flat rate basis w.e.f December 1, 2022.
                </li>
                <li>
                  Revised transaction charges in M, MT, TS and MS groups to ₹275
                  per crore of gross turnover.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Call & trade
              </h2>
              <p>
                Additional charges of ₹50 per order for orders placed through a
                dealer at Zerodha including auto square off orders.
              </p>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* GST */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">GST</h2>
              <p>
                Tax levied by the government on the services rendered. 18% of
                (brokerage + SEBI charges + transaction charges).
              </p>
            </section>

            {/* SEBI Charges */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                SEBI Charges
              </h2>
              <p>
                Charged at ₹10 per crore + GST by Securities and Exchange Board
                of India for regulating the markets.
              </p>
            </section>

            {/* DP Charges */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                DP (Depository participant) charges
              </h2>
              <p>
                ₹15.34 per scrip (₹3.5 CDSL fee + ₹9.5 Zerodha fee + ₹2.34 GST)
                is charged on the trading account ledger when stocks are sold,
                irrespective of quantity.
              </p>
              <p className="mt-2">
                Female demat account holders (as first holder) will enjoy a
                discount of ₹0.25 per transaction on the CDSL fee.
              </p>
              <p className="mt-2">
                Debit transactions of mutual funds & bonds get an additional
                discount of ₹0.25 on the CDSL fee.
              </p>
            </section>

            {/* Pledging charges */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Pledging charges
              </h2>
              <p>₹30 + GST per pledge request per ISIN.</p>
            </section>

            {/* AMC */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                AMC (Account maintenance charges)
              </h2>
              <p>
                For BSDA demat account: Zero charges if the holding value is
                less than ₹4,00,000. To learn more about BSDA,{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Click here
                </a>
                .
              </p>
            </section>
          </div>
        </div>
          <section className="max-w-6xl mx-auto py-12 ">
        <h2 className="text-lg font-medium text-gray-800 mb-3">Disclaimer</h2>
        <p className="text-gray-600 text-[15px] leading-relaxed">
          For Delivery based trades, a minimum of ₹0.01 will be charged per
          contract note. Clients who opt to receive physical contract notes will
          be charged ₹20 per contract note plus courier charges. Brokerage will
          not exceed the rates specified by SEBI and the exchanges. All
          statutory and regulatory charges will be levied at actuals. Brokerage
          is also charged on expired, exercised, and assigned options contracts.
          Free investments are available only for our retail individual clients.
          Companies, Partnerships, Trusts, and HUFs need to pay 0.1% or ₹20
          (whichever is less) as delivery brokerage. A brokerage of 0.25% of the
          contract value will be charged for contracts where physical delivery
          happens. For netted off positions in physically settled contracts, a
          brokerage of 0.1% will be charged.
        </p>
      </section>
      </div>
    </div>
  );
};

export default ChargesExplained;
