"use client";

import { Check, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { useLanguage } from "@/lib/contexts/LanguageContext";

function PricingContent() {
  const { t } = useLanguage();

  const pricingTiers = [
    {
      name: t("pricing.landing.tier.starter.name"),
      price: t("pricing.landing.tier.starter.price"),
      period: t("pricing.landing.tier.starter.period"),
      description: t("pricing.landing.tier.starter.desc"),
      features: [
        t("pricing.landing.features.starter.1"),
        t("pricing.landing.features.starter.2"),
        t("pricing.landing.features.starter.3"),
        t("pricing.landing.features.starter.4"),
        t("pricing.landing.features.starter.5"),
        t("pricing.landing.features.starter.6"),
        t("pricing.landing.features.starter.7"),
      ],
      cta: t("pricing.landing.startNow"),
      popular: false,
      planKey: "starter",
    },
    {
      name: t("pricing.landing.tier.growth.name"),
      price: t("pricing.landing.tier.growth.price"),
      period: t("pricing.landing.tier.growth.period"),
      description: t("pricing.landing.tier.growth.desc"),
      features: [
        t("pricing.landing.features.growth.1"),
        t("pricing.landing.features.growth.2"),
        t("pricing.landing.features.growth.3"),
        t("pricing.landing.features.growth.4"),
        t("pricing.landing.features.growth.5"),
        t("pricing.landing.features.growth.6"),
        t("pricing.landing.features.growth.7"),
        t("pricing.landing.features.growth.8"),
      ],
      cta: t("pricing.landing.startNow"),
      popular: false,
      planKey: "growth",
    },
    {
      name: t("pricing.landing.tier.pro.name"),
      price: t("pricing.landing.tier.pro.price"),
      period: t("pricing.landing.tier.pro.period"),
      description: t("pricing.landing.tier.pro.desc"),
      features: [
        t("pricing.landing.features.pro.1"),
        t("pricing.landing.features.pro.2"),
        t("pricing.landing.features.pro.3"),
        t("pricing.landing.features.pro.4"),
        t("pricing.landing.features.pro.5"),
        t("pricing.landing.features.pro.6"),
        t("pricing.landing.features.pro.7"),
      ],
      cta: t("pricing.landing.startNow"),
      popular: true,
      planKey: "pro",
    },
    {
      name: t("pricing.landing.tier.enterprise.name"),
      price: t("pricing.landing.tier.enterprise.price"),
      period: t("pricing.landing.tier.enterprise.period"),
      description: t("pricing.landing.tier.enterprise.desc"),
      features: [
        t("pricing.landing.features.enterprise.1"),
        t("pricing.landing.features.enterprise.2"),
        t("pricing.landing.features.enterprise.3"),
        t("pricing.landing.features.enterprise.4"),
        t("pricing.landing.features.enterprise.5"),
        t("pricing.landing.features.enterprise.6"),
        t("pricing.landing.features.enterprise.7"),
      ],
      cta: t("pricing.landing.startNow"),
      popular: false,
      planKey: "enterprise",
    },
  ];

  const handlePlanSelect = (planKey: string) => {
    if (planKey === "enterprise") {
      window.location.assign("/contact");
    } else {
      // Redirect to login page, which will then redirect to dashboard/plans after authentication
      window.location.assign(
        `/auth/login?redirect=${encodeURIComponent("/dashboard/plans")}`
      );
    }
  };

  return (
    <section
      className="py-10 md:py-20 lg:py-32 bg-slate-50 relative"
      id="pricing"
    >
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-secondary/50 to-transparent -z-10"></div>

      <div className="container px-4 mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12 md:mb-16 space-y-4 sm:space-y-6 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black font-lato text-foreground mb-3 sm:mb-4">
              {t("pricing.landing.title").split("Pricing")[0]} <span className="text-sky-500">{t("pricing.landing.titleHighlight")}</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              {t("pricing.landing.subtitle")}
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {pricingTiers.map((tier, index) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <Card
                  className={`relative p-4 sm:p-6 md:p-8 h-full flex flex-col ${
                    tier.popular
                      ? "border-2 border-sky-500 shadow-2xl sm:scale-105 z-10 bg-background"
                      : "border border-gray-200/50 bg-card/50 hover:border-sky-500/30 hover:shadow-lg"
                  } transition-all duration-300 rounded-xl sm:rounded-2xl`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-0.5 sm:py-1 bg-sky-500 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1 whitespace-nowrap">
                      <Sparkles className="w-3 h-3" />
                      {t("pricing.landing.mostPopular")}
                    </div>
                  )}

                  <div className="space-y-4 sm:space-y-6 flex-1">
                    {/* Header */}
                    <div className="space-y-1 sm:space-y-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                        {tier.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground min-h-[36px] sm:min-h-[40px]">
                        {tier.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-bold text-foreground">
                        {tier.price}
                      </span>
                      {tier.period && (
                        <span className="text-muted-foreground text-xs sm:text-sm">
                          {tier.period}
                        </span>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => {
                        if (tier.planKey) {
                          handlePlanSelect(tier.planKey);
                        }
                      }}
                      className={`w-full h-10 sm:h-12 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base ${
                        tier.popular
                          ? "bg-sky-500 hover:bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                      }`}
                    >
                      {tier.cta}
                    </Button>

                    {/* Features */}
                    <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-gray-200/50">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("pricing.landing.whatsIncluded")}
                      </p>
                      <ul className="space-y-2 sm:space-y-3">
                        {tier.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm"
                          >
                            <div className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-500" />
                            </div>
                            <span className="text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <p className="text-center text-muted-foreground mt-12 text-sm">
          {t("pricing.landing.pricesNote")}
        </p>
      </div>
    </section>
  );
}

function LoadingFallback() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading pricing...</p>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PricingContent />
    </Suspense>
  );
}

export default Pricing;
