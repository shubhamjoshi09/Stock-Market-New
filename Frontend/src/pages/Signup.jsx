import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../utils/api";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        countryCode: "+91",
      });

      if (response.success) {
        // Don't store token yet - user needs to verify OTP first
        alert(
          `Registration successful! OTP sent to ${formData.email}. Please check your email.`
        );
        // Redirect to OTP verification page with email and signup data
        navigate("/verify-otp", {
          state: {
            email: formData.email,
            userSignupData: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
            },
          },
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      // Show detailed error if available
      if (error.message && error.message.includes("Validation failed")) {
        setError("Please check your input fields and try again.");
      } else {
        setError(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-10 min-h-screen">
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
          src="https://zerodha.com/static/images/landing.png"
          alt="Illustration"
          className="hidden md:block w-1/2 max-w-lg"
        />

        <div className="max-w-md space-y-6 text-center md:text-left p-8 rounded-xl">
          <h2 className="text-2xl font-semibold text-gray-800">Sign up now</h2>
          <p className="text-gray-500">Create your trading account</p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
                className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Phone */}
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Mobile Number"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Password */}
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              minLength="8"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Confirm Password */}
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              minLength="8"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-md font-medium transition ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed text-gray-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700 inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Info Section */}
          <p className="text-sm text-gray-600">
            By proceeding, you agree to the{" "}
            <span className="text-blue-600 cursor-pointer">terms</span> &{" "}
            <span className="text-blue-600 cursor-pointer">privacy policy</span>
            .
          </p>

          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Login here
            </Link>
          </p>

          {/* Light black line */}
          <hr className="border-t border-gray-300 my-4" />

          <p className="text-sm text-gray-500">
            You will receive an OTP on your email to verify your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
