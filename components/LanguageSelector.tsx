"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useLanguage, Language } from "@/lib/contexts/LanguageContext";

const languages = [
  { code: "en" as Language, name: "English", flag: "🇬🇧" },
  { code: "es" as Language, name: "Español", flag: "🇪🇸" },
  { code: "it" as Language, name: "Italiano", flag: "🇮🇹" },
  { code: "zh" as Language, name: "中文", flag: "🇨🇳" },
  { code: "ru" as Language, name: "Русский", flag: "🇷🇺" },
  { code: "sv" as Language, name: "Svenska", flag: "🇸🇪" },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={dropdownRef}>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mb-2 animate-in slide-in-from-bottom-2">
          <div className="py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  language === lang.code ? "bg-sky-50" : ""
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span
                  className={`text-sm font-medium ${
                    language === lang.code
                      ? "text-sky-600"
                      : "text-gray-700"
                  }`}
                >
                  {lang.name}
                </span>
                {language === lang.code && (
                  <svg
                    className="ml-auto w-4 h-4 text-sky-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Globe Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group relative"
        aria-label="Change language"
      >
        <Globe className="w-6 h-6" />
        
        {/* Current language indicator */}
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-base">
          {currentLanguage?.flag}
        </span>
      </button>
    </div>
  );
}

