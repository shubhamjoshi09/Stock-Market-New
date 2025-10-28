import React, { useState } from "react";
import { Menu, X } from "lucide-react"; 
import Image from "../assets/images.png"; 

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">

        <div className="flex items-center space-x-2">
          <img src={Image} alt="Zerodha Logo" className="h-18"  />
          <span className="text-lg font-semibold text-gray-700">STOCK MARKET</span>
        </div>

       
        <ul className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <li className="hover:text-blue-600 cursor-pointer">Signup</li>
          <li className="hover:text-blue-600 cursor-pointer">About</li>
          <li className="hover:text-blue-600 cursor-pointer">Products</li>
          <li className="hover:text-blue-600 cursor-pointer">Pricing</li>
          <li className="hover:text-blue-600 cursor-pointer">Support</li>
        </ul>


        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

  
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <ul className="flex flex-col space-y-4 py-4 text-gray-700 font-medium text-center">
            <li className="hover:text-blue-600 cursor-pointer">Signup</li>
            <li className="hover:text-blue-600 cursor-pointer">About</li>
            <li className="hover:text-blue-600 cursor-pointer">Products</li>
            <li className="hover:text-blue-600 cursor-pointer">Pricing</li>
            <li className="hover:text-blue-600 cursor-pointer">Support</li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

