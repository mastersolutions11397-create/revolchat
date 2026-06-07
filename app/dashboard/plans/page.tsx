"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getStripe, PLAN_CONFIGS } from "@/lib/stripe";
import { Check, Loader2, Zap, Shield, Star, Crown } from "lucide-react";
import { toast } from "sonner";

const PLAN_ICONS: Record<string, React.ElementType> = {
  starter: Zap,
  growth: Star,
  pro: Crown,
  enterprise: Shield,
};

type UserPlan = {
  plan_name: string;
  status: string;
  current_period_end: string | null;
};

export default function PlansPage() {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/yetti/me")
      .then((r) => r.json())
      .then((data) => setUserPlan(data.plan ?? null))
      .catch(() => null)
      .finally(() => setPlanLoading(false));
  }, [user]);

  const handleSubscribe = async (planKey: string) => {
    if (!user) return;
    const plan = PLAN_CONFIGS[planKey];
    if (!plan) return;

    setCheckingOut(planKey);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: user.id,
          userEmail: user.email,
        }),
      });
      const { sessionId, error } = await res.json();
      if (error || !sessionId) throw new Error(error ?? "Failed to start checkout");

      const stripe = await getStripe();
      await stripe?.redirectToCheckout({ sessionId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setCheckingOut(null);
    }
  };

  const plans = Object.entries(PLAN_CONFIGS).filter(([k]) => k !== "yetti_credits");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Plans</h1>
        <p className="text-text-muted mt-1 text-sm">
          Choose the plan that fits your usage.
        </p>
      </div>

      {!planLoading && userPlan && (
        <div className="bg-brand/10 border border-brand/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-brand shrink-0" />
          <span className="text-sm text-brand font-medium">
            Current plan:{" "}
            <strong>{userPlan.plan_name}</strong>
            {userPlan.current_period_end && (
              <span className="text-brand/70 font-normal">
                {" "}· renews {new Date(userPlan.current_period_end).toLocaleDateString()}
              </span>
            )}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map(([key, plan]) => {
          const Icon = PLAN_ICONS[key] ?? Zap;
          const isCurrent =
            userPlan?.plan_name.toLowerCase() === plan.name.toLowerCase();
          const isLoading = checkingOut === key;

          return (
            <div
              key={key}
              className={`relative bg-surface border rounded-2xl p-5 flex flex-col transition-shadow hover:shadow-card-md ${
                isCurrent ? "border-brand ring-2 ring-brand/20" : "border-border"
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-2.5 left-4 bg-brand text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Current
                </span>
              )}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand" aria-hidden="true" />
                </div>
                <span className="font-bold text-text-primary">{plan.name}</span>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-text-primary">
                  ${plan.price}
                </span>
                <span className="text-text-muted text-sm">/mo</span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check className="w-3.5 h-3.5 text-success shrink-0" />
                  {plan.credits.toLocaleString()} credits/month
                </li>
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check className="w-3.5 h-3.5 text-success shrink-0" />
                  All integrations
                </li>
                <li className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check className="w-3.5 h-3.5 text-success shrink-0" />
                  Priority support
                </li>
              </ul>

              <button
                onClick={() => !isCurrent && handleSubscribe(key)}
                disabled={isCurrent || isLoading}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-brand/10 text-brand cursor-default"
                    : "bg-brand hover:bg-brand-dark text-white shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading…
                  </span>
                ) : isCurrent ? (
                  "Active"
                ) : (
                  `Subscribe — $${plan.price}/mo`
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
