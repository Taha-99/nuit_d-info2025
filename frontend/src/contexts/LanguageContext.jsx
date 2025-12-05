import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import translations from '../data/translations';

const LanguageContext = createContext();

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'fr');

  useEffect(() => {
    localStorage.setItem('language', language);
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', dir);
  }, [language]);

  const value = useMemo(() => ({
    language,
    direction: language === 'ar' ? 'rtl' : 'ltr',
    setLanguage,
    toggleLanguage: () => setLanguage((prev) => (prev === 'fr' ? 'ar' : 'fr')),
    t: (path) => {
      const segments = path.split('.');
      return segments.reduce((acc, key) => acc?.[key], translations[language]) || path;
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
};

export { LanguageProvider, useLanguage };
