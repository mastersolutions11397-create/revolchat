"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-gray-200/60 bg-white backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">
              YETTI<span className="text-gray-400">.AI</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/about"
              className={`transition-colors ${
                pathname === "/about"
                  ? "text-gray-900 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              About
            </Link>
            <Link
              href="/pricing"
              className={`transition-colors ${
                pathname === "/pricing"
                  ? "text-gray-900 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Pricing
            </Link>
            <Link
              href="/help"
              className={`transition-colors ${
                pathname === "/help"
                  ? "text-gray-900 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Help
            </Link>
            <Link
              href="/contact"
              className={`transition-colors ${
                pathname === "/contact"
                  ? "text-gray-900 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Contact
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 rounded-xl text-white bg-[#5170ff] hover:bg-[#4a68f0] transition-colors shadow-[0_8px_30px_rgba(81,112,255,0.35)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
