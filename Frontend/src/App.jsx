import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import HeroSection from "./pages/HeroSection";
import TrustSection from "./pages/TrustSection";
import PricingSection from "./pages/PricingSection";
import Signup from "./pages/Signup";
import AboutPage from "./pages/AboutPage"; // 1. Import the new AboutPage

const App = () => {
  return (
    <Router>
      <Navbar />
      
      <Routes>
        {/* 🏠 Home Page */}
        <Route
          path="/"
          element={
            <>
              <HeroSection />
              <TrustSection />
              <PricingSection />
            </>
          }
        />

        {/* 🧾 Signup + Other Sections */}
        <Route
          path="/signup"
          element={
            <>
              <Signup /> {/* Signup shown first */}
              <HeroSection />
              <TrustSection />
              <PricingSection />
              {/* Footer removed from here */}
            </>
          }
        />

        {/* 2. Add the new /about route */}
        <Route path="/about" element={<AboutPage />} />

      </Routes>

      {/* 📌 Footer shown on all pages */}
      <Footer />
    </Router>
  );
};

export default App;
