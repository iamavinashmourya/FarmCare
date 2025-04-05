import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DiseaseDetection from './pages/DiseaseDetection';
import MarketPrices from './pages/MarketPrices';
import Schemes from './pages/Schemes';
import Features from './pages/Features';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Weather from './pages/Weather';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import NewsDetail from './pages/NewsDetail';
import EditProfile from './pages/EditProfile';
import Landing from './pages/Landing';
import FrontendLayout from './layouts/FrontendLayout';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import About from './pages/About';
import Contact from './pages/Contact';

// Protected Route component
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Routes>
              {/* Frontend Routes with FrontendLayout */}
              <Route element={<FrontendLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/features" element={<Features />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/schemes" element={<Schemes />} />
                <Route path="/market-prices" element={<MarketPrices />} />
              </Route>
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/disease-detection" element={
                <ProtectedRoute>
                  <DiseaseDetection />
                </ProtectedRoute>
              } />
              <Route path="/admin/*" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/weather" element={<Weather />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/dashboard/articles/:articleId" element={
                <ProtectedRoute>
                  <ArticleDetail />
                </ProtectedRoute>
              } />
              <Route path="/news/:id" element={
                <ProtectedRoute>
                  <NewsDetail />
                </ProtectedRoute>
              } />
            </Routes>
            <ToastContainer position="bottom-right" />
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;