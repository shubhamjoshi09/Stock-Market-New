import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
// Pages
import HeroSection from "./pages/HeroSection";
import TrustSection from "./pages/TrustSection";
import PricingSection from "./pages/PricingSection";
import Signup from "./pages/Signup";
import OTPVerification from "./pages/OTPVerification";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import AboutPage from "./pages/AboutPage";
import ChargesSection from "./pages/ChargesSection";
import PricingTable from "./pages/PricingTable";
import AccountCharges from "./pages/AccountCharges";
import ChargesExplained from "./pages/ChargesExplained";
import Login from "./pages/Login";
import TradingPage from "./pages/TradingPage";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />

        <Routes>
          {/* ðŸ  Home Page */}
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <TrustSection />
                <PricingSection />
                {/* Footer removed from here */}
              </>
            }
          />

          {/* ðŸ§ Signup + Other Sections */}
          <Route path="/signup" element={<Signup />} />

          {/* ðŸ"§ OTP Verification */}
          <Route path="/verify-otp" element={<OTPVerification />} />

          {/* ðŸ  User Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* 📊 Portfolio */}
          <Route path="/portfolio" element={<Portfolio />} />

          {/* 📈 Trading */}
          <Route path="/trading" element={<TradingPage />} />

          {/* 2. Add the new /about route */}
          <Route path="/about" element={<AboutPage />} />

          {/* Login Page */}
          <Route path="/login" element={<Login />} />

          <Route
            path="/pricing"
            element={
              <>
                <ChargesSection />
                <PricingTable />
                <AccountCharges />
                <ChargesExplained />
              </>
            }
          />
        </Routes>

        {/* 3. Add Footer here to be on all pages */}
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;
