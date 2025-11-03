import React from "react";
import Kite from "../assets/kite.png";
import googlePlay from "../assets/googlePlayBadge.svg";
import appstore from "../assets/appstoreBadge.svg";
import console from "../assets/console.png";
import coin from "../assets/coin.png";
import KiteConnect from "../assets/kiteconnect.png";
import Connect from "../assets/varsity.png";

function ProductSection() {
  return (
    <section className="py-30 px-15 md:px-16 text-center">
      <h1 className="text-3xl font-semibold mb-4">Products</h1>
      <p className="text-gray-600 mb-6">
        Sleek, modern, and intuitive trading platforms
      </p>
      <a
        href="#"
        className="text-blue-600 hover:underline font-medium inline-flex items-center"
      >
        Check out our investment offerings →
      </a>

      {/* Product Card */}
      <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-26">
        <img src={Kite} alt="Kite" className="w-full md:w-1/2" />
        <div className="md:w-1/3 text-left">
          <h2 className="text-3xl font-semibold mb-4">Kite</h2>
          <p className="text-gray-600 leading-relaxed">
            Our ultra-fast flagship trading platform with streaming market data,
            advanced charts, an elegant UI, and more. Enjoy the Kite experience
            seamlessly on your Android and iOS devices.
          </p>
          <div className="flex items-center space-x-20 mb-8">
            <a href="#" className="text-blue-600 hover:underline">
              Try demo →
            </a>
            <a href="#" className="text-blue-600 py-6 hover:underline">
              Learn more →
            </a>
          </div>

          <div className="flex items-center space-x-8">
            <img src={googlePlay} alt="Google Play" className="h-10" />
            <img src={appstore} alt="App Store" className="h-10" />
          </div>
        </div>
      </div>

      <div className="mt-16 flex flex-col-reverse md:flex-row items-center justify-center gap-26">
        <div className="md:w-1/3 text-left">
          <h2 className="text-3xl font-semibold mb-4">Kite Connect API</h2>
          <p className="text-gray-600 leading-relaxed">
            Build powerful trading platforms and experiences with our super simple HTTP/JSON APIs. 
            If you are a startup, build your investment app and showcase it to our clientbase.
          </p>
          <div className="flex items-center space-x-20 mb-15">
            <a href="#" className="text-blue-600 py-6 hover:underline">
              Kite Connect →
            </a>
          </div>
        </div>

        <img
          src={KiteConnect}
          alt="Console"
          className="w-full md:w-1/2"
        />
      </div>

      <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-26">
        <img src={coin} alt="Coin" className="w-full md:w-1/2" />
        <div className="md:w-1/3 text-left">
          <h2 className="text-3xl font-semibold mb-4">Coin</h2>
          <p className="text-gray-600 leading-relaxed">
            Buy direct mutual funds online, commission-free, 
            delivered directly to your Demat account.
            Enjoy the investment experience on your Android and iOS devices.
          </p>
          <div className="flex items-center space-x-20 mb-8">
            <a href="#" className="text-blue-600 py-6 hover:underline">
              Coin →
            </a>

          </div>
          <div className="flex items-center space-x-8">
            <img src={googlePlay} alt="Google Play" className="h-10" />
            <img src={appstore} alt="App Store" className="h-10" />
          </div>
        </div>
      </div>

      <div className="mt-16 flex flex-col-reverse md:flex-row items-center justify-center gap-26">
        <div className="md:w-1/3 text-left">
          <h2 className="text-3xl font-semibold mb-4">Console</h2>
          <p className="text-gray-600 leading-relaxed">
            The central dashboard for your Zerodha account. Gain insights into
            your trades and investments with in-depth reports and
            visualisations.
          </p>
          <div className="flex items-center space-x-20 mb-15">
            <a href="#" className="text-blue-600 py-6 hover:underline">
              Learn more →
            </a>
          </div>
        </div>

        <img
          src={console}
          alt="Console"
          className="w-full md:w-1/2"
        />
      </div>
            <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-26">
        <img src={Connect} alt="Kite" className="w-full md:w-1/2" />
        <div className="md:w-1/3 text-left">
          <h2 className="text-3xl font-semibold mb-4">Varsity mobile</h2>
          <p className="text-gray-600 leading-relaxed">
            An easy to grasp, collection of stock market lessons with in-depth coverage
            and illustrations. Content is broken down into bite-size cards to help you learn on the go.
          </p>
          <div className="flex items-center py-6 space-x-8">
            <img src={googlePlay} alt="Google Play" className="h-10" />
            <img src={appstore} alt="App Store" className="h-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductSection;
