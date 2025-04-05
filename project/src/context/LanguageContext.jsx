import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const languages = {
  en: 'English',
  hi: 'हिंदी',
  bn: 'বাংলা',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  mr: 'मराठी',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  pa: 'ਪੰਜਾਬੀ'
};

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Try to get language from localStorage, default to 'en' if not found
    return localStorage.getItem('userLanguage') || 'en';
  });

  const value = {
    currentLanguage,
    setCurrentLanguage: (lang) => {
      localStorage.setItem('userLanguage', lang);
      setCurrentLanguage(lang);
    },
    languages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 