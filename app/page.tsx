import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold yeti-gradient bg-clip-text text-transparent">
                  🧊 Yeti AI
                </h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="#features"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="/help"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Help
                </Link>
                <Link
                  href="/about"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Connect Your AI Agent to
              <span className="yeti-gradient bg-clip-text text-transparent block">
                Every Platform
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Yeti AI seamlessly integrates your chatbot with Instagram,
              Telegram, WhatsApp, and more. One AI agent, infinite
              possibilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all yeti-shadow"
              >
                Start Free Trial
              </Link>
              <Link
                href="#demo"
                className="border-2 border-purple-200 text-purple-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-purple-50 transition-all"
              >
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Integrations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect your AI agent to all your favorite platforms with just a
              few clicks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Instagram Integration */}
            <div className="yeti-card rounded-2xl p-8 yeti-shadow hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Instagram
              </h3>
              <p className="text-gray-600 mb-6">
                Automatically respond to DMs, comments, and stories with your AI
                agent. Engage with your audience 24/7.
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                <span>Learn More</span>
                <span className="ml-2">→</span>
              </div>
            </div>

            {/* Telegram Integration */}
            <div className="yeti-card rounded-2xl p-8 yeti-shadow hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">✈️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Telegram
              </h3>
              <p className="text-gray-600 mb-6">
                Create powerful Telegram bots that can handle complex
                conversations, file sharing, and group management.
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                <span>Learn More</span>
                <span className="ml-2">→</span>
              </div>
            </div>

            {/* WhatsApp Integration */}
            <div className="yeti-card rounded-2xl p-8 yeti-shadow hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                WhatsApp
              </h3>
              <p className="text-gray-600 mb-6">
                Integrate with WhatsApp Business API to provide instant customer
                support and automated responses.
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                <span>Learn More</span>
                <span className="ml-2">→</span>
              </div>
            </div>

            {/* Discord Integration */}
            <div className="yeti-card rounded-2xl p-8 yeti-shadow hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Discord
              </h3>
              <p className="text-gray-600 mb-6">
                Deploy AI-powered Discord bots that can moderate servers, answer
                questions, and engage with your community.
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                <span>Learn More</span>
                <span className="ml-2">→</span>
              </div>
            </div>

            {/* Slack Integration */}
            <div className="yeti-card rounded-2xl p-8 yeti-shadow hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Slack
              </h3>
              <p className="text-gray-600 mb-6">
                Enhance your team's productivity with AI-powered Slack bots that
                can automate workflows and provide instant assistance.
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                <span>Learn More</span>
                <span className="ml-2">→</span>
              </div>
            </div>

            {/* Custom API */}
            <div className="yeti-card rounded-2xl p-8 yeti-shadow hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Custom API
              </h3>
              <p className="text-gray-600 mb-6">
                Build custom integrations with our powerful API. Connect to any
                platform or service with our flexible SDK.
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                <span>Learn More</span>
                <span className="ml-2">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="yeti-card rounded-3xl p-12 yeti-shadow">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Connect Your AI Agent?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of businesses already using Yeti AI to automate
              their customer interactions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Start Your Free Trial
              </Link>
              <Link
                href="/plans"
                className="border-2 border-purple-200 text-purple-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-purple-50 transition-all"
              >
                View Pricing Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">🧊 Yeti AI</h3>
              <p className="text-gray-400">
                The ultimate AI agent integration platform for modern
                businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/plans"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#demo"
                    className="hover:text-white transition-colors"
                  >
                    Demo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="hover:text-white transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/status"
                    className="hover:text-white transition-colors"
                  >
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Yeti AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
