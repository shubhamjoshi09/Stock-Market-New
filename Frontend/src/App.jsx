import React from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./pages/HeroSection";
import TrustSection from "./pages/TrustSection";
import PricingSection from "./pages/PricingSection";
import Footer from "./components/Footer";
import Signup from "./pages/Signup";

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
              <Footer />
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
              <Footer />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
