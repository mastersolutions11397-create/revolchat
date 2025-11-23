"use client";

import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Check, Sparkles, Zap, Shield, Star, Crown } from "lucide-react";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function PricingPage() {
  const { t } = useLanguage();
  
  const plans = [
    {
      name: "Free",
      price: "0",
      tokens: "100",
      description: "Perfect for trying out Yetti",
      features: [
        "100 Yetti Tokens",
        "Basic AI capabilities",
        "Community support",
        "Standard response time"
      ],
      icon: Sparkles,
      color: "slate",
      popular: false,
      cta: "Get Started"
    },
    {
      name: "Starter",
      price: "29",
      tokens: "1,000",
      description: "For individuals and hobbyists",
      features: [
        "1,000 Yetti Tokens",
        "Standard AI models",
        "Email support",
        "API access"
      ],
      icon: Zap,
      color: "sky",
      popular: false,
      cta: "Start Free Trial"
    },
    {
      name: "Basic",
      price: "59",
      tokens: "2,500",
      description: "For growing projects",
      features: [
        "2,500 Yetti Tokens",
        "Faster processing",
        "Priority email support",
        "Advanced analytics"
      ],
      icon: Shield,
      color: "blue",
      popular: true,
      cta: "Subscribe Now"
    },
    {
      name: "Pro",
      price: "99",
      tokens: "5,000",
      description: "For professional developers",
      features: [
        "5,000 Yetti Tokens",
        "Priority processing",
        "24/7 support",
        "Custom integrations"
      ],
      icon: Star,
      color: "indigo",
      popular: false,
      cta: "Go Pro"
    },
    {
      name: "Enterprise",
      price: "179",
      tokens: "10,000",
      description: "For large scale applications",
      features: [
        "10,000 Yetti Tokens",
        "Dedicated infrastructure",
        "SLA guarantee",
        "Dedicated account manager"
      ],
      icon: Crown,
      color: "violet",
      popular: false,
      cta: "Contact Sales"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
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
              Simple Pricing
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 animate-fade-in-up delay-100">
              {t("pricing.title")}
            </h1>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed animate-fade-in-up delay-200">
              {t("pricing.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <div
                  key={index}
                  className={`relative flex flex-col rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in-up ${
                    plan.popular 
                      ? "ring-2 ring-sky-500 scale-105 z-10" 
                      : "border border-slate-200"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-sky-500 text-white text-xs font-bold rounded-full shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-${plan.color}-50 flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 text-${plan.color}-500`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                      {plan.price !== "0" && <span className="text-slate-500 ml-1">/mo</span>}
                    </div>
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {plan.tokens} Tokens
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start text-sm text-slate-600">
                        <Check className="w-4 h-4 text-sky-500 mr-2 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.name === "Enterprise" ? "/contact" : "/auth/signup"}
                    className={`w-full block text-center py-3 px-6 rounded-xl font-semibold transition-all mt-auto shadow-sm ${
                      plan.popular
                        ? "bg-sky-500 hover:bg-sky-600 text-white shadow-sky-200"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Add-on Section */}
          <div className="max-w-2xl mx-auto text-center animate-fade-in-up delay-300">
             <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-base font-semibold text-slate-900">Need more tokens?</span>
                </div>
                <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
                <span className="text-base font-bold text-sky-600">Add-on: $10.00 / 500 Tokens</span>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
