"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const Navbar = () => {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
       
           "bg-white py-4"
      }`}
    >
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/yetti/logo2.jpg" alt="Admin Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold text-foreground">Admin</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-teal-primary transition-colors"
            >
              {t("nav.features")}
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-teal-primary transition-colors"
            >
              {t("nav.howItWorks")}
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-teal-primary transition-colors"
            >
              {t("nav.pricing")}
            </Link>
            <Link
              href="https://discord.gg/reY96aqzTe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground hover:text-teal-primary transition-colors"
            >
              {t("nav.contact")}
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-teal-primary transition-colors">
              {t("nav.login")}
            </Link>
            <Link href="/auth/signup" className="text-sm font-medium bg-teal-primary text-white hover:bg-teal-accent px-4 py-2 rounded-md transition-colors">
              {t("nav.getStarted")}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-gray-100"
          >
            <div className="container px-4 py-8 flex flex-col gap-8">
              <Link
                href="#features"
                className="text-sm font-medium text-foreground hover:text-teal-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("nav.features")}
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-foreground hover:text-teal-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("nav.howItWorks")}
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-foreground hover:text-teal-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("nav.pricing")}
              </Link>
              <Link
                href="https://discord.gg/reY96aqzTe"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-foreground hover:text-teal-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("nav.contact")}
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                <Link href="/auth/login" className="text-sm bg-teal-primary/10 text-teal-primary text-center px-3 py-2 rounded-lg font-medium hover:bg-teal-primary hover:text-white transition-colors w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  {t("nav.login")}
                </Link>
                <Link href="/auth/signup" className="text-sm bg-teal-primary px-3 py-2 rounded-lg text-white font-medium hover:bg-teal-accent transition-colors w-full text-center" onClick={() => setIsMobileMenuOpen(false)}>
                  {t("nav.getStarted")}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
