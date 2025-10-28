import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#fbfbfb] text-gray-600">
      <div className="max-w-7xl mx-auto px-6 py-12 border-t">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
    
          <div>
            <img src="/media/logo.svg" alt="Logo" className="w-1/2 mb-3" />
            <p className="text-sm text-gray-500">
              &copy; 2010 - 2024, Stock Market Platform <br />
              All rights reserved.
            </p>

           
            <div className="flex items-center space-x-3 mt-4">
              <i className="fa-brands fa-twitter text-xl hover:text-blue-500"></i>
              <i className="fa-brands fa-facebook-f text-xl hover:text-blue-600"></i>
              <i className="fa-brands fa-instagram text-xl hover:text-pink-500"></i>
              <i className="fa-brands fa-linkedin-in text-xl hover:text-blue-700"></i>
            </div>

            <div className="border-t my-4"></div>

            <div className="flex items-center space-x-3 mt-3">
              <i className="fa-brands fa-youtube text-xl hover:text-red-500"></i>
              <i className="fa-brands fa-whatsapp text-xl hover:text-green-500"></i>
              <i className="fa-brands fa-telegram text-xl hover:text-sky-500"></i>
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
            related queries: support@stockmarket.com, for technical issues:
            tech@stockmarket.com. Please read all risk disclosure documents
            carefully before trading.
          </p>

          <p>
            How to register a complaint: Visit our online complaint portal and
            fill in the required details including Name, PAN Card, Contact
            Number, and Email Address. Our team ensures quick resolution of all
            grievances through effective communication channels.
          </p>

          <p>Online Grievance Redressal | Investor Protection Mechanism</p>

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
            issued for investor awareness and protection. Complete your KYC once
            through any SEBI registered intermediary and use it across all
            platforms." Important: We never provide trading tips or
            recommendations. No one is authorized to trade on your behalf. If
            anyone approaches you claiming to represent our company and offering
            such services, please report immediately through our grievance
            portal.
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
