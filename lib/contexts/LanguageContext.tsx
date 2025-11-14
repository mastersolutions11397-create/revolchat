"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "es" | "it" | "zh" | "ru" | "sv";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Load translations for current language
    import(`@/lib/translations/${language}.json`)
      .then((module) => {
        setTranslations(module.default);
      })
      .catch((err) => {
        console.error("Failed to load translations:", err);
      });
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

