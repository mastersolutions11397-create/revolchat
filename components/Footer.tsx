import Link from "next/link";
import NewsletterSignup from "./NewsletterSignup";

interface FooterProps {
  variant?: "dark" | "light";
}

export default function Footer({ variant = "dark" }: FooterProps) {
  const isDark = variant === "dark";

  return (
    <footer className={`py-12 ${isDark ? "bg-gray-900 text-white" : "bg-white border-t border-gray-200"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="text-2xl font-bold mb-4">
              {isDark ? (
                <>
                  <span className="text-white">YETTI</span>
                  <span className="text-gray-400">.AI</span>
                </>
              ) : (
                <>
                  <span className="text-gray-900">YETTI</span>
                  <span className="text-gray-400">.AI</span>
                </>
              )}
            </div>
            <p className={`mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Connecting AI agents to the world's most popular platforms.
            </p>
            {!isDark && <NewsletterSignup />}
          </div>

          {/* Product */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/pricing"
                  className={`transition-colors ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/plans"
                  className={`transition-colors ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className={`transition-colors ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className={`transition-colors ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className={`transition-colors ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className={`transition-colors ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className={`transition-colors ${
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div
          className={`mt-8 pt-8 ${
            isDark ? "border-t border-gray-800" : "border-t border-gray-200"
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>
              &copy; {new Date().getFullYear()} Yeti AI. All rights reserved.
            </p>
            {isDark && <NewsletterSignup />}
          </div>
        </div>
      </div>
    </footer>
  );
}




