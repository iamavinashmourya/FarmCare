import React from 'react';
import { Link } from 'react-router-dom';
import { FaCloudSun, FaChartLine, FaHandHoldingHeart, FaStore, FaUserMd, FaNewspaper, FaBookReader } from 'react-icons/fa';
import { GiPlantRoots, GiRadarSweep } from 'react-icons/gi';
import { IoIosNotifications } from 'react-icons/io';

const Features = () => {
  const featureCategories = [
    {
      title: "Core Features",
      description: "Essential tools for smart farming",
      features: [
        {
          icon: <FaCloudSun className="h-12 w-12 text-green-500" />,
          title: "Weather Monitoring",
          description: "Get real-time weather updates and forecasts tailored for agriculture. Track temperature, humidity, rainfall, and wind patterns.",
          benefits: [
            "Accurate local weather forecasts",
            "Precipitation tracking and alerts",
            "Soil temperature monitoring",
            "Frost warnings"
          ]
        },
        {
          icon: <GiPlantRoots className="h-12 w-12 text-green-500" />,
          title: "Crop Health Analysis",
          description: "Advanced AI-powered disease detection and health monitoring system for your crops. Early detection helps prevent losses.",
          benefits: [
            "Disease identification with AI",
            "Treatment recommendations",
            "Growth stage monitoring",
            "Yield optimization tips"
          ]
        },
        {
          icon: <FaChartLine className="h-12 w-12 text-green-500" />,
          title: "Market Prices",
          description: "Stay updated with current market prices and trends. Make informed decisions about when to sell your produce.",
          benefits: [
            "Real-time price updates",
            "Historical price trends",
            "Regional market comparison",
            "Price predictions"
          ]
        }
      ]
    },
    {
      title: "Support & Resources",
      description: "Access expert knowledge and government benefits",
      features: [
        {
          icon: <FaHandHoldingHeart className="h-12 w-12 text-green-500" />,
          title: "Government Schemes",
          description: "Access comprehensive information about agricultural schemes and subsidies. Never miss out on government benefits.",
          benefits: [
            "Updated scheme listings",
            "Eligibility checker",
            "Application guidance",
            "Deadline reminders"
          ]
        },
        {
          icon: <FaBookReader className="h-12 w-12 text-green-500" />,
          title: "Expert Articles",
          description: "Read in-depth articles and guides written by agricultural experts. Stay informed about best practices and innovations.",
          benefits: [
            "Verified expert content",
            "Seasonal farming tips",
            "New technology insights",
            "Success stories"
          ]
        },
        {
          icon: <FaNewspaper className="h-12 w-12 text-green-500" />,
          title: "Daily Agriculture News",
          description: "Stay updated with the latest news about agriculture, farming policies, and market trends.",
          benefits: [
            "Daily news updates",
            "Policy changes",
            "Market insights",
            "Industry developments"
          ]
        }
      ]
    },
    {
      title: "Coming Soon",
      description: "Exciting new features in development",
      features: [
        {
          icon: <GiRadarSweep className="h-12 w-12 text-green-500" />,
          title: (
            <div className="flex items-center gap-2">
              Smart Monitoring
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">Coming Soon</span>
            </div>
          ),
          description: "IoT-based monitoring systems for soil health and irrigation management. Get real-time insights into your farm's conditions.",
          benefits: [
            "Soil health monitoring",
            "Smart irrigation control",
            "Nutrient tracking",
            "Automated alerts"
          ]
        },
        {
          icon: <FaStore className="h-12 w-12 text-green-500" />,
          title: (
            <div className="flex items-center gap-2">
              Marketplace
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">Coming Soon</span>
            </div>
          ),
          description: "One-stop shop for all your farming needs. Purchase quality-verified pesticides, fertilizers, medicines, and equipment.",
          benefits: [
            "Verified sellers",
            "Quality products",
            "Competitive prices",
            "Direct delivery"
          ]
        },
        {
          icon: <FaUserMd className="h-12 w-12 text-green-500" />,
          title: (
            <div className="flex items-center gap-2">
              Expert Consultation
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">Coming Soon</span>
            </div>
          ),
          description: "Book one-on-one sessions with agricultural experts. Get personalized advice for your farming challenges.",
          benefits: [
            "Video consultations",
            "Expert verification",
            "Flexible scheduling",
            "Follow-up support"
          ]
        }
      ]
    }
  ];

  return (
    <div className="bg-gray-50 pt-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Comprehensive Farming Solutions
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Discover how FarmCare's suite of smart tools and expert resources can transform your farming practices and boost productivity.
            </p>
          </div>
        </div>
      </div>

      {/* Features Categories */}
      {featureCategories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{category.title}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{category.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-300 hover:border-green-200">
                  <div className="flex flex-col h-full">
                    <div className="bg-green-50 w-20 h-20 rounded-lg flex items-center justify-center mb-6 transform transition-transform group-hover:scale-110">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-6 flex-grow">
                      {feature.description}
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 mb-2">Key Benefits:</h4>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center text-gray-600">
                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* CTA Section */}
      <div className="bg-gradient-to-b from-green-50 to-white border-t border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join thousands of farmers who are already using FarmCare's free platform to improve their agricultural practices and increase yields.
            </p>
            <div className="flex justify-center gap-6">
              <Link
                to="/register"
                className="bg-green-600 text-white hover:bg-green-700 px-8 py-4 rounded-lg text-lg font-medium transition-colors shadow-sm hover:shadow-md"
              >
                Get Started Now
              </Link>
              <Link
                to="/contact"
                className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 rounded-lg text-lg font-medium transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features; 