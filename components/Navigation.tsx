"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function Navigation() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-gray-200/60 bg-white backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                YETTI<span className="text-gray-400">.AI</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/about"
                className={`transition-colors ${
                  pathname === "/about"
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t("nav.about")}
              </Link>
              <Link
                href="/pricing"
                className={`transition-colors ${
                  pathname === "/pricing"
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t("nav.pricing")}
              </Link>
              <Link
                href="/help"
                className={`transition-colors ${
                  pathname === "/help"
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t("nav.help")}
              </Link>
              <Link
                href="/contact"
                className={`transition-colors ${
                  pathname === "/contact"
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t("nav.contact")}
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t("nav.dashboard")}
              </Link>
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-xl text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors shadow-[0_8px_30px_rgba(14,165,233,0.35)]"
              >
                {t("nav.getStarted")}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Sidebar */}
        <div
          className={`absolute right-0 top-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="text-xl font-extrabold tracking-tight text-gray-900">
                YETTI<span className="text-gray-400">.AI</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Sidebar Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-4">
              <nav className="flex flex-col gap-2">
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg transition-colors ${
                    pathname === "/about"
                      ? "text-gray-900 bg-gray-100 font-medium"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {t("nav.about")}
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg transition-colors ${
                    pathname === "/pricing"
                      ? "text-gray-900 bg-gray-100 font-medium"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {t("nav.pricing")}
                </Link>
                <Link
                  href="/help"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg transition-colors ${
                    pathname === "/help"
                      ? "text-gray-900 bg-gray-100 font-medium"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {t("nav.help")}
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg transition-colors ${
                    pathname === "/contact"
                      ? "text-gray-900 bg-gray-100 font-medium"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {t("nav.contact")}
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {t("nav.dashboard")}
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {t("nav.login")}
                </Link>
              </nav>
            </div>

            {/* Sidebar Footer with CTA */}
            <div className="p-4 border-t border-gray-200">
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full px-4 py-3 text-center rounded-xl text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors shadow-[0_8px_30px_rgba(14,165,233,0.35)]"
              >
                {t("nav.getStarted")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
