import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, Language, Direction, TranslationKey } from './translations';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_LANG_KEY = 'our_trip_user_lang_v1';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (saved === 'en' || saved === 'he') {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return 'he'; // Default is Hebrew
  });

  const direction: Direction = language === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LANG_KEY, language);
    } catch (e) {
      // ignore
    }
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language, direction]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'he' ? 'en' : 'he'));
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = TRANSLATIONS[language] as Record<string, string>;
    if (dict && dict[key]) {
      return dict[key];
    }
    const fallbackDict = TRANSLATIONS.he as Record<string, string>;
    return fallbackDict[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      <div dir={direction} className="w-full">
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
