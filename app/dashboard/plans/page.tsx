"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { getStripe, PLAN_CONFIGS } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

import {
  Check,
  Sparkles,
  Zap,
  Shield,
  Star,
  Crown,
  Loader2,
  Crown as CrownIcon,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { StripeError } from "@stripe/stripe-js";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  tokens: string;
  features: PlanFeature[];
  icon: React.ElementType;
  color: string;
  popular: boolean;
  planKey: string;
  cta: string;
}

type UserPlan = {
  plan_name: string;
  current_period_end?: string | null;
  current_period_start?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function PlansPage() {
  console.log("PlansPage: Component initialized");

  const searchParams = useSearchParams();
  const urlWorkspaceId = searchParams.get("ws");
  console.log("PlansPage: URL workspace ID:", urlWorkspaceId);

  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  console.log(
    "PlansPage: Auth state - user:",
    user,
    "workspace:",
    currentWorkspace
  );

  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      name: "Free",
      price: "0",
      period: "",
      description: "Perfect for trying out Yetti",
      tokens: "100 Yetti Tokens",
      features: [
        { name: "100 Yetti Tokens", included: true },
        { name: "Basic AI capabilities", included: true },
        { name: "Community support", included: true },
        { name: "Standard response time", included: true },
        { name: "1 workspace", included: false },
        { name: "Multiple AI agents", included: false },
        { name: "Advanced analytics", included: false },
        { name: "Priority support", included: false },
      ],
      icon: Sparkles,
      color: "slate",
      popular: false,
      planKey: "free",
      cta: "Current Plan",
    },
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "For individuals and hobbyists",
      tokens: `${PLAN_CONFIGS.starter.credits.toLocaleString()} Yetti Tokens`,
      features: [
        {
          name: `${PLAN_CONFIGS.starter.credits.toLocaleString()} Yetti Tokens`,
          included: true,
        },
        { name: "Standard AI models", included: true },
        { name: "Email support", included: true },
        { name: "API access", included: true },
        { name: "1 workspace", included: true },
        { name: "1 AI agent", included: true },
        { name: "Basic analytics", included: true },
        { name: "Priority support", included: false },
      ],
      icon: Zap,
      color: "sky",
      popular: false,
      planKey: "starter",
      cta: "Subscribe Now",
    },
    {
      name: "Growth",
      price: "$59",
      period: "/month",
      description: "For growing projects",
      tokens: `${PLAN_CONFIGS.growth.credits.toLocaleString()} Yetti Tokens`,
      features: [
        {
          name: `${PLAN_CONFIGS.growth.credits.toLocaleString()} Yetti Tokens`,
          included: true,
        },
        { name: "Faster processing", included: true },
        { name: "Priority email support", included: true },
        { name: "Advanced analytics", included: true },
        { name: "3 workspaces", included: true },
        { name: "Up to 3 AI agents", included: true },
        { name: "Team seats (2 users)", included: true },
        { name: "Custom integrations", included: false },
      ],
      icon: Shield,
      color: "blue",
      popular: false,
      planKey: "growth",
      cta: "Subscribe Now",
    },
    {
      name: "Pro",
      price: "$99",
      period: "/month",
      description: "For professional developers",
      tokens: `${PLAN_CONFIGS.pro.credits.toLocaleString()} Yetti Tokens`,
      features: [
        {
          name: `${PLAN_CONFIGS.pro.credits.toLocaleString()} Yetti Tokens`,
          included: true,
        },
        { name: "Priority processing", included: true },
        { name: "24/7 support", included: true },
        { name: "Custom integrations", included: true },
        { name: "5 workspaces", included: true },
        { name: "5 AI agents", included: true },
        { name: "Team seats (3 users)", included: true },
        { name: "Dedicated account manager", included: false },
      ],
      icon: Star,
      color: "indigo",
      popular: false,
      planKey: "pro",
      cta: "Go Pro",
    },
    {
      name: "Enterprise",
      price: "$179",
      period: "/month",
      description: "For large scale applications",
      tokens: `${PLAN_CONFIGS.enterprise.credits.toLocaleString()} Yetti Tokens`,
      features: [
        {
          name: `${PLAN_CONFIGS.enterprise.credits.toLocaleString()} Yetti Tokens`,
          included: true,
        },
        { name: "Dedicated infrastructure", included: true },
        { name: "SLA guarantee", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "Unlimited workspaces", included: true },
        { name: "Unlimited AI agents", included: true },
        { name: "Connect all socials", included: true },
        { name: "Unlimited Team seats", included: true },
      ],
      icon: Crown,
      color: "violet",
      popular: false,
      planKey: "enterprise",
      cta: "Subscribe Now",
    },
  ];

  console.log("PlansPage: Plans array defined, count:", plans.length);

  useEffect(() => {
    async function fetchCurrentPlan() {
      console.log("PlansPage: fetchCurrentPlan started");

      if (!user?.id) {
        console.log(
          "PlansPage: Missing user or workspace data, skipping plan fetch"
        );
        setLoading(false);
        return;
      }

      try {
        console.log("PlansPage: Fetching current plan data from Supabase");
        const { data: plans, error: planError } = await supabase
          .from("user_plans")
          .select(
            "plan_name, current_period_start, current_period_end, status, created_at, updated_at"
          )
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1);

        if (planError) {
          console.log(
            "PlansPage: Failed to fetch plan data:",
            planError.message
          );
          throw new Error(planError.message);
        }

        const userPlan = (
          plans && plans.length > 0 ? plans[0] : null
        ) as UserPlan | null;
        console.log("PlansPage: User plan:", userPlan);
        console.log("PlansPage: Setting current plan:", userPlan);
        setCurrentPlan(userPlan);
      } catch (error) {
        console.error("PlansPage: Failed to fetch current plan:", error);
        toast.error("Failed to load current plan");
      } finally {
        console.log("PlansPage: Setting loading to false");
        setLoading(false);
      }
    }

    fetchCurrentPlan();
  }, [user?.id, currentWorkspace?.id, urlWorkspaceId]);

  const handlePlanSelect = async (planKey: string) => {
    const effectiveWorkspaceId = urlWorkspaceId || currentWorkspace?.id;
    console.log("PlansPage: handlePlanSelect called with planKey:", planKey);
    console.log(
      "PlansPage: User email:",
      user?.email,
      "Effective Workspace ID:",
      effectiveWorkspaceId
    );

    if (!user?.email) {
      console.log("PlansPage: User not authenticated, redirecting to signup");
      window.location.href = `/auth/signup?redirect=${encodeURIComponent("/dashboard/plans")}`;
      return;
    }

    const planConfig = PLAN_CONFIGS[planKey as keyof typeof PLAN_CONFIGS];
    console.log("PlansPage: Plan config for", planKey, ":", planConfig);

    if (!planConfig) {
      console.log("PlansPage: Invalid plan selected:", planKey);
      toast.error("Invalid plan selected");
      return;
    }

    try {
      console.log("PlansPage: Setting checkout loading to:", planKey);
      setCheckoutLoading(planKey);

      console.log("PlansPage: Creating checkout session with data:", {
        priceId: planConfig.priceId,
        userId: user.id,
        userEmail: user.email,
      });

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: planConfig.priceId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      console.log(
        "PlansPage: Checkout session API response status:",
        response.status
      );
      const { sessionId, error } = await response.json();
      console.log("PlansPage: Checkout session response data:", {
        sessionId,
        error,
      });

      if (error) {
        console.log("PlansPage: Error in checkout session response:", error);
        throw new Error(error);
      }

      console.log("PlansPage: Getting Stripe instance");
      const stripe = await getStripe();
      console.log(
        "PlansPage: Redirecting to Stripe checkout with sessionId:",
        sessionId
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (await stripe?.redirectToCheckout({
        sessionId,
      })) as { error: StripeError } | undefined;
      const stripeError = result?.error;

      if (stripeError) {
        console.log("PlansPage: Stripe redirect error:", stripeError);
        throw stripeError;
      }

      console.log("PlansPage: Checkout process completed successfully");
    } catch (error: unknown) {
      const typedError = error as Error;
      console.error("PlansPage: Checkout error:", error);
      console.log("PlansPage: Checkout error details:", {
        message: typedError.message || "Unknown error",
        stack: typedError.stack,
        planKey: planKey,
        userId: user?.id,
        workspaceId: effectiveWorkspaceId,
      });
      toast.error("Failed to start checkout process");
    } finally {
      console.log("PlansPage: Setting checkout loading to null");
      setCheckoutLoading(null);
    }
  };

  const getCurrentPlanKey = () => {
    if (!currentPlan) return "free";
    return currentPlan.plan_name?.toLowerCase() || "free";
  };

  const isCurrentPlan = (planKey: string) => {
    return getCurrentPlanKey() === planKey.toLowerCase();
  };

  const getPlanHierarchy = () => {
    return ["free", "starter", "growth", "pro", "enterprise"];
  };

  const getButtonLabel = (planKey: string) => {
    if (isCurrentPlan(planKey)) {
      return "Current Plan";
    }

    const hierarchy = getPlanHierarchy();
    const currentPlanIndex = hierarchy.indexOf(getCurrentPlanKey());
    const targetPlanIndex = hierarchy.indexOf(planKey.toLowerCase());

    if (targetPlanIndex > currentPlanIndex) {
      return "Upgrade";
    } else if (targetPlanIndex < currentPlanIndex) {
      return "Downgrade";
    }

    return "Subscribe Now";
  };

  console.log(
    "PlansPage: Loading state:",
    loading,
    "Current plan:",
    currentPlan
  );

  if (loading) {
    console.log("PlansPage: Rendering loading spinner");
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  console.log("PlansPage: Rendering main component");

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20">
            <CrownIcon className="h-8 w-8 text-sky-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Subscription Plans
            </h1>
            <p className="mt-2 text-lg text-sky-100/80 max-w-2xl">
              Choose the perfect plan for your needs. Upgrade or downgrade
              anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Current Plan Banner - White Mode */}
      {currentPlan && (
        <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-sky-200 p-8 shadow-lg">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-sky-100/40 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 rounded-full bg-sky-100/40 blur-3xl"></div>

          <div className="relative z-10 flex items-center gap-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 border-2 border-sky-200">
              <CheckCircle className="h-7 w-7 text-sky-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  Current Plan
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                    currentPlan.status === "active"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : "bg-sky-100 text-sky-700 border-sky-300"
                  }`}
                >
                  {currentPlan.status === "active"
                    ? "Active"
                    : currentPlan.status || "Active"}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-1">
                {currentPlan.plan_name || "Free"}
              </h3>
              {currentPlan.current_period_end && (
                <p className="text-sm text-slate-600 mt-2">
                  Renews on{" "}
                  {new Date(currentPlan.current_period_end).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Plans Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans
            .filter((plan) => !isCurrentPlan(plan.planKey))
            .map((plan, index) => {
              const Icon = plan.icon;
              const isCurrent = isCurrentPlan(plan.planKey);
              console.log(
                `PlansPage: Rendering plan ${index + 1}/${plans.length}:`,
                plan.name,
                "isCurrent:",
                isCurrent
              );

              return (
                <div
                  key={index}
                  className={`relative flex flex-col rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-2 ${
                    plan.popular
                      ? "ring-2 ring-sky-500 scale-105 z-10 border-sky-500"
                      : isCurrent
                        ? "border-sky-500 ring-2 ring-sky-500 bg-sky-50/50"
                        : "border-slate-200 hover:border-sky-300"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-sky-500 text-white text-xs font-bold rounded-full shadow-sm">
                      Most Popular
                    </div>
                  )}

                  {isCurrent && !plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-sky-500 text-white text-xs font-bold rounded-full shadow-sm">
                      Current Plan
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
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-slate-500 ml-1">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {plan.tokens}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start text-sm"
                      >
                        <Check
                          className={`w-4 h-4 mr-2 shrink-0 mt-0.5 ${
                            feature.included
                              ? "text-green-500"
                              : "text-slate-300"
                          }`}
                        />
                        <span
                          className={
                            feature.included
                              ? "text-slate-900"
                              : "text-slate-400 line-through"
                          }
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full text-center py-3 px-6 rounded-xl font-semibold bg-sky-500 text-white cursor-not-allowed opacity-75"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        console.log(
                          "PlansPage: Plan button clicked for plan:",
                          plan.name,
                          "planKey:",
                          plan.planKey
                        );
                        if (plan.planKey) {
                          handlePlanSelect(plan.planKey);
                        }
                      }}
                      disabled={checkoutLoading === plan.planKey}
                      className={`w-full text-center py-3 px-6 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                        plan.popular
                          ? "bg-sky-500 hover:bg-sky-500 text-white shadow-sky-200"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      {checkoutLoading === plan.planKey ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        getButtonLabel(plan.planKey)
                      )}
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
