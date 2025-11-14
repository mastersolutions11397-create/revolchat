"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import {
  Search,
  Rocket,
  Link2,
  CreditCard,
  Wrench,
  Settings,
  BookOpen,
  MessageSquare,
  ArrowRight,
  X,
} from "lucide-react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Topics", icon: BookOpen },
    { id: "getting-started", name: "Getting Started", icon: Rocket },
    { id: "integrations", name: "Integrations", icon: Link2 },
    { id: "billing", name: "Billing", icon: CreditCard },
    { id: "troubleshooting", name: "Troubleshooting", icon: Wrench },
    { id: "api", name: "API & Developers", icon: Settings },
  ];

  const articles = [
    {
      id: 1,
      title: "How to create your first AI agent",
      category: "getting-started",
      description:
        "Step-by-step guide to setting up your first AI agent with yetti AI",
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
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center pt-28 sm:pt-32 pb-16 overflow-hidden bg-linear-to-br from-[#0b1220] to-[#0b1220]/90 text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_-120px,rgba(255,255,255,0.15),transparent_70%)]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                Help Center
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl">
                Find answers to common questions and learn how to make the most of
                yetti AI
              </p>
            </div>
            <div className="relative w-full max-w-md mx-auto lg:ml-auto">
              <div className="relative w-full aspect-square">
                <Image
                  src="/yetti/yetti_straight.png"
                  alt="yetti Help"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-12 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-lg"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Quick Help Cards */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-200 text-center">
              <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Getting Started
              </h3>
              <p className="text-gray-600 mb-6">
                New to yetti AI? Start here with our beginner guides and tutorials.
              </p>
              <Link
                href="#getting-started"
                onClick={() => setSelectedCategory("getting-started")}
                className="text-sky-500 font-semibold hover:text-sky-600 transition-colors inline-flex items-center gap-2"
              >
                View Guides <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-200 text-center">
              <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-8 h-8 text-white" />
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
                className="text-sky-500 font-semibold hover:text-sky-600 transition-colors inline-flex items-center gap-2"
              >
                View Integrations <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-200 text-center">
              <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
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
                className="text-sky-500 font-semibold hover:text-sky-600 transition-colors inline-flex items-center gap-2"
              >
                Get Support <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-200 sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                          selectedCategory === category.id
                            ? "bg-sky-500 text-white font-semibold"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        {category.name}
                      </button>
                    );
                  })}
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
                    className="rounded-xl bg-white p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
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
                          className="text-sky-500 hover:text-sky-600 font-semibold inline-flex items-center gap-2"
                        >
                          Read <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredArticles.length === 0 && (
                <div className="rounded-xl bg-white p-12 shadow-lg border border-gray-200 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
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
                    className="text-sky-500 hover:text-sky-600 font-semibold"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-12 shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <Image
                  src="/yetti/yetti_laying.png"
                  alt="yetti Support"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Still need help?
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Our support team is here to help you get the most out of yetti AI.
                  Get in touch and we'll respond within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/contact"
                    className="px-8 py-4 rounded-xl text-white bg-sky-500 hover:bg-sky-600 transition-colors   font-semibold text-center"
                  >
                    Contact Support
                  </Link>
                  <Link
                    href="/contact"
                    className="px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all font-semibold text-center"
                  >
                    Schedule a Call
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}