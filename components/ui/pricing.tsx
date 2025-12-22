"use client";

import { Button } from "@/components/ui/button";
import { Check, Zap, Shield, Star, Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function Pricing() {
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
        "Standard response time",
      ],
      icon: Sparkles,
      color: "slate",
      popular: false,
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
        "API access",
      ],
      icon: Zap,
      color: "sky",
      popular: false,
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
        "Advanced analytics",
      ],
      icon: Shield,
      color: "blue",
      popular: true,
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
        "Custom integrations",
      ],
      icon: Star,
      color: "indigo",
      popular: false,
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
        "Dedicated account manager",
      ],
      icon: Crown,
      color: "violet",
      popular: false,
    },
  ];

  return (
    <div className="bg-slate-50 relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-100/40 rounded-full blur-3xl opacity-60" />
      </div>
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="mx-auto max-w-2xl text-center mb-16 animate-fade-in-up">
          <h2 className="text-slate-900 text-3xl font-bold md:text-4xl lg:text-5xl tracking-tight">
            {t("pricing.title")}
          </h2>
          <p className="text-slate-600 mx-auto mt-4 max-w-md text-balance text-lg">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 animate-fade-in-up delay-200">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  plan.popular
                    ? "ring-2 ring-sky-500 scale-105 z-10"
                    : "border border-slate-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-sky-500 text-white text-xs font-bold rounded-full shadow-sm">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl bg-${plan.color}-50 flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-6 h-6 text-${plan.color}-500`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-slate-900">
                      ${plan.price}
                    </span>
                    {plan.price !== "0" && (
                      <span className="text-slate-500 ml-1">/mo</span>
                    )}
                  </div>
                  <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {plan.tokens} Tokens
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start text-sm text-slate-600"
                    >
                      <Check className="w-4 h-4 text-sky-500 mr-2 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full rounded-xl font-semibold shadow-sm ${
                    plan.popular
                      ? "bg-sky-500 hover:bg-sky-500 text-white shadow-sky-200"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  <Link href="/auth/signup">
                    {plan.price === "0" ? "Get Started" : "Subscribe"}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center animate-fade-in-up delay-300">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
            <span className="text-sm font-medium text-slate-700">
              Need more tokens?
            </span>
            <span className="text-sm font-bold text-sky-500">
              Add-on: $10.00 / 500 Tokens
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
