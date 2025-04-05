import React from 'react';
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
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DashboardNavbar />
      <div className="flex flex-1 h-[calc(100vh-4rem)]">
        <Sidebar />
        <div className="flex-1 flex flex-col relative">
          <main className="flex-1 overflow-auto pb-20">
            <div className="p-6">
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