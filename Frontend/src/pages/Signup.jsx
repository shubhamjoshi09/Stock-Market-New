import React, { useState } from "react";
import Image from "../assets/signup.png";

const Signup = () => {
  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`OTP sent to ${countryCode} ${mobile}`);
  };

  const countries = [
    { code: "+91", name: "🇮🇳" },
    { code: "+1", name: "🇺🇸" },
    { code: "+44", name: "🇬🇧" },
    { code: "+61", name: "🇦🇺" },
    { code: "+971", name: "🇦🇪" },
    { code: "+81", name: "🇯🇵" },
  ];

  return (
    <div className=" pt-28 pb-10 min-h-screen">
      {/* Header Section */}
      <div className="text-center px-4 md:px-0 mb-10 p-5">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
          Open a free demat and trading account online
        </h2>
        <h3 className="text-lg md:text-xl text-gray-600">
          Start investing brokerage-free and join a community of 1.6+ crore
          investors and traders
        </h3>
      </div>

      {/* Signup Form Section */}
      <div className="flex flex-col md:flex-row items-center justify-center px-6 md:px-20">
        <img
          src={Image}
          alt="Illustration"
          className="hidden md:block w-1/2 max-w-lg"
        />

        <div className="max-w-md space-y-6 text-center md:text-left p-8 rounded-xl">
          <h2 className="text-2xl font-semibold text-gray-800">Sign up now</h2>
          <p className="text-gray-500">Or track your existing application</p>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              {/* Country Code Selector */}
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-gray-100 text-gray-700 px-3 py-3 border-r border-gray-300 focus:outline-none"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} {country.code}
                  </option>
                ))}
              </select>


              <input
                type="tel"
                maxLength="10"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter your mobile number"
                required
                className="flex-1 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition"
            >
              Get OTP
            </button>
          </form>

          {/* Info Section */}
          <p className="text-sm text-gray-600">
            By proceeding, you agree to the{" "}
            <span className="text-blue-600 cursor-pointer">Zerodha terms</span>{" "}
            &{" "}
            <span className="text-blue-600 cursor-pointer">privacy policy</span>.
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Looking to open an NRI account?{" "}
            <span className="text-blue-600 cursor-pointer">Click here</span>
          </p>

          {/* Light black line */}
          <hr className="border-t border-gray-300 my-4" />

          <p className="text-sm text-gray-500">
            You will receive an OTP on your number to verify it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
