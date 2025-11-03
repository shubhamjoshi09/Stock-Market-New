import React from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/homeHero.png";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleSignupClick = () => {
    navigate("/signup");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
      <img src={heroImg} alt="Zerodha Dashboard" className="w-full max-w-4xl" />

      <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
        Invest in everything
      </h1>

      <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-2xl">
        Online platform to invest in stocks, derivatives, mutual funds, ETFs,
        bonds, and more.
      </p>

      <button
        onClick={handleSignupClick}
        className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-all cursor-pointer"
      >
        Sign up for free
      </button>
    </div>
  );
};

export default HeroSection;
