"use client";

import Link from "next/link";
import NewsletterSignup from "./NewsletterSignup";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { Twitter, Linkedin, Instagram, Send, Heart, ArrowRight } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-950 text-white overflow-hidden border-t border-slate-800">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-900/20 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl translate-y-1/2"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        {/* Top Section: CTA & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-500">supercharge</span> your workflow?
            </h2>
            <p className="text-slate-400 text-lg max-w-md">
              Join thousands of developers and businesses building the future with Yetti AI.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-500 text-white font-semibold transition-all hover:-translate-y-1 shadow-lg shadow-sky-500/25"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10 transition-all hover:-translate-y-1"
              >
                Contact Sales
              </Link>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <h3 className="text-xl font-bold mb-2">Stay updated</h3>
            <p className="text-slate-400 mb-6">Get the latest updates, articles, and resources sent to your inbox.</p>
            <NewsletterSignup />
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-16"></div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-4 lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              <div className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                <span className="text-white">Yetti</span>
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                <span className="text-sky-500">.ai</span>
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              {t("footer.description")}
            </p>
            <div className="flex gap-4 pt-2">
              <Link 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-sky-500/20 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-all hover:-translate-y-1"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-sky-500/20 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-all hover:-translate-y-1"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-sky-500/20 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-all hover:-translate-y-1"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link 
                href="https://discord.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-sky-500/20 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-all hover:-translate-y-1"
                aria-label="Discord"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-2.595-9.669-5.594-13.711a.074.074 0 0 0-.034-.026ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Links Sections */}
          <div className="col-span-1 lg:col-span-2 lg:col-start-6">
            <h4 className="font-bold text-white mb-6">Product</h4>
            <ul className="space-y-4">
              {[
                { label: "Pricing", href: "/pricing" },
                { label: "Plans", href: "/plans" },
                { label: "Help Center", href: "/help" },
                { label: "Dashboard", href: "/dashboard" }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-slate-400 hover:text-sky-500 transition-colors inline-flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-4">
              {[
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Careers", href: "/careers" },
                { label: "Blog", href: "/blog" }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-slate-400 hover:text-sky-500 transition-colors inline-flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-bold text-white mb-6">Legal</h4>
            <ul className="space-y-4">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Cookie Policy", href: "/cookies" },
                { label: "Security", href: "/security" }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-slate-400 hover:text-sky-500 transition-colors inline-flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">
            &copy; {currentYear} Yetti AI. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>in San Francisco</span>
          </div>
        </div>
      </div>
    </footer>
  );
}




