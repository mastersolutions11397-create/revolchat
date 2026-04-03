"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useLanguage, Language } from "@/lib/contexts/LanguageContext";

const languages = [
  { code: "en" as Language, name: "English", flag: "🇬🇧" },
  { code: "es" as Language, name: "Español", flag: "🇪🇸" },
  { code: "it" as Language, name: "Italiano", flag: "🇮🇹" },
  { code: "pt" as Language, name: "Português", flag: "🇵🇹" },
];

const BUTTON_SIZE = 56;
const VIEWPORT_MARGIN = 24;
const HOLD_TO_DRAG_MS = 180;
const STORAGE_KEY = "language-selector-position";

type Position = {
  x: number;
  y: number;
};

function clampPosition(position: Position): Position {
  if (typeof window === "undefined") {
    return position;
  }

  const maxX = Math.max(VIEWPORT_MARGIN, window.innerWidth - BUTTON_SIZE - VIEWPORT_MARGIN);
  const maxY = Math.max(VIEWPORT_MARGIN, window.innerHeight - BUTTON_SIZE - VIEWPORT_MARGIN);

  return {
    x: Math.min(Math.max(position.x, VIEWPORT_MARGIN), maxX),
    y: Math.min(Math.max(position.y, VIEWPORT_MARGIN), maxY),
  };
}

function getDefaultPosition(): Position {
  if (typeof window === "undefined") {
    return { x: VIEWPORT_MARGIN, y: VIEWPORT_MARGIN };
  }

  return {
    x: VIEWPORT_MARGIN,
    y: window.innerHeight - BUTTON_SIZE - VIEWPORT_MARGIN,
  };
}

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const holdTimerRef = useRef<number | null>(null);
  const dragStartedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPosition = window.localStorage.getItem(STORAGE_KEY);
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition) as Position;
        setPosition(clampPosition(parsed));
        return;
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setPosition(getDefaultPosition());
  }, []);

  useEffect(() => {
    if (!position || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setPosition((current) => clampPosition(current ?? getDefaultPosition()));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Use a longer delay to ensure button clicks process first
      const timeoutId = setTimeout(() => {
        window.addEventListener("click", handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleLanguageClick = (langCode: Language, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setLanguage(langCode);
    setIsOpen(false);
  };

  const clearHoldTimer = () => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const stopDragging = () => {
    clearHoldTimer();
    setIsDragging(false);

    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerUp);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!dragStartedRef.current) return;

    setPosition(
      clampPosition({
        x: event.clientX - dragOffsetRef.current.x,
        y: event.clientY - dragOffsetRef.current.y,
      })
    );
  };

  const handlePointerUp = () => {
    window.setTimeout(() => {
      dragStartedRef.current = false;
    }, 0);
    stopDragging();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dropdownRef.current) return;

    dragOffsetRef.current = {
      x: event.clientX - dropdownRef.current.getBoundingClientRect().left,
      y: event.clientY - dropdownRef.current.getBoundingClientRect().top,
    };

    dragStartedRef.current = false;
    clearHoldTimer();

    holdTimerRef.current = window.setTimeout(() => {
      dragStartedRef.current = true;
      setIsDragging(true);
      setIsOpen(false);
    }, HOLD_TO_DRAG_MS);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  const currentLanguage = languages.find((lang) => lang.code === language);
  const resolvedPosition = position ?? { x: VIEWPORT_MARGIN, y: VIEWPORT_MARGIN };
  const shouldOpenToLeft =
    typeof window !== "undefined" && resolvedPosition.x > window.innerWidth - 260;

  return (
    <div
      className="fixed z-50"
      ref={dropdownRef}
      style={{
        left: resolvedPosition.x,
        top: resolvedPosition.y,
      }}
    >
      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute bottom-16 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mb-2 animate-in slide-in-from-bottom-2 z-50"
          style={shouldOpenToLeft ? { right: 0 } : { left: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={(e) => handleLanguageClick(lang.code, e)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                  language === lang.code ? "bg-sky-50" : ""
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span
                  className={`text-sm font-medium ${
                    language === lang.code
                      ? "text-sky-500"
                      : "text-gray-700"
                  }`}
                >
                  {lang.name}
                </span>
                {language === lang.code && (
                  <svg
                    className="ml-auto w-4 h-4 text-sky-500"
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
        type="button"
        onPointerDown={handlePointerDown}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (dragStartedRef.current) {
            return;
          }
          setIsOpen(!isOpen);
        }}
        className={`w-14 h-14 rounded-full bg-sky-500 hover:bg-sky-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group relative ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
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
