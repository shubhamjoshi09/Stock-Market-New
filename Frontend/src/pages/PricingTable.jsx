import React, { useState } from "react";

const PricingTable = () => {
  const [activeTab, setActiveTab] = useState("equity");

  const tabs = ["equity", "currency", "commodity"];

  const data = {
    equity: {
      headers: ["Equity delivery", "Equity intraday", "F&O - Futures", "F&O - Options"],
      rows: [
        ["Zero Brokerage", "0.03% or Rs. 20/executed order whichever is lower", "0.03% or Rs. 20/executed order whichever is lower", "Flat Rs. 20 per executed order"],
        ["0.1% on buy & sell", "0.025% on sell side", "0.02% on sell side", "0.125% of intrinsic value on exercised options, 0.1% on sell side"],
        ["NSE: 0.00297%, BSE: 0.00375%", "NSE: 0.00297%, BSE: 0.00375%", "NSE: 0.00173%, BSE: 0", "NSE: 0.03503%, BSE: 0.0325%"],
        ["18% on (brokerage + SEBI + transaction charges)", "18% on (brokerage + SEBI + transaction charges)", "18% on (brokerage + SEBI + transaction charges)", "18% on (brokerage + SEBI + transaction charges)"],
        ["₹10 / crore", "₹10 / crore", "₹10 / crore", "₹10 / crore"],
        ["0.015% or ₹1500/crore (buy side)", "0.003% or ₹300/crore (buy side)", "0.002% or ₹200/crore (buy side)", "0.003% or ₹300/crore (buy side)"],
      ],
      rowLabels: ["Brokerage", "STT/CTT", "Transaction charges", "GST", "SEBI charges", "Stamp charges"],
    },
    currency: {
      headers: ["Currency Futures", "Currency Options"],
      rows: [
        ["₹20 per executed order or 0.03% whichever is lower", "₹20 per executed order"],
        ["0.0001% on sell side", "0.0001% on sell side"],
        ["NSE: 0.0009%, BSE: 0.00022%", "NSE: 0.0009%, BSE: 0.00022%"],
        ["18% on (brokerage + SEBI + transaction charges)", "18% on (brokerage + SEBI + transaction charges)"],
        ["₹10 / crore", "₹10 / crore"],
        ["0.0001% or ₹100/crore (buy side)", "0.0001% or ₹100/crore (buy side)"],
      ],
      rowLabels: ["Brokerage", "STT/CTT", "Transaction charges", "GST", "SEBI charges", "Stamp charges"],
    },
    commodity: {
      headers: ["Commodity Futures", "Commodity Options"],
      rows: [
        ["0.03% or Rs. 20/executed order whichever is lower", "Rs. 20 per executed order"],
        ["0.01% on sell side (non-agri)", "0.05% on sell side (on premium)"],
        ["NSE: 0.0026%, BSE: 0.0026%", "NSE: 0.0026%, BSE: 0.0026%"],
        ["18% on (brokerage + SEBI + transaction charges)", "18% on (brokerage + SEBI + transaction charges)"],
        ["₹10 / crore", "₹10 / crore"],
        ["0.002% or ₹200/crore (buy side)", "0.002% or ₹200/crore (buy side)"],
      ],
      rowLabels: ["Brokerage", "STT/CTT", "Transaction charges", "GST", "SEBI charges", "Stamp charges"],
    },
  };

  const activeData = data[activeTab];

  return (
    // <div className="w-full min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-semibold text-gray-800 mb-8 text-center">Stock Brokerage Charges</h1>

        {/* Tabs */}
        <div className="flex justify-center border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-lg font-medium capitalize border-b-2 transition-all duration-300 ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-blue-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 text-sm text-left">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="border px-4 py-3 w-1/5">Charges</th>
                {activeData.headers.map((header, index) => (
                  <th key={index} className="border px-4 py-3 text-center">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeData.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t hover:bg-gray-50">
                  <td className="border px-4 py-3 font-medium text-gray-700">{activeData.rowLabels[rowIndex]}</td>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border px-4 py-3 text-gray-600 text-center">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    // </div>
  );
};

export default PricingTable;
