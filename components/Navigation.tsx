"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface NavigationProps {
  darkBackground?: boolean;
}

export default function Navigation({ darkBackground = false }: NavigationProps) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = !scrolled && darkBackground;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
                Y
              </div>
              <span className={`text-xl font-bold tracking-tight ${isTransparent ? "text-white" : "text-slate-900"}`}>
                Yetti<span className="text-sky-500">.ai</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <div className={`flex items-center rounded-full px-2 py-1 mr-4 ${
                isTransparent 
                  ? "bg-white/10 backdrop-blur-sm border border-white/10" 
                  : "bg-slate-50/50 backdrop-blur-sm border border-slate-200/50"
              }`}>
                <NavLink href="/about" active={pathname === "/about"} isTransparent={isTransparent}>{t("nav.about")}</NavLink>
                <NavLink href="/pricing" active={pathname === "/pricing"} isTransparent={isTransparent}>{t("nav.pricing")}</NavLink>
                <NavLink href="/help" active={pathname === "/help"} isTransparent={isTransparent}>{t("nav.help")}</NavLink>
                <NavLink href="/contact" active={pathname === "/contact"} isTransparent={isTransparent}>{t("nav.contact")}</NavLink>
              </div>
              
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className={`text-sm font-medium px-4 py-2 transition-colors ${
                    isTransparent 
                      ? "text-white/90 hover:text-white" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-sky-500 hover:bg-sky-500 transition-all shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5"
                >
                  {t("nav.getStarted")}
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 transition-colors rounded-lg ${
                isTransparent 
                  ? "text-white hover:bg-white/10" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
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
          className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Sidebar */}
        <div
          className={`absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Yetti<span className="text-sky-500">.ai</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
              <MobileNavLink href="/about" onClick={() => setMobileMenuOpen(false)}>{t("nav.about")}</MobileNavLink>
              <MobileNavLink href="/pricing" onClick={() => setMobileMenuOpen(false)}>{t("nav.pricing")}</MobileNavLink>
              <MobileNavLink href="/help" onClick={() => setMobileMenuOpen(false)}>{t("nav.help")}</MobileNavLink>
              <MobileNavLink href="/contact" onClick={() => setMobileMenuOpen(false)}>{t("nav.contact")}</MobileNavLink>
              <div className="my-4 border-t border-slate-100" />
              <MobileNavLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>{t("nav.dashboard")}</MobileNavLink>
              <MobileNavLink href="/auth/login" onClick={() => setMobileMenuOpen(false)}>{t("nav.login")}</MobileNavLink>
            </nav>

            <div className="mt-auto">
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-3 text-center rounded-xl text-white bg-sky-500 hover:bg-sky-500 transition-all font-semibold shadow-lg shadow-sky-500/25"
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

function NavLink({ href, active, isTransparent, children }: { href: string; active: boolean; isTransparent: boolean; children: React.ReactNode }) {
  if (isTransparent) {
    return (
      <Link
        href={href}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          active
            ? "bg-white text-sky-500 shadow-sm"
            : "text-white/80 hover:text-white hover:bg-white/10"
        }`}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
        active
          ? "bg-white text-sky-500 shadow-sm"
          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors font-medium"
    >
      {children}
    </Link>
  );
}
