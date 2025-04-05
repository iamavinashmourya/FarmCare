import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime || !decoded.is_admin) {
      localStorage.removeItem('token');
      return <Navigate to="/login" />;
    }
    
    return children;
  } catch (error) {
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }
};

export default AdminRoute;