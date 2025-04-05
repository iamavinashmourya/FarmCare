import React from 'react';

function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-primary-600 mb-8">Welcome to FarmCare</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Disease Detection</h2>
          <p className="text-gray-600">Upload plant images for AI-powered disease detection and get instant analysis.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Market Prices</h2>
          <p className="text-gray-600">Get real-time crop and vegetable market prices based on your region.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Government Schemes</h2>
          <p className="text-gray-600">Access information about agricultural schemes and benefits.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Expert Support</h2>
          <p className="text-gray-600">Get guidance from agricultural experts for your farming needs.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;