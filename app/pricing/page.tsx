"use client";

import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Check } from "lucide-react";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function PricingPage() {
  const { t } = useLanguage();
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for individuals and small projects",
      features: [
        "Up to 1 AI agent",
        "2 platform integrations",
        "1,000 messages/month",
        "Basic analytics",
        "Email support",
        "Community forum access",
      ],
      cta: "Get Started Free",
      popular: false,
      gradient: "from-gray-500 to-gray-600",
    },
    {
      name: "Professional",
      price: "$29",
      period: "per month",
      description: "Ideal for growing businesses",
      features: [
        "Up to 5 AI agents",
        "Unlimited platform integrations",
        "10,000 messages/month",
        "Advanced analytics",
        "Priority email support",
        "Custom knowledge base",
        "API access",
        "Webhook integrations",
      ],
      cta: "Start Free Trial",
      popular: true,
      gradient: "from- sky-500 to-sky-500",
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "For large organizations with advanced needs",
      features: [
        "Unlimited AI agents",
        "Unlimited platform integrations",
        "Unlimited messages",
        "Advanced analytics & reporting",
        "24/7 phone & email support",
        "Custom knowledge base",
        "Full API access",
        "Webhook integrations",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      popular: false,
      gradient: "from-green-500 to-emerald-500",
    },
  ];

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
                {t("pricing.title")}
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl">
                {t("pricing.subtitle")}
              </p>
            </div>
            <div className="relative w-full max-w-md mx-auto lg:ml-auto">
              <div className="relative w-full aspect-square">
                <Image
                  src="/yetti/yetting_holding_dollar_sign.png"
                  alt="yetti Pricing"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4">
              <span className="text-gray-600">{t("pricing.monthly")}</span>
              <div className="relative">
                <input type="checkbox" className="sr-only" />
                <div className="w-12 h-6 bg-gray-200 rounded-full shadow-inner"></div>
                <div className="absolute top-0 left-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform"></div>
              </div>
              <span className="text-gray-600">
                {t("pricing.annual")}{" "}
                <span className="text-green-600 font-semibold">({t("pricing.save20")})</span>
              </span>
            </div>
          </div>

        {/* Pricing Cards */}
        <div className="grid relative grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl flex flex-col bg-white p-8 shadow-lg border ${
                plan.popular
                  ? "border-2 border-sky-500 relative scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-sky-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    {t("pricing.mostPopular")}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t(`pricing.${plan.name.toLowerCase()}.name`)}
                </h3>
                <p className="text-gray-600 mb-4">{t(`pricing.${plan.name.toLowerCase()}.desc`)}</p>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">
                    {t(`pricing.${plan.name.toLowerCase()}.price`)}
                  </span>
                  <span className="text-gray-600 ml-2">{t(`pricing.${plan.name.toLowerCase()}.period`)}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check
                      className={`w-5 h-5 shrink-0 mr-3 mt-0.5 ${
                        plan.popular
                          ? "text-sky-500"
                          : plan.name === "Starter"
                          ? "text-green-500"
                          : "text-green-500"
                      }`}
                    />
                    <span className="text-gray-700">{t(`pricing.${plan.name.toLowerCase()}.features.${featureIndex}`)}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.name === "Enterprise" ? "/contact" : "/auth/signup"}
                className={`w-full block text-center py-3 px-6 rounded-xl font-semibold transition-all mt-auto ${
                  plan.popular
                    ? "bg-sky-500 hover:bg-sky-600 text-white"
                    : "border-2 border-gray-300 text-gray-700 hover:border-sky-500 hover:text-sky-500"
                }`}
              >
                {t(`pricing.${plan.name.toLowerCase()}.cta`)}
              </Link>
            </div>
          ))}
          </div>

          

          {/* CTA Section */}
          
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}
