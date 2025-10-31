import React from "react";

const chargesData = [
  {
    price: "₹0",
    title: "Free equity delivery",
    desc: "All equity delivery investments (NSE, BSE), are absolutely free — ₹0 brokerage.",
  },
  {
    price: "₹20",
    title: "Intraday and F&O trades",
    desc: "Flat ₹20 or 0.03% (whichever is lower) per executed order on intraday trades across equity, currency, and commodity trades. Flat ₹20 on all option trades.",
  },
  {
    price: "₹0",
    title: "Free direct MF",
    desc: "All direct mutual fund investments are absolutely free — ₹0 commissions & DP charges.",
  },
];

export default function ChargesSection() {
  return (
    <section className="w-full bg-white py-30 px-15 md:px-16 text-center">
      <h2 className="text-3xl md:text-4xl font-semibold text-gray-800">
        Charges
      </h2>
      <p className="text-gray-500 mt-2 mb-10">
        List of all charges and taxes
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-15 max-w-6xl mx-auto">
        {chargesData.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center bg-white shadow-md rounded-2xl p-8 hover:shadow-xl transition-all duration-300"
          >
            <div className="text-yellow-500 text-6xl font-bold mb-2">
              {item.price}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              {item.title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
    
  );
}
