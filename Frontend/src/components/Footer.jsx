import React from "react";
import Image from "../assets/stock-market9.jpg";
import { FaFacebook, FaInstagram, FaLinkedinIn, FaPinterest, FaTwitter, FaWhatsapp, FaYoutube } from "react-icons/fa";


export default function Footer() {
  return (
    <footer className="bg-[#fbfbfb] text-gray-600">
      <div className="max-w-7xl mx-auto px-6 py-12 border-t">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
    
          <div>
            <img src={Image} alt="Logo" className="w-18 h-18 mb-3" />
            <div className="text-sm text-gray-500">
              &copy; 2010 - 2024, Stock Market Platform <br />
              All rights reserved.
               <div className="flex items-center text-lg space-x-3 mt-5">
                    <FaFacebook className='text-[#6f7070] cursor-pointer hover:text-black 
                    transition-colors duration-300'/>
                    <FaTwitter className='text-[#6f7070] cursor-pointer hover:text-black 
                    transition-colors duration-300'/>
                    <FaInstagram className='text-[#6f7070] cursor-pointer hover:text-black 
                    transition-colors duration-300'/>
                    <FaPinterest className='text-[#6f7070] cursor-pointer hover:text-black 
                    transition-colors duration-300'/>
                </div>
            </div>
            <div className="border-t my-3"></div>

            <div className="flex items-center text-lg space-x-3 mt-6">
                    <FaLinkedinIn className='text-[#6f7070] cursor-pointer hover:text-black 
                    transition-colors duration-300'/>
                    <FaWhatsapp className='text-[#6f7070] cursor-pointer hover:text-black 
                    transition-colors duration-300'/>
                    <FaYoutube className='text-[#6f7070] cursor-pointer hover:text-black 
                    transition-colors duration-300'/>
            </div>
          </div>

          
          <div>
            <p className="font-semibold mb-3 text-gray-800">Company</p>
            <ul className="space-y-1 text-sm">
              {[
                "About Us",
                "Our Products",
                "Pricing Plans",
                "Affiliate Program",
                "Join Our Team",
                "Technology Blog",
                "News & Updates",
                "Community Initiatives",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-blue-600 transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>


          <div>
            <p className="font-semibold mb-3 text-gray-800">Support</p>
            <ul className="space-y-1 text-sm">
              {[
                "Get in Touch",
                "Help Center",
                "Trading Blog",
                "Fee Structure",
                "Tools & Resources",
                "Tutorial Videos",
                "Market Insights",
                "Submit Feedback",
                "Track Support Ticket",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-blue-600 transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-3 text-gray-800">Account</p>
            <ul className="space-y-1 text-sm">
              {[
                "Create Account",
                "Add Funds",
                "Portfolio Manager",
                "Account Settings",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="hover:text-blue-600 transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

    
        <div className="mt-10 space-y-5 text-sm text-gray-500 leading-relaxed">
          <p>
            Stock Market Platform is a registered trading member of major stock
            exchanges. We provide seamless online trading services for equity,
            derivatives, commodities, and currency markets. Our platform is
            designed to offer transparency, security, and efficiency in all your
            trading activities. Registered Office: Technology Park, Sector 5,
            Electronic City, Bangalore - 560100, Karnataka, India. For trading
            related queries: <span className="text-blue-600">support@stockmarket.com</span>for technical issues:
            <span className="text-blue-600">tech@stockmarket.com.</span>Please read all risk disclosure documents
            carefully before trading.
          </p>

          <p>
            How to register a complaint: Visit our online complaint portal and
            fill in the required details including Name, PAN Card, Contact
            Number, and Email Address. Our team ensures quick resolution of all
            grievances through effective communication channels.
          </p>

          <p className="text-blue-600">Online Grievance Redressal | Investor Protection Mechanism</p>

          <p>
            Trading and investments in financial markets involve substantial
            risks. Please review all documentation and understand the risks
            before investing.
          </p>

          <p>
            Important Notice: 1) Trading brokers accept securities as collateral
            only through the depository pledge system. 2) Keep your contact
            information updated with your broker to receive OTP and transaction
            alerts directly. 3) Review your monthly account statements from
            NSDL/CDSL regularly.
          </p>

          <p>
            "Secure your account from unauthorized access. Always update your
            mobile number and email with your broker. Get instant notifications
            for all your trades directly from the exchange. This message is
            issued for investor awareness and protection. <span className="text-blue-600">Complete your KYC once portal.</span>
            
          </p>
        </div>

        <div className="text-center mt-10 space-x-4 flex flex-wrap justify-center text-sm text-gray-500">
          {[
            "NSE",
            "BSE",
            "MCX",
            "Terms of Service",
            "Company Policies",
            "Privacy & Security",
            "Disclosures",
            "Investor Guidelines",
            "Investor Rights",
          ].map((link) => (
            <a
              key={link}
              href="#"
              className="hover:text-blue-600 transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
