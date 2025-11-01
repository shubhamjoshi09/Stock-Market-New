import React from "react";

const AccountCharges = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Top Note */}
        <p className="text-center text-blue-600 text-lg mb-8 hover:text-gray-700">
          Calculate your Costs upfront<span className=" text-gray-700 cursor-pointer"> using our brokerage calculator</span>
        </p>

        {/* Charges for account opening */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Charges for account opening
          </h2>

          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium w-3/4">Type of account</th>
                  <th className="px-6 py-3 font-medium text-right">Charges</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-3">Online account</td>
                  <td className="px-6 py-3 text-right">
                    <span className="text-green-600 font-semibold">FREE</span>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-3">Offline account</td>
                  <td className="px-6 py-3 text-right">
                    <span className="text-green-600 font-semibold">FREE</span>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-3">NRI account (offline only)</td>
                  <td className="px-6 py-3 text-right">₹ 500</td>
                </tr>
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3">
                    Partnership, LLP, HUF, or Corporate accounts (offline only)
                  </td>
                  <td className="px-6 py-3 text-right">₹ 500</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="min-h-screen bg-white  py-12">
      <div className="max-w-7xl mx-auto">
        {/* Demat AMC Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Demat AMC (Annual Maintenance Charge)
          </h2>

          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium w-3/4">
                    Value of holdings
                  </th>
                  <th className="px-6 py-3 font-medium text-right">AMC</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-3">Up to ₹4 lakh</td>
                  <td className="px-6 py-3 text-right">
                    <span className="text-green-600 font-semibold">FREE</span>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-3">₹4 lakh – ₹10 lakh</td>
                  <td className="px-6 py-3 text-right">
                    ₹100 per year, charged quarterly
                    <sup className="text-gray-400">*</sup>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3">Above ₹10 lakh</td>
                  <td className="px-6 py-3 text-right">
                    ₹300 per year, charged quarterly
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-600 mt-3 leading-relaxed">
            * Lower AMC is applicable only if the account qualifies as a Basic
            Services Demat Account (BSDA). BSDA account holders cannot hold more
            than one demat account. To learn more about BSDA,{" "}
            <a
              href="#"
              className="text-blue-600 hover:underline"
            >
              click here
            </a>
            .
          </p>
        </section>

        {/* Value Added Services Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Charges for optional value added services
          </h2>

          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium">Service</th>
                  <th className="px-6 py-3 font-medium">Billing Frequency</th>
                  <th className="px-6 py-3 font-medium text-right">Charges</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-3">Tickertape</td>
                  <td className="px-6 py-3">Monthly / Annual</td>
                  <td className="px-6 py-3 text-right">
                    Free: 0 | Pro: 249 / 2399
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-3">Smallcase</td>
                  <td className="px-6 py-3">Per transaction</td>
                  <td className="px-6 py-3 text-right">
                    Buy & Invest More: 100 | SIP: 10
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3">Kite Connect</td>
                  <td className="px-6 py-3">Monthly</td>
                  <td className="px-6 py-3 text-right">
                    Connect: 500 | Personal: Free
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
           <p className="text-center text-blue-600 text-lg py-8 px-12 hover:text-gray-700">
          NRI brokerage charges <span className=" text-gray-700 cursor-pointer"> using our brokerage calculator
          For a non-PIS account, 0.5% or ₹50 per executed order for equity and F&O (whichever is lower).
          For a PIS account, 0.5% or ₹200 per executed order for equity (whichever is lower).
          ₹500 + GST as year.
          </span>
        </p>
        </section>
      </div>
    </div>
    
      </div>
    </div>


    

  );
};

export default AccountCharges;
