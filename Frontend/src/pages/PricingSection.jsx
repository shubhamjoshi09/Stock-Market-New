import React from "react";
import pressImg from "../assets/pressLogos.png";
import educationImg from "../assets/education.svg";
import pricingImg from "../assets/pricing0.svg";
import intradayImg from "../assets/intradayTrades.svg";

const PricingSection = () => {
  return (
    <div className="bg-white text-gray-800 py-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="flex flex-wrap justify-center items-center gap-10 mb-16 opacity-70">
          <img
            src={pressImg}
            alt="Zerodha Dashboard"
            className="w-full max-w-4xl"
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start w-full gap-10">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Unbeatable pricing
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We pioneered the concept of discount broking and price
              transparency in India. Flat fees and no hidden charges.
            </p>
            <a
              href="#"
              className="text-blue-600 font-medium hover:underline inline-flex items-center"
            >
              See pricing →
            </a>
          </div>

          <div className="flex flex-wrap md:flex-nowrap justify-start md:justify-end gap-8 text-center w-full md:w-1/2">
            <div>
              <img src={pricingImg} alt="picrupess" />
              <p className="text-gray-600 text-sm">Free account opening</p>
            </div>
            <div>
              <img src={pricingImg} alt="picrupess" />
              <p className="text-gray-600 text-xs">
                Free equity delivery <br />
                and direct mutual funds
              </p>
            </div>
            <div>
              <img src={intradayImg} alt="picrupess" />
              <p className="text-gray-600 text-sm">Intraday and F&O</p>
            </div>
          </div>
        </div>
        <section className="bg-white py-20 px-6 md:px-16 font-sans">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="relative flex justify-center">
              <img
                src={educationImg}
                alt="Zerodha Dashboard"
                className="w-full max-w-3xl"
              />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-5 text-gray-800">
                Free and open market education
              </h2>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Varsity, the largest online stock market education book in the
                world covering everything from the basics to advanced trading.
              </p>

              <a
                href="#"
                className="text-blue-600 font-medium hover:underline inline-block mb-6"
              >
                Varsity →
              </a>

              <p className="text-gray-600 mb-3 leading-relaxed">
                TradingQ&amp;A, the most active trading and investment community
                in India for all your market related queries.
              </p>

              <a
                href="#"
                className="text-blue-600 font-medium hover:underline inline-block"
              >
                TradingQ&amp;A →
              </a>
            </div>
          </div>
        </section>
        <h1 className="text-3xl md:text-3xl font-semibold text-gray-800 mb-4">
          Open a Stock Market account
        </h1>
        <p className="text-gray-600 text-sm md:text-xl mb-8 max-w-3xl">
          Modern platforms and apps, ₹0 investments, and flat ₹20 intraday and F&O trades.
        </p>
         <button className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-all">
        Sign up for free
      </button>
      </div>
    </div>
  );
};

export default PricingSection;
