import React from 'react';
import { Link } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import { FaLeaf, FaCloudSun, FaChartLine, FaHandHoldingHeart, FaSeedling, FaCloudRain, FaTractor, FaShieldAlt } from 'react-icons/fa';
import { GiPlantRoots, GiRadarSweep, GiWheat, GiFarmTractor, GiPlantWatering } from 'react-icons/gi';
import { IoIosNotifications, IoMdAlert } from 'react-icons/io';
import { RiPlantLine } from 'react-icons/ri';
import logo from '../assets/logo.png';
import { BsRobot, BsGraphUp, BsCameraFill, BsQuestionCircle } from 'react-icons/bs';
import { AiOutlineAim, AiOutlineSolution, AiOutlineSafety } from 'react-icons/ai';

const Landing = () => {
  const features = [
    {
      icon: <FaCloudSun className="h-8 w-8 text-green-500" />,
      title: "Weather Monitoring",
      description: "Real-time weather updates and forecasts to help plan your farming activities effectively."
    },
    {
      icon: <GiPlantRoots className="h-8 w-8 text-green-500" />,
      title: "Crop Health Analysis",
      description: "Advanced disease detection and health monitoring for your crops using AI technology."
    },
    {
      icon: <FaChartLine className="h-8 w-8 text-green-500" />,
      title: "Market Prices",
      description: "Stay updated with current market prices and trends for better decision making."
    },
    {
      icon: <FaHandHoldingHeart className="h-8 w-8 text-green-500" />,
      title: "Government Schemes",
      description: "Access to latest agricultural schemes and subsidies from the government."
    },
    {
      icon: <GiRadarSweep className="h-8 w-8 text-green-500" />,
      title: (
        <div className="flex items-center gap-2">
          Smart Monitoring
          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">Coming Soon</span>
        </div>
      ),
      description: "IoT-based monitoring systems for soil health and irrigation management."
    },
    {
      icon: <IoIosNotifications className="h-8 w-8 text-green-500" />,
      title: "Alert System",
      description: "Timely notifications about weather changes, market updates, and crop management."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 text-green-200 transform rotate-12">
            <FaTractor className="w-24 h-24" />
          </div>
          <div className="absolute bottom-20 right-10 text-green-200 transform -rotate-12">
            <GiWheat className="w-20 h-20" />
          </div>
          <div className="absolute top-40 right-1/4 text-green-200">
            <FaCloudRain className="w-16 h-16" />
          </div>
          <div className="absolute bottom-40 left-1/4 text-green-200">
            <RiPlantLine className="w-20 h-20" />
          </div>
          <div className="absolute top-1/2 right-20 text-green-200">
            <GiPlantWatering className="w-16 h-16" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Smart Farming Solutions for a Better Tomorrow
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Transform your farming practices with FarmCare's intelligent monitoring and management system. Get real-time insights, weather updates, and expert recommendations.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/register"
                  className="bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-lg text-lg font-medium transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/about"
                  className="border border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg text-lg font-medium transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="aspect-w-4 aspect-h-3 bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-50"></div>
                <div className="grid grid-cols-2 gap-8 relative z-10">
                  <div className="flex flex-col gap-8">
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                      <FaCloudSun className="w-12 h-12 text-green-500 mb-2" />
                      <p className="text-sm text-gray-600">Real-time Weather Updates</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                      <GiPlantRoots className="w-12 h-12 text-green-500 mb-2" />
                      <p className="text-sm text-gray-600">Crop Health Monitoring</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-8 mt-12">
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                      <FaChartLine className="w-12 h-12 text-green-500 mb-2" />
                      <p className="text-sm text-gray-600">Market Price Analysis</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                      <IoIosNotifications className="w-12 h-12 text-green-500 mb-2" />
                      <p className="text-sm text-gray-600">Smart Notifications</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Disease Detection Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_#dcfce7_0%,_transparent_25%),radial-gradient(circle_at_70%_50%,_#dcfce7_0%,_transparent_25%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              AI-Powered Disease Detection
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simply upload a photo of your plant or soil, and our advanced AI system will analyze and provide comprehensive insights about potential diseases and solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center">
                  <BsCameraFill className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Instant Analysis
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Upload a photo and get immediate results. Our AI analyzes images in real-time to identify diseases, deficiencies, and other issues affecting your crops.
              </p>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">Analysis Progress</span>
                  <span className="text-sm font-medium text-green-600">85% Accurate</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-green-100 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full w-[85%]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Comprehensive Analysis Report</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <IoMdAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Problem Identification</h4>
                    <p className="text-green-100">Precise identification of diseases and issues affecting your crops</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <BsQuestionCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Root Cause Analysis</h4>
                    <p className="text-green-100">Detailed explanation of why the problem occurred and contributing factors</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <AiOutlineSolution className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Solution & Treatment</h4>
                    <p className="text-green-100">Step-by-step treatment options and where to find necessary resources</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <FaShieldAlt className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Prevention Guide</h4>
                    <p className="text-green-100">Preventive measures and best practices to avoid future occurrences</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-white w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <BsRobot className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">85% Accuracy</h4>
                <p className="text-gray-600">In disease detection and identification</p>
              </div>

              <div className="text-center">
                <div className="bg-white w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <BsGraphUp className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Instant Results</h4>
                <p className="text-gray-600">Analysis completed in seconds</p>
              </div>

              <div className="text-center">
                <div className="bg-white w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <FaHandHoldingHeart className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Expert Support</h4>
                <p className="text-gray-600">Connect with agricultural experts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Farming Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover how FarmCare can help you optimize your farming operations with our suite of smart features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="bg-green-50 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of farmers who are already using FarmCare to improve their agricultural practices. Our platform is completely free!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing; 