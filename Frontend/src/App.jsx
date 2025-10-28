import React from 'react'
import Navbar from './components/Navbar'
import HeroSection from './pages/HeroSection'
import TrustSection from './pages/TrustSection'
import PricingSection from './pages/PricingSection'
import Footer from './components/Footer'

const App = () => {
  return (
    <>
      <Navbar/>
      <HeroSection/>
      <TrustSection/>
      <PricingSection/>
      <Footer/>
    </>
  )
}

export default App

