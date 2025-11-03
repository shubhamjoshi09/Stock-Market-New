import React from "react";
import fundhouse from "../assets/zerodhaFundhouse.png";
import sensibull from "../assets/sensibullLogo.svg";
import tijori from "../assets/goldenpiLogo.png";
import streak from "../assets/streakLogo.png";
import smallcase from "../assets/smallcaseLogo.png";
import ditto from "../assets/dittoLogo.png";
const universeItems = [
  {
    
    logo: fundhouse,
    desc: "Our asset management venture that is creating simple and transparent index funds to help you save for your goals.",
  },
  {
    
    logo: sensibull,
    desc: "Options trading platform that lets you create strategies, analyze positions, and examine data points like open interest, FII/DII, and more.",
  },
  {
  
    logo: tijori,
    desc: "Investment research platform that offers detailed insights on stocks, sectors, supply chains, and more.",
  },
  {
    
    logo: streak,
    desc: "Systematic trading platform that allows you to create and backtest strategies without coding.",
  },
  {
    
    logo: smallcase,
    desc: "Thematic investing platform that helps you invest in diversified baskets of stocks or ETFs.",
  },
  {
    
    logo: ditto,
    desc: "Personalized advice on life and health insurance. No spam and no mis-selling.",
  },
];

function ZerodhaUniverse() {
  return (
    <section className="text-center mt-3 py-20 ">
      <p className="text-gray-800 text-2xl py-15 mb-4">
        Want to know more about our technology stack? Check out the{" "}
        <a
          href="\"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:underline"
        >
          Stock.tech
        </a>{" "}
        blog.
      </p>

      <h2 className="text-3xl font-semibold mb-2">The Stock Universe</h2>
      <p className="text-gray-600 mb-10">
        Extend your trading and investment experience even further with our partner platforms
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {universeItems.map((item) => (
          <div
            key={item.name}
            className="flex flex-col items-center text-center space-y-3"
          >
            <img src={item.logo} alt={item.name} className="h-12 mb-2" />
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-14 py-3 font-semibold text-2xl shadow">
          Sign up for free
        </button>
      </div>
    </section>
  );
}

export default ZerodhaUniverse;
