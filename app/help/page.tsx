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
  Star,
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
    <div className="min-h-screen bg-slate-50">
      <Navigation darkBackground={true} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-sky-500/20 to-blue-600/20 blur-[100px] animate-pulse-slow" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-sky-500/20 to-sky-500/20 blur-[100px] animate-pulse-slow delay-1000" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-6 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              Support
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 animate-fade-in-up delay-100">
              Help <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Center</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed animate-fade-in-up delay-200">
              Find answers to common questions and learn how to make the most of
              yetti AI
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="relative -mt-8 z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative shadow-xl rounded-2xl bg-white p-2">
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-14 pr-12 bg-transparent border-none focus:ring-0 text-lg text-slate-900 placeholder:text-slate-400"
            />
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
              <Search className="w-6 h-6 text-sky-500" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Quick Help Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group rounded-2xl bg-white p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Rocket className="w-7 h-7 text-sky-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Getting Started
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                New to yetti AI? Start here with our beginner guides and tutorials.
              </p>
              <Link
                href="#getting-started"
                onClick={() => setSelectedCategory("getting-started")}
                className="text-sky-600 font-semibold hover:text-sky-700 transition-colors inline-flex items-center gap-2 group-hover:gap-3"
              >
                View Guides <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="group rounded-2xl bg-white p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Link2 className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Integrations
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Learn how to connect your AI agents to different platforms.
              </p>
              <Link
                href="#integrations"
                onClick={() => setSelectedCategory("integrations")}
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors inline-flex items-center gap-2 group-hover:gap-3"
              >
                View Integrations <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="group rounded-2xl bg-white p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Contact Support
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Can't find what you're looking for? Our support team is here to
                help.
              </p>
              <Link
                href="/contact"
                className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors inline-flex items-center gap-2 group-hover:gap-3"
              >
                Get Support <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 sticky top-24">
                <h3 className="text-lg font-bold text-slate-900 mb-4 px-2">
                  Categories
                </h3>
                <div className="space-y-1">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    const isActive = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-medium ${
                          isActive
                            ? "bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-200"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 ${isActive ? "text-sky-600" : "text-slate-400"}`} />
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Articles List */}
            <div className="lg:col-span-3">
              <div className="mb-8 flex items-end justify-between border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {selectedCategory === "all"
                      ? "All Articles"
                      : categories.find((c) => c.id === selectedCategory)?.name}
                  </h2>
                  <p className="text-slate-500">
                    {filteredArticles.length} article
                    {filteredArticles.length !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-sky-200 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                            {article.title}
                          </h3>
                          {article.popular && (
                            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" /> Popular
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                          {article.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            {article.readTime}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-xs">
                            {article.category.replace("-", " ")}
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:block self-center">
                        <Link
                          href={`/help/article/${article.id}`}
                          className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredArticles.length === 0 && (
                <div className="rounded-2xl bg-white p-16 shadow-sm border border-slate-200 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    No articles found
                  </h3>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    We couldn't find any articles matching your search. Try adjusting your terms or browse different categories.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="text-sky-600 hover:text-sky-700 font-semibold hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support CTA */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-12 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl"></div>
             <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 relative z-10">
              <div className="relative w-full aspect-square max-w-md mx-auto lg:order-2">
                <Image
                  src="/yetti/yetti_laying.png"
                  alt="yetti Support"
                  fill
                  className="object-contain drop-shadow-2xl"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
              <div className="text-center lg:text-left lg:order-1">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Still need help?
                </h2>
                <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                  Our support team is here to help you get the most out of yetti AI.
                  Get in touch and we'll respond within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/contact"
                    className="px-8 py-4 rounded-xl text-white bg-sky-500 hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/25 font-bold text-center hover:-translate-y-0.5"
                  >
                    Contact Support
                  </Link>
                  <Link
                    href="/contact"
                    className="px-8 py-4 rounded-xl border border-slate-600 text-white hover:bg-slate-800 transition-all font-semibold text-center hover:-translate-y-0.5"
                  >
                    Schedule a Call
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}