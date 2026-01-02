"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "es" | "it" | "zh" | "ru" | "sv";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
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
    let isMounted = true;
    
    import(`@/lib/translations/${language}.json`)
      .then((module) => {
        if (isMounted) {
          setTranslations(module.default || {});
        }
      })
      .catch((err) => {
        console.error(`Failed to load translations for ${language}:`, err);
        // Fallback to English if translation file doesn't exist
        if (language !== "en" && isMounted) {
          import(`@/lib/translations/en.json`)
            .then((module) => {
              if (isMounted) {
                setTranslations(module.default || {});
              }
            })
            .catch((fallbackErr) => {
              console.error("Failed to load fallback translations:", fallbackErr);
            });
        }
      });
    
    return () => {
      isMounted = false;
    };
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[key] || key;
    
    // Replace placeholders with actual values if params are provided
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        const value = params[paramKey];
        translation = translation.replace(
          new RegExp(`\\{${paramKey}\\}`, 'g'),
          String(value)
        );
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

