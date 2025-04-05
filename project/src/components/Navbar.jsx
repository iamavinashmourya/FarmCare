import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import flagIcon from '../assets/flag.png';
import logo from '../assets/logo.png';

function Navbar() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-full mx-auto px-0">
        <div className="flex justify-between h-16">
          <div className="flex items-center pl-10">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="FarmCare Logo" className="h-8 w-auto" />
            </Link>
          </div>

          <div className="flex items-center pr-10">
            <div className="text-gray-600">
              <span className="font-medium">नमस्ते, आपका स्वागत है</span>
              <span className="mx-2">|</span>
              <span>{formatTime(currentTime)}</span>
              <img src={flagIcon} alt="Indian Flag" className="ml-3 h-5 w-auto inline align-middle -mt-1" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;