"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-linear-to-br from-dashboard-bg to-dashboard-card border-t border-dashboard-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Logo and Info Section */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <Image src="/yetti/logo2.jpg" alt="Admin logo" width={40} height={40} className="w-10 h-10" />
                <span className="text-xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Admin
                </span>
              </div>
              <p className="text-gray-600 text-sm text-center md:text-left max-w-sm">
                {t("footer.description")}
              </p>
            </div>

            {/* Support Links */}
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
              <Link href="/privacy" className="text-gray-600 hover:text-teal-primary transition-colors text-sm font-medium">
                {t("footer.legal.privacy")}
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-teal-primary transition-colors text-sm font-medium">
                {t("footer.legal.terms")}
              </Link>
              <Link
                href="https://discord.gg/reY96aqzTe"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-teal-primary transition-colors text-sm font-medium"
              >
                {t("footer.company.contact")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
