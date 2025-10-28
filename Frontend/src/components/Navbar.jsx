import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Image from "../assets/images.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: "Signup", path: "/signup" },
    { name: "About", path: "/about" },
    { name: "Products", path: "/products" },
    { name: "Pricing", path: "/pricing" },
    { name: "Support", path: "/support" },
  ];

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src={Image} alt="Logo" className="h-18" />
          <Link to="/" className="text-lg font-semibold text-gray-700">
            STOCK MARKET
          </Link>
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-8 text-gray-700 font-medium">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link to={link.path} className="hover:text-blue-600">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <ul className="flex flex-col space-y-4 py-4 text-gray-700 font-medium text-center">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className="hover:text-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
