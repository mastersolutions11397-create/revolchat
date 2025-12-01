"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, MessageCircle as Discord, ArrowUp, Zap, Building2, HelpCircle } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-linear-to-br from-slate-50 to-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Brand Section */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-6">
                <Image src="/yetti/logo.png" alt="Yetti logo" width={44} height={44} className="w-11 h-11" />
                <span className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  yetti.ai
                </span>
              </div>
              <p className="text-gray-600 mb-8 max-w-sm leading-relaxed text-sm">
                Transform your social media presence with AI-powered customer engagement that works around the clock.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="group w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-pink-500 hover:border-pink-200 hover:bg-pink-50/50 transition-all duration-200 shadow-sm">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="#" className="group w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-sky-500 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 shadow-sm">
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link href="#" className="group w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200 shadow-sm">
                  <Discord className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Product Links */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-sky-500" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Product</h3>
              </div>
              <ul className="space-y-3">
                <li><Link href="#" className="text-gray-600 hover:text-sky-500 transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block">Features</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-sky-500 transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block">Pricing</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-sky-500 transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block">Integrations</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-sky-500 transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block">API</Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-sky-500" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Company</h3>
              </div>
              <ul className="space-y-3">
                <li><Link href="#" className="text-gray-600 hover:text-sky-500 transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block">About</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-sky-500 transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block">Blog</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-sky-500 transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block">Careers</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-sky-500 transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block">Contact</Link></li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="md:col-span-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-sky-500" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Support</h3>
              </div>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-gray-600 hover:text-sky-500 transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-sky-500 transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block">Terms of Service</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-sky-500 transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block">Help Center</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-sky-500 transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block">Status</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 yetti.ai. All rights reserved.
            </p>
            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium hover:scale-105 transform duration-200"
            >
              Back to top
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
