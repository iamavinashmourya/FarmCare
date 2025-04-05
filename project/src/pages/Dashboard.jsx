import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';
import Sidebar from '../components/Sidebar';
import Overview from '../components/dashboard/Overview';
import FarmcareAI from '../components/dashboard/FarmcareAI';
import MarketPrices from '../components/dashboard/MarketPrices';
import ExpertArticles from '../components/dashboard/ExpertArticles';
import DailyNews from '../components/dashboard/DailyNews';
import Settings from '../components/dashboard/Settings';
import Weather from '../pages/Weather';
import EditProfile from './EditProfile';
import Footer from '../components/Footer';

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center px-4">
        <button
          onClick={toggleMobileMenu}
          className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 p-2"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="ml-2 text-lg font-semibold text-gray-900">FarmCare Dashboard</span>
      </div>

      <div className="flex flex-1">
        <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
        
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto pb-20">
            <div className="p-4 sm:p-6 lg:p-8">
              <Routes>
                <Route index element={<Overview />} />
                <Route path="ai" element={<FarmcareAI />} />
                <Route path="weather" element={<Weather />} />
                <Route path="prices" element={<MarketPrices />} />
                <Route path="articles" element={<ExpertArticles />} />
                <Route path="news" element={<DailyNews />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<EditProfile />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
          <main className="flex-1 overflow-auto pb-20">
            <div className="p-4 sm:p-6 lg:p-8">
              <Routes>
                <Route index element={<Overview />} />
                <Route path="ai" element={<FarmcareAI />} />
                <Route path="weather" element={<Weather />} />
                <Route path="prices" element={<MarketPrices />} />
                <Route path="articles" element={<ExpertArticles />} />
                <Route path="news" element={<DailyNews />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<EditProfile />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;