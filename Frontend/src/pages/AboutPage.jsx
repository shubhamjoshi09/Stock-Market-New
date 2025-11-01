import React from 'react';

// 3. IMPORT images from the src/assets folder
// We are in pages/AboutPage.jsx, so we go up one level (../) to src/ and then down to assets/
import founderJaneImg from '../assets/Jane R. Doe.jpg';
import founderAlexImg from '../assets/Alex M. Smith.jpg';
import founderSamImg from '../assets/Sam K. Lee.jpg';


// --- Helper Icon Components (for this page) ---

const AnalyticsIcon = () => (
  <svg className="w-10 h-10 mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
);

const ShieldIcon = () => (
  <svg className="w-10 h-10 mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
);

const PortfolioIcon = () => (
  <svg className="w-10 h-10 mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
);

const BoltIcon = () => (
  <svg className="w-10 h-10 mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);

// --- NEW ICONS NEEDED FOR FOUNDERS SECTION ---
const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
  </svg>
);

// --- About Page Component ---

const AboutPage = () => {
  return (
    <div className="pt-28 pb-10 min-h-screen">
      {/* --- Hero Section --- */}
      <section className="container mx-auto px-6 py-12 text-center"> 
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
          Empowering Your Financial Future
        </h1>
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-10">
          We're revolutionizing the way people invest with cutting-edge technology, transparent pricing, and an unwavering commitment to your success.
        </p>
      </section>

      {/* --- Mission/Vision Section --- */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To democratize access to financial markets by providing professional-grade tools and insights to investors of all levels. We believe everyone deserves the opportunity to build wealth and achieve financial independence.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become the world's most trusted and innovative trading platform, empowering millions to take control of their financial destiny.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Values</h3>
              <p className="text-gray-600 leading-relaxed">
                Integrity, innovation, and customer-centricity guide everything we do. We're committed to transparency and putting your interests first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Stats Section --- */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-2">500K+</h2>
              <p className="text-lg text-blue-100">Active Traders</p>
            </div>
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-2">₹50K Cr+</h2>
              <p className="text-lg text-blue-100">Trading Volume</p>
            </div>
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-2">99.9%</h2>
              <p className="text-lg text-blue-100">Uptime</p>
            </div>
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-2">150+</h2>
              <p className="text-lg text-blue-100">Markets</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Why Choose Us Section --- */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Why Choose Us
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-16">
            Experience the next generation of trading with our comprehensive platform designed for your success.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 text-center">
              <AnalyticsIcon />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Real-Time Analytics</h3>
              <p className="text-gray-600">
                Access live market data and advanced charting tools to make informed investment decisions.
              </p>
            </div>
            {/* Feature Card 2 */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 text-center">
              <ShieldIcon />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure Trading</h3>
              <p className="text-gray-600">
                Bank-level encryption and multi-factor authentication keep your investments safe.
              </p>
            </div>
            {/* Feature Card 3 */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 text-center">
              <PortfolioIcon />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Portfolio Management</h3>
              <p className="text-gray-600">
                Track and optimize your portfolio with intelligent insights and performance metrics.
              </p>
            </div>
            {/* Feature Card 4 */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 text-center">
              <BoltIcon />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Lightning Fast Execution</h3>
              <p className="text-gray-600">
                Execute trades in milliseconds with our high-performance trading infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Built by Traders Section --- */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Built by Traders, for Traders
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            Our team combines decades of financial market expertise with cutting-edge technology to deliver an unparalleled trading experience.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-4xl font-bold text-blue-600 mb-2">20+ Years</h3>
              <p className="text-gray-600">Combined Industry Experience</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-blue-600 mb-2">50+ Experts</h3>
              <p className="text-gray-600">Engineering & Finance Professionals</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-blue-600 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Dedicated Customer Service</p>
            </div>
          </div>
        </div>
      </section>


      {/* --- Our Founders Section --- */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-16">
            Our Founders
          </h2>
          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            
            {/* Team Member Card 1 */}
            <div className="flex flex-col items-center text-center">
              {/* 3. Use the imported variable in the src attribute */}
              <img
                src={founderJaneImg}
                alt="Jane R. Doe"
                className="rounded-full w-40 h-40 object-cover mb-4 shadow-lg bg-gray-200"
              />
              <h3 className="text-xl font-semibold text-gray-800">Jane R. Doe</h3>
              <p className="text-gray-500 mb-2">Founder, CEO</p>
              <p className="text-gray-600 mb-4 max-w-xs">
                Jane founded Stock Market with a vision to democratize access to advanced, AI-driven trading tools for everyone.
              </p>
              <div className="flex space-x-4 text-blue-600">
                <a href="#" className="hover:underline flex items-center space-x-1">
                  <LinkedInIcon /> <span>LinkedIn</span>
                </a>
                <a href="#" className="hover:underline flex items-center space-x-1">
                  <TwitterIcon /> <span>Twitter</span>
                </a>
              </div>
            </div>

            {/* Team Member Card 2 */}
            <div className="flex flex-col items-center text-center">
              {/* 3. Use the imported variable in the src attribute */}
              <img
                src={founderAlexImg}
                alt="Alex M. Smith"
                className="rounded-full w-40 h-40 object-cover mb-4 shadow-lg bg-gray-200"
              />
              <h3 className="text-xl font-semibold text-gray-800">Alex M. Smith</h3>
              <p className="text-gray-500 mb-2">Co-founder, CPO</p>
              <p className="text-gray-600 mb-4 max-w-xs">
                Alex is the architect of our user experience, focusing on building an intuitive platform that empowers traders of all levels.
              </p>
              <div className="flex space-x-4 text-blue-600">
                 <a href="#" className="hover:underline flex items-center space-x-1">
                  <LinkedInIcon /> <span>LinkedIn</span>
                </a>
                <a href="#" className="hover:underline flex items-center space-x-1">
                  <TwitterIcon /> <span>Twitter</span>
                </a>
              </div>
            </div>

            {/* Team Member Card 3 */}
            <div className="flex flex-col items-center text-center">
              {/* 3. Use the imported variable in the src attribute */}
              <img
                src={founderSamImg}
                alt="Sam K. Lee"
                className="rounded-full w-40 h-40 object-cover mb-4 shadow-lg bg-gray-200"
              />
              <h3 className="text-xl font-semibold text-gray-800">Sam K. Lee</h3>
              <p className="text-gray-500 mb-2">CTO</p>
              <p className="text-gray-600 mb-4 max-w-xs">
                Sam leads our engineering team, scaling our infrastructure and pioneering the AI models that power our core features.
              </p>
              <div className="flex space-x-4 text-blue-600">
                 <a href="#" className="hover:underline flex items-center space-x-1">
                  <LinkedInIcon /> <span>LinkedIn</span>
                </a>
                <a href="#" className="hover:underline flex items-center space-x-1">
                  <TwitterIcon /> <span>Twitter</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;