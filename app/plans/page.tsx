import Link from "next/link";

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-2xl font-bold yeti-gradient bg-clip-text text-transparent"
              >
                🧊 Yeti AI
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="#features"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Features
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
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Start free and scale as you grow. All plans include our core AI
            agent integration features.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="yeti-card rounded-2xl p-8 yeti-shadow">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">1 AI Agent</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">2 Platform Integrations</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">1,000 Messages/month</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Basic Analytics</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Email Support</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all text-center block"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="yeti-card rounded-2xl p-8 yeti-shadow relative border-2 border-purple-200">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$29</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">For growing businesses</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">5 AI Agents</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Unlimited Integrations</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">50,000 Messages/month</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Advanced Analytics</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Priority Support</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Custom Branding</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">API Access</span>
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all text-center block"
              >
                Start Pro Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="yeti-card rounded-2xl p-8 yeti-shadow">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Enterprise
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">For large organizations</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Unlimited AI Agents</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Unlimited Integrations</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Unlimited Messages</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Advanced Analytics</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">24/7 Phone Support</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Custom Branding</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Full API Access</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">
                    Dedicated Account Manager
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">Custom Integrations</span>
                </li>
              </ul>
              <Link
                href="/contact"
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-all text-center block"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compare All Features
            </h2>
            <p className="text-xl text-gray-600">
              See what's included in each plan
            </p>
          </div>

          <div className="yeti-card rounded-2xl p-8 yeti-shadow overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Features
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">
                    Free
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">
                    Pro
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    AI Agents
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">1</td>
                  <td className="py-4 px-6 text-center text-gray-600">5</td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    Platform Integrations
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">2</td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    Unlimited
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    Messages per Month
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">1,000</td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    50,000
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    Analytics
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">Basic</td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    Advanced
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    Advanced
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    Support
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">Email</td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    Priority
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    24/7 Phone
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    API Access
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">-</td>
                  <td className="py-4 px-6 text-center text-gray-600">✓</td>
                  <td className="py-4 px-6 text-center text-gray-600">
                    Full Access
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    Custom Branding
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">-</td>
                  <td className="py-4 px-6 text-center text-gray-600">✓</td>
                  <td className="py-4 px-6 text-center text-gray-600">✓</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">
                    Account Manager
                  </td>
                  <td className="py-4 px-6 text-center text-gray-600">-</td>
                  <td className="py-4 px-6 text-center text-gray-600">-</td>
                  <td className="py-4 px-6 text-center text-gray-600">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-8">
            <div className="yeti-card rounded-xl p-6 yeti-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect immediately, and we'll prorate any billing
                differences.
              </p>
            </div>
            <div className="yeti-card rounded-xl p-6 yeti-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What happens if I exceed my message limit?
              </h3>
              <p className="text-gray-600">
                If you exceed your monthly message limit, we'll notify you and
                you can either upgrade your plan or purchase additional message
                credits.
              </p>
            </div>
            <div className="yeti-card rounded-xl p-6 yeti-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Is there a free trial for paid plans?
              </h3>
              <p className="text-gray-600">
                Yes! All paid plans come with a 14-day free trial. No credit
                card required to start.
              </p>
            </div>
            <div className="yeti-card rounded-xl p-6 yeti-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do you offer custom enterprise solutions?
              </h3>
              <p className="text-gray-600">
                Absolutely! Contact our sales team to discuss custom pricing and
                features for large organizations with specific requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="yeti-card rounded-3xl p-12 yeti-shadow">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
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
                href="/contact"
                className="border-2 border-purple-200 text-purple-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-purple-50 transition-all"
              >
                Contact Sales
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
