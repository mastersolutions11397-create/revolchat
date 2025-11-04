"use client";

import Link from "next/link";
import { useState } from "react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Topics", icon: "📚" },
    { id: "getting-started", name: "Getting Started", icon: "🚀" },
    { id: "integrations", name: "Integrations", icon: "🔗" },
    { id: "billing", name: "Billing", icon: "💳" },
    { id: "troubleshooting", name: "Troubleshooting", icon: "🔧" },
    { id: "api", name: "API & Developers", icon: "⚙️" },
  ];

  const articles = [
    {
      id: 1,
      title: "How to create your first AI agent",
      category: "getting-started",
      description:
        "Step-by-step guide to setting up your first AI agent with Yeti AI",
      readTime: "5 min read",
      popular: true,
    },
    {
      id: 2,
      title: "Connecting to Instagram",
      category: "integrations",
      description:
        "Learn how to connect your AI agent to Instagram and start automating responses",
      readTime: "3 min read",
      popular: true,
    },
    {
      id: 3,
      title: "Setting up Telegram integration",
      category: "integrations",
      description: "Complete guide to integrating your AI agent with Telegram",
      readTime: "4 min read",
      popular: false,
    },
    {
      id: 4,
      title: "Understanding your billing cycle",
      category: "billing",
      description: "Everything you need to know about how billing works",
      readTime: "2 min read",
      popular: false,
    },
    {
      id: 5,
      title: "Common connection issues",
      category: "troubleshooting",
      description: "Troubleshoot common issues with platform connections",
      readTime: "6 min read",
      popular: true,
    },
    {
      id: 6,
      title: "API authentication guide",
      category: "api",
      description: "How to authenticate with our API and get started",
      readTime: "8 min read",
      popular: false,
    },
    {
      id: 7,
      title: "Managing multiple workspaces",
      category: "getting-started",
      description:
        "Learn how to organize your AI agents across different workspaces",
      readTime: "4 min read",
      popular: false,
    },
    {
      id: 8,
      title: "WhatsApp Business integration",
      category: "integrations",
      description: "Connect your AI agent to WhatsApp Business API",
      readTime: "5 min read",
      popular: false,
    },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
                className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Find answers to common questions and learn how to make the most of
            Yeti AI
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <span className="text-gray-400 text-xl">🔍</span>
            </div>
          </div>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="yeti-card rounded-2xl p-8 yeti-shadow text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white">🚀</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Getting Started
            </h3>
            <p className="text-gray-600 mb-6">
              New to Yeti AI? Start here with our beginner guides and tutorials.
            </p>
            <Link
              href="#getting-started"
              onClick={() => setSelectedCategory("getting-started")}
              className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
            >
              View Guides →
            </Link>
          </div>

          <div className="yeti-card rounded-2xl p-8 yeti-shadow text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white">🔗</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Integrations
            </h3>
            <p className="text-gray-600 mb-6">
              Learn how to connect your AI agents to different platforms.
            </p>
            <Link
              href="#integrations"
              onClick={() => setSelectedCategory("integrations")}
              className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
            >
              View Integrations →
            </Link>
          </div>

          <div className="yeti-card rounded-2xl p-8 yeti-shadow text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white">💬</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Contact Support
            </h3>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to
              help.
            </p>
            <Link
              href="/contact"
              className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
            >
              Get Support →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="yeti-card rounded-2xl p-6 yeti-shadow sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedCategory === category.id
                        ? "bg-purple-100 text-purple-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-3">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Articles List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedCategory === "all"
                  ? "All Articles"
                  : categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-600">
                {filteredArticles.length} article
                {filteredArticles.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="yeti-card rounded-xl p-6 yeti-shadow hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {article.title}
                        </h3>
                        {article.popular && (
                          <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">
                        {article.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{article.readTime}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {article.category.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Link
                        href={`/help/article/${article.id}`}
                        className="text-purple-600 hover:text-purple-700 font-semibold"
                      >
                        Read →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="yeti-card rounded-xl p-12 yeti-shadow text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-gray-400">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No articles found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or browse different categories
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support CTA */}
        <div className="mt-16 yeti-card rounded-2xl p-12 yeti-shadow text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Still need help?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Our support team is here to help you get the most out of Yeti AI.
            Get in touch and we'll respond within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Contact Support
            </Link>
            <Link
              href="/contact"
              className="border border-purple-600 text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-purple-50 transition-all"
            >
              Schedule a Call
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">🧊 Yeti AI</div>
              <p className="text-gray-400">
                Connecting AI agents to the world's most popular platforms.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/integrations"
                    className="hover:text-white transition-colors"
                  >
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
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
                    href="/careers"
                    className="hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="hover:text-white transition-colors"
                  >
                    Cookie Policy
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
