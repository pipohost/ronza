
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import translations from '@/lib/translations.json';

type Language = 'ar' | 'en';

interface TranslationContextType {
  lang: Language;
  t: (typeof translations)['ar']; // Use 'ar' as the base type
  toggleLanguage: () => void;
  dir: 'rtl' | 'ltr';
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('ar'); // Default to Arabic

  useEffect(() => {
    // This effect runs only on the client
    const storedLang = localStorage.getItem('ronza_lang') as Language;
    if (storedLang && ['ar', 'en'].includes(storedLang)) {
      setLang(storedLang);
      document.documentElement.lang = storedLang;
      document.documentElement.dir = storedLang === 'ar' ? 'rtl' : 'ltr';
    } else {
      // Set default if nothing is stored
      const defaultLang = 'ar';
      setLang(defaultLang);
      document.documentElement.lang = defaultLang;
      document.documentElement.dir = 'rtl';
      localStorage.setItem('ronza_lang', defaultLang);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLang(prevLang => {
      const newLang = prevLang === 'ar' ? 'en' : 'ar';
      localStorage.setItem('ronza_lang', newLang);
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      // Force a re-render on the root to propagate dir change
      window.dispatchEvent(new Event('languageChanged'));
      return newLang;
    });
  }, []);
  
  useEffect(() => {
    const handleLanguageChange = () => {
      // This is just to force a re-render of consumers
    };
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);


  const t = translations[lang];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const value = { lang, t, toggleLanguage, dir };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
