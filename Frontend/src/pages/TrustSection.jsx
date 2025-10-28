import React from "react";
import ecosystemimg from "../assets/ecosystem.png";
const TrustSection = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-6 py-20 gap-12">
      <div className="md:w-1/2 text-gray-800">
        <h2 className="text-3xl md:text-4xl font-semibold mb-8">
          Trust with confidence
        </h2>

        <div className="space-y-6 text-gray-600 leading-relaxed">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">
              Customer-first always
            </h3>
            <p>
              That’s why 1.6+ crore customers trust Zerodha with ~₹6 lakh crores
              of equity investments, making us India’s largest broker;
              contributing to 15% of daily retail exchange volumes in India.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 text-lg">
              No spam or gimmicks
            </h3>
            <p>
              No gimmicks, spam, "gamification", or annoying push notifications.
              High quality apps that you use at your pace, the way you like.{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Our philosophies.
              </a>
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 text-lg">
              The Zerodha universe
            </h3>
            <p>
              Not just an app, but a whole ecosystem. Our investments in 30+
              fintech startups offer you tailored services specific to your
              needs.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 text-lg">
              Do better with money
            </h3>
            <p>
              With initiatives like{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Nudge
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Kill Switch
              </a>
              , we don't just facilitate transactions, but actively help you do
              better with your money.
            </p>
          </div>
        </div>

        <div className="mt-8 text-blue-600 font-left space-x-6">
          <a href="#" className="hover:underline">
            Explore our products →
          </a>
          <a href="#" className="hover:underline">
            Try Kite demo →
          </a>
        </div>
      </div>

      <div className="relative md:w-1/2 flex justify-center items-center">
         <img
              src={ecosystemimg}
              alt="Zerodha Dashboard"
              className="w-full max-w-4xl"
            />   
      </div>
    </div>
  );
};

export default TrustSection;
