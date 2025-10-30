import React from "react";

const Products = () => {
  const products = [
    {
      title: "Kite",
      description:
        "Our ultra-fast flagship trading platform with streaming market data, advanced charts and excellent UI. Available on Web & Mobile.",
      image: "https://zerodha.com/static/images/products-kite.png",
      link: "/products/kite",
    },
    {
      title: "Console",
      description:
        "The central dashboard for your account. View reports, statements, analytics and manage investments easily.",
      image: "https://zerodha.com/static/images/products-console.png",
      link: "/products/console",
    },
    {
      title: "Coin",
      description:
        "Buy direct mutual funds online, commission-free, through your Demat account. Invest simply & clearly.",
      image: "https://zerodha.com/static/images/products-coin.png",
      link: "/products/coin",
    },
    {
      title: "Kite Connect API",
      description:
        "Build powerful trading apps with our simple HTTP/JSON APIs. Used by startups and pros alike.",
      image: "https://zerodha.com/static/images/products-kiteconnect.png",
      link: "/products/kite-connect",
    },
    {
      title: "Varsity",
      description:
        "Free online stock market education from basics to advanced strategies. Learn at your own pace.",
      image: "https://zerodha.com/static/images/products-varsity.png",
      link: "/products/varsity",
    },
  ];

  return (
    <div className="bg-white mt-20">
      {/* Hero Section */}
      <section className="pt-16 pb-10 text-center">
        <h3 className="text-4xl md:text-5xl font-semibold text-gray-800 mb-4">
          Our Products
        </h3>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Sleek, modern and intuitive trading platforms built for the modern investor.
        </p>
      </section>

      {/* Divider line */}
      <hr className="border-gray-300 my-8" />

      {/* Products Grid */}
      <section className="py-12 px-4 md:px-8 lg:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-center text-center"
            >
              <img
                src={product.image}
                alt={product.title}
                className="w-40 h-40 object-contain mb-5"
              />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {product.title}
              </h2>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <a
                href={product.link}
                className="text-blue-600 hover:underline font-medium"
              >
                Learn more →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 pt-12 pb-20 text-center">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Explore the entire universe
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto px-4 mb-6">
          Connect with our platforms, partner ecosystems and developer APIs to
          build your custom trading experience.
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition">
          Explore More
        </button>
      </section>
    </div>
  );
};

export default Products;
