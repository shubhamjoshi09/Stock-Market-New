import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // Import Footer

// Pages
import HeroSection from "./pages/HeroSection";
import TrustSection from "./pages/TrustSection";
import PricingSection from "./pages/PricingSection";
import Signup from "./pages/Signup";
import AboutPage from "./pages/AboutPage"; // 1. Import the new AboutPage
import ChargesSection from "./pages/ChargesSection";
import PricingTable  from "./pages/PricingTable";
import AccountCharges from "./pages/AccountCharges";
import ChargesExplained from "./pages/ChargesExplained";
import ProductSection from "./pages/ProductSection";
import ZerodhaUniverse from "./pages/ZerodhaUniverse";

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
              {/* Footer removed from here */}
            </>
          }
        />

        {/* 🧾 Signup + Other Sections */}
        <Route
          path="/signup" element={<Signup />}/>

        {/* 2. Add the new /about route */}
        <Route path="/about" element={<AboutPage />} />

      <Route 
       path ="/pricing" 
       element={
       <>
           <ChargesSection/>
            <PricingTable/>
            <AccountCharges/>
            <ChargesExplained/>
       </>
       }
      />
       
      <Route path="/products" element={
        <>
        <ProductSection/>
        <ZerodhaUniverse/>
        </>
        } /> 
      
      </Routes>

      <Footer /> 

    </Router>
  );
};

export default App;
