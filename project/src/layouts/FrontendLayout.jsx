import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import logo from '../assets/logo.png';

const FrontendLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Footer */}
      <footer className="bg-gray-50 py-8 mt-auto border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <img src={logo} alt="FarmCare Logo" className="h-8 w-auto mb-3" />
              <p className="text-gray-600">
                Smart farming solutions for modern agriculture
              </p>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-3">Features</h4>
              <ul className="space-y-1.5">
                <li><Link to="/features" className="text-gray-600 hover:text-green-600">Weather Monitoring</Link></li>
                <li><Link to="/features" className="text-gray-600 hover:text-green-600">Crop Health</Link></li>
                <li><Link to="/features" className="text-gray-600 hover:text-green-600">Market Prices</Link></li>
                <li><Link to="/features" className="text-gray-600 hover:text-green-600">Government Schemes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-3">Company</h4>
              <ul className="space-y-1.5">
                <li><Link to="/about" className="text-gray-600 hover:text-green-600">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-600 hover:text-green-600">Contact</Link></li>
                <li><Link to="/privacy" className="text-gray-600 hover:text-green-600">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-600 hover:text-green-600">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-3">Connect</h4>
              <ul className="space-y-1.5">
                <li><a href="#" className="text-gray-600 hover:text-green-600">Twitter</a></li>
                <li><a href="#" className="text-gray-600 hover:text-green-600">Facebook</a></li>
                <li><a href="#" className="text-gray-600 hover:text-green-600">LinkedIn</a></li>
                <li><a href="#" className="text-gray-600 hover:text-green-600">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-6 pt-6 text-center">
            <p className="text-gray-500">© {new Date().getFullYear()} FarmCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FrontendLayout; 