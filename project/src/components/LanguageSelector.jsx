import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = () => {
  const { currentLanguage, setCurrentLanguage, languages } = useLanguage();

  return (
    <div className="relative inline-block">
      <select
        value={currentLanguage}
        onChange={(e) => setCurrentLanguage(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
      >
        {Object.entries(languages).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSelector; 