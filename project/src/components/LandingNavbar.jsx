import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const LandingNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Check if user is logged in by looking for token in localStorage
  const isLoggedIn = localStorage.getItem('token') !== null;

  const renderAuthButtons = () => {
    if (isLoggedIn) {
      return (
        <Link
          to="/dashboard"
          className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Dashboard
        </Link>
      );
    }
    return (
      <>
        <Link to="/login" className="text-green-600 hover:text-green-700 px-2 py-2 text-sm font-medium transition-colors">
          Login
        </Link>
        <Link
          to="/register"
          className="bg-green-600 text-white hover:bg-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Get Started
        </Link>
      </>
    );
  };

  const renderMobileAuthButtons = () => {
    if (isLoggedIn) {
      return (
        <Link
          to="/dashboard"
          className="block px-2 py-1 rounded-md text-base font-medium bg-green-600 text-white hover:bg-green-700"
        >
          Dashboard
        </Link>
      );
    }
    return (
      <>
        <Link
          to="/login"
          className="block px-2 py-1 rounded-md text-base font-medium text-green-600 hover:text-green-700"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="block px-2 py-1 rounded-md text-base font-medium bg-green-600 text-white hover:bg-green-700"
        >
          Get Started
        </Link>
      </>
    );
  };

  return (
    <nav className="bg-white fixed w-full z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="FarmCare Logo" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/features" className="text-gray-600 hover:text-green-600 px-2 py-2 text-sm font-medium transition-colors">
              Features
            </Link>
            <Link to="/schemes" className="text-gray-600 hover:text-green-600 px-2 py-2 text-sm font-medium transition-colors">
              Government Schemes
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-green-600 px-2 py-2 text-sm font-medium transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-green-600 px-2 py-2 text-sm font-medium transition-colors">
              Contact
            </Link>
            {renderAuthButtons()}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-white border-t border-gray-200`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/features"
            className="block px-2 py-1 rounded-md text-base font-medium text-gray-600 hover:text-green-600 hover:bg-gray-50"
          >
            Features
          </Link>
          <Link
            to="/schemes"
            className="block px-2 py-1 rounded-md text-base font-medium text-gray-600 hover:text-green-600 hover:bg-gray-50"
          >
            Government Schemes
          </Link>
          <Link
            to="/about"
            className="block px-2 py-1 rounded-md text-base font-medium text-gray-600 hover:text-green-600 hover:bg-gray-50"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className="block px-2 py-1 rounded-md text-base font-medium text-gray-600 hover:text-green-600 hover:bg-gray-50"
          >
            Contact
          </Link>
          {renderMobileAuthButtons()}
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar; 