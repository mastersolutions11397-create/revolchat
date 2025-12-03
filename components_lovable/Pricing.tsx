"use client";

import { Check, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { getStripe, PLAN_CONFIGS } from "@/lib/stripe";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { StripeError } from "@stripe/stripe-js";

console.log('Pricing Component: Module loaded');

function PricingContent() {
  const pricingTiers = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Best for individuals just getting started.",
    features: [
      "1,000 Yetti Tokens",
      "1 workspace",
      "1 AI agent",
      "Connect 1 social account",
      "Basic analytics",
      "Email support",
    ],
    cta: "Start Now",
    popular: false,
    planKey: "starter",
  },
  {
    name: "Growth",
    price: "$59",
    period: "/month",
    description: "Best for growing businesses and creators.",
    features: [
      "2,500 Yetti Tokens",
      "3 workspaces",
      "Up to 3 AI agents",
      "Connect 3 social accounts",
      "Team seats (2 users)",
      "Advanced analytics",
      "Priority chat support",
    ],
    cta: "Start Now",
    popular: false,
    planKey: "growth",
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    description: "Best for serious businesses scaling up.",
    features: [
      "5,000 Yetti Tokens",
      "5 workspaces",
      "5 AI agents",
      "Connect 5 social accounts",
      "Team seats (3 users)",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Start Now",
    popular: true,
    planKey: "pro",
  },
  {
    name: "Enterprise",
    price: "$179",
    period: "/month",
    description: "Best for large teams and enterprises.",
    features: [
      "10,000 Yetti Tokens",
      "Unlimited workspaces",
      "Unlimited AI agents",
      "Connect all socials",
      "Unlimited Team seats",
      "Custom integrations",
      "Dedicated support",
    ],
    cta: "Start Now",
    popular: false,
    planKey: "enterprise",
  },
];

  console.log('Pricing Component: Component initialized');

  const searchParams = useSearchParams();
  const urlWorkspaceId = searchParams.get('ws');
  console.log('Pricing Component: URL workspace ID:', urlWorkspaceId);

  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  console.log('Pricing Component: Auth state - user:', user, 'workspace:', currentWorkspace);

  const [isAnnual, setIsAnnual] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  console.log('Pricing Component: Initial isAnnual state:', isAnnual, 'checkout loading:', checkoutLoading);

  console.log('Pricing Component: Pricing tiers defined, count:', pricingTiers.length);

  const handlePlanSelect = async (planKey: string) => {
    const effectiveWorkspaceId = urlWorkspaceId || currentWorkspace?.id;
    console.log('Pricing Component: handlePlanSelect called with planKey:', planKey);
    console.log('Pricing Component: User email:', user?.email, 'Effective Workspace ID:', effectiveWorkspaceId, 'URL Workspace ID:', urlWorkspaceId, 'Current Workspace ID:', currentWorkspace?.id);

    if (!user?.email) {
      console.log('Pricing Component: User not authenticated, redirecting to signup');
      window.location.href = `/auth/signup?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    if (!effectiveWorkspaceId) {
      console.log('Pricing Component: No workspace ID available, showing error toast');
      toast.error('Please select a workspace first');
      return;
    }

    const planConfig = PLAN_CONFIGS[planKey as keyof typeof PLAN_CONFIGS];
    console.log('Pricing Component: Plan config for', planKey, ':', planConfig);
    if (!planConfig) {
      console.log('Pricing Component: Invalid plan selected:', planKey);
      toast.error('Invalid plan selected');
      return;
    }

    try {
      console.log('Pricing Component: Setting checkout loading to:', planKey);
      setCheckoutLoading(planKey);

      console.log('Pricing Component: Creating checkout session with data:', {
        priceId: planConfig.priceId,
        userId: user.id,
        userEmail: user.email,
      });

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: planConfig.priceId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      console.log('Pricing Component: Checkout session API response status:', response.status);
      const { sessionId, error } = await response.json();
      console.log('Pricing Component: Checkout session response data:', { sessionId, error });

      if (error) {
        console.log('Pricing Component: Error in checkout session response:', error);
        throw new Error(error);
      }

      console.log('Pricing Component: Getting Stripe instance');
      const stripe = await getStripe();
      console.log('Pricing Component: Redirecting to Stripe checkout with sessionId:', sessionId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (await stripe?.redirectToCheckout({
        sessionId,
      })) as { error: StripeError } | undefined;
      const stripeError = result?.error;

      if (stripeError) {
        console.log('Pricing Component: Stripe redirect error:', stripeError);
        throw stripeError;
      }

      console.log('Pricing Component: Checkout process completed successfully');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Pricing Component: Checkout error:', error);
      console.log('Pricing Component: Checkout error details:', {
        message: error.message || 'Unknown error',
        stack: error.stack,
        planKey: planKey,
        userId: user?.id,
        workspaceId: effectiveWorkspaceId
      });
      toast.error('Failed to start checkout process');
    } finally {
      console.log('Pricing Component: Setting checkout loading to null');
      setCheckoutLoading(null);
    }
  };

  return (
    <section className="py-32 bg-slate-50 relative" id="pricing">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-secondary/50 to-transparent -z-10"></div>

      <div className="container px-4 mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-black font-lato text-foreground mb-4">
              Simple, Transparent <span className="text-sky-500">Pricing</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free with 100 tokens, then choose the plan that fits your business.
            </p>
          </motion.div>

      
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {pricingTiers.map((tier, index) => {
            console.log(`Pricing Component: Rendering pricing tier ${index + 1}/${pricingTiers.length}:`, tier.name, 'popular:', tier.popular, 'features count:', tier.features.length);
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
                className={`relative p-8 h-full flex flex-col ${
                  tier.popular
                    ? "border-2 border-sky-500 shadow-2xl scale-105 z-10 bg-background"
                    : "border border-gray-200/50 bg-card/50 hover:border-sky-500/30 hover:shadow-lg"
                } transition-all duration-300 rounded-2xl`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-sky-500 text-white rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                )}

                <div className="space-y-6 flex-1">
                  {/* Header */}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">
                      {tier.name}
                    </h3>
                    <p className="text-sm text-muted-foreground min-h-[40px]">{tier.description}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-muted-foreground text-sm">{tier.period}</span>
                    )}
                  </div>

                  {/* CTA Button */}
                  {tier.name === "Enterprise" ? (
                    <Button
                      onClick={() => {
                        console.log('Pricing Component: Enterprise contact button clicked');
                        window.location.href = '/contact';
                      }}
                      className={`w-full h-12 rounded-xl font-semibold ${
                        tier.popular
                          ? "bg-sky-500 hover:bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                      }`}
                    >
                      {tier.cta}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        console.log('Pricing Component: Plan button clicked for tier:', tier.name, 'planKey:', tier.planKey);
                        if (tier.planKey) {
                          handlePlanSelect(tier.planKey);
                        }
                      }}
                      disabled={checkoutLoading === tier.planKey}
                      className={`w-full h-12 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                        tier.popular
                          ? "bg-sky-500 hover:bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                      }`}
                    >
                      {checkoutLoading === tier.planKey ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        tier.cta
                      )}
                    </Button>
                  )}

                  {/* Features */}
                  <div className="space-y-4 pt-6 border-t border-gray-200/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      What&apos;s included
                    </p>
                    <ul className="space-y-3">
                      {tier.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-start gap-3 text-sm"
                        >
                          <div className="mt-0.5 w-5 h-5 rounded-full bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-sky-500" />
                          </div>
                          <span className="text-muted-foreground">{feature}</span>
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
          Prices in USD. Taxes may apply.
        </p>
      </div>
    </section>
  );

  console.log('Pricing Component: Component render completed');
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
