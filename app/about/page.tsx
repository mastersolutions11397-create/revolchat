import Link from "next/link";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100">
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
            <div className="flex items-center space-x-4">
              <Link
                href="/about"
                className="text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/pricing"
                className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/auth/login"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About Yeti AI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing how businesses connect their AI agents to the
            world's most popular platforms, making advanced AI accessible to
            everyone.
          </p>
        </div>

        {/* Mission Section */}
        <div className="yeti-card rounded-2xl p-12 yeti-shadow mb-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-white">🎯</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              To democratize AI technology by providing businesses of all sizes
              with powerful, easy-to-use tools that connect their AI agents to
              Instagram, Telegram, and other major platforms. We believe that
              every business should have access to cutting-edge AI capabilities
              without the complexity of building everything from scratch.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="yeti-card rounded-xl p-8 yeti-shadow text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white">🚀</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Innovation</h3>
            <p className="text-gray-600">
              We continuously push the boundaries of what's possible with AI
              integration, staying ahead of the curve in technology and user
              experience.
            </p>
          </div>

          <div className="yeti-card rounded-xl p-8 yeti-shadow text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white">🤝</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Accessibility
            </h3>
            <p className="text-gray-600">
              We make advanced AI technology accessible to businesses of all
              sizes, removing technical barriers and complexity.
            </p>
          </div>

          <div className="yeti-card rounded-xl p-8 yeti-shadow text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Security</h3>
            <p className="text-gray-600">
              Your data and your customers' data are our top priority. We
              implement enterprise-grade security measures to protect what
              matters most.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="yeti-card rounded-2xl p-12 yeti-shadow mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're a passionate team of AI researchers, engineers, and
              designers working together to build the future of AI integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-white">👨‍💻</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                AI Engineers
              </h3>
              <p className="text-gray-600">
                Building the core AI infrastructure that powers our platform
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-white">🔧</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Integration Specialists
              </h3>
              <p className="text-gray-600">
                Creating seamless connections to your favorite platforms
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-white">🎨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                UX Designers
              </h3>
              <p className="text-gray-600">
                Crafting intuitive experiences that make AI accessible
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="yeti-card rounded-2xl p-12 yeti-shadow mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              By the Numbers
            </h2>
            <p className="text-lg text-gray-600">
              Our impact in the AI integration space
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                10K+
              </div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50M+</div>
              <div className="text-gray-600">Messages Processed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                99.9%
              </div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                24/7
              </div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using Yeti AI to connect their
            AI agents to the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="border border-purple-600 text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-purple-50 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer variant="dark" />
    </div>
  );
}
