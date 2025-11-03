import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../utils/api.js";
import "./Signup.css";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes timer
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const userSignupData = location.state?.userSignupData;

  // Redirect if no email or signup data
  useEffect(() => {
    if (!email || !userSignupData) {
      navigate("/signup");
    }
  }, [email, userSignupData, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError("Please enter 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiService.verifyOTP({
        email: email,
        otp: otp,
      });

      if (response.success) {
        setSuccess("Account verified successfully! Redirecting to login...");

        setTimeout(() => {
          navigate("/login", {
            state: {
              message: "Account verified successfully! Please login.",
              email: email,
            },
          });
        }, 2000);
      } else {
        setError(response.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("OTP verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiService.resendOTP({ email: email });

      if (response.success) {
        setSuccess("New OTP sent to your email!");
        setTimer(300); // Reset timer
        setCanResend(false);
      } else {
        setError(response.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2>📧 Verify Your Email</h2>
          <p>We've sent a 6-digit OTP to</p>
          <p className="email-highlight">{email}</p>
        </div>

        <form className="signup-form" onSubmit={handleOTPSubmit}>
          <div className="form-group">
            <label htmlFor="otp">Enter OTP:</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // Only digits
                if (value.length <= 6) {
                  setOtp(value);
                }
              }}
              placeholder="123456"
              maxLength="6"
              className="otp-input"
              required
            />
          </div>

          {error && <div className="error-message"> {error}</div>}
          {success && <div className="success-message"> {success}</div>}

          <button
            type="submit"
            className={`signup-btn ${isLoading ? "loading" : ""}`}
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? "🔄 Verifying..." : " Verify OTP"}
          </button>

          <div className="otp-timer">
            {!canResend ? (
              <p>
                Resend OTP in:{" "}
                <span className="timer">{formatTime(timer)}</span>
              </p>
            ) : (
              <button
                type="button"
                className="resend-btn"
                onClick={handleResendOTP}
                disabled={isLoading}
              >
                🔄 Resend OTP
              </button>
            )}
          </div>

          <div className="signup-footer">
            <p>
              Wrong email?
              <span
                className="login-link"
                onClick={() => navigate("/signup")}
                style={{
                  cursor: "pointer",
                  color: "#4CAF50",
                  marginLeft: "5px",
                }}
              >
                Go back to signup
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;
