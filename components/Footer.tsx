import Link from "next/link";

interface FooterProps {
  variant?: "dark" | "light";
}

export default function Footer({ variant = "dark" }: FooterProps) {
  const isDark = variant === "dark";

  return (
    <footer className={`py-12 ${isDark ? "bg-gray-900 text-white" : "bg-white border-t border-gray-200"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="text-2xl font-bold mb-4">🧊 Yeti AI</div>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              Connecting AI agents to the world's most popular platforms.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/pricing"
                  className={`hover:${isDark ? "text-white" : "text-gray-900"} transition-colors ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/plans"
                  className={`hover:${isDark ? "text-white" : "text-gray-900"} transition-colors ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className={`hover:${isDark ? "text-white" : "text-gray-900"} transition-colors ${
                    isDark ? "text-gray-400" : "text-gray-600"
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
                  className={`hover:${isDark ? "text-white" : "text-gray-900"} transition-colors ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className={`hover:${isDark ? "text-white" : "text-gray-900"} transition-colors ${
                    isDark ? "text-gray-400" : "text-gray-600"
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
                  className={`hover:${isDark ? "text-white" : "text-gray-900"} transition-colors ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className={`hover:${isDark ? "text-white" : "text-gray-900"} transition-colors ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div
          className={`mt-8 pt-8 text-center ${
            isDark ? "border-t border-gray-800 text-gray-400" : "border-t border-gray-200 text-gray-500"
          }`}
        >
          <p>&copy; {new Date().getFullYear()} Yeti AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}




