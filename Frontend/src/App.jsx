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
import AboutPage from "./pages/AboutPage";
import Products from "./pages/Products"; // ✅ New import

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

        {/* 🧾 Signup Page */}
        <Route path="/signup" element={<Signup />} />

        {/* ℹ️ About Page */}
        <Route path="/about" element={<AboutPage />} />

        {/* 🧩 Products Page */}
        <Route path="/products" element={<Products />} /> {/* ✅ Added */}
      </Routes>

      {/* 📌 Footer shown on all pages */}
      <Footer />
    </Router>
  );
};

export default App;
