"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { PLAN_CONFIGS } from "@/lib/paddle";
import type { Paddle } from "@paddle/paddle-js";
import {
  Check, Loader2, Zap, CreditCard, ExternalLink,
  Receipt, AlertCircle, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const STARTER_PRICE = 29;
const STARTER_FEATURES = [
  "Up to 3 AI bots",
  "2 channel integrations",
  "1,000 messages/month",
  "Email support",
  "1-month free trial",
];

type UserPlan = {
  plan_name: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
};

type Invoice = {
  id: string;
  date: number;
  amount: number;
  currency: string;
  status: string | null;
  pdf: string | null;
  description: string;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active:   { label: "Active",    cls: "bg-success/10 text-success"  },
    past_due: { label: "Past due",  cls: "bg-warning/10 text-warning"  },
    canceled: { label: "Cancelled", cls: "bg-error/10 text-error"      },
  };
  const cfg = map[status] ?? { label: status, cls: "bg-surface text-text-muted" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export default function PlansPage() {
  const { user } = useAuth();
  const paddleRef = useRef<Paddle | null>(null);

  const [plan, setPlan]                       = useState<UserPlan | null>(null);
  const [invoices, setInvoices]               = useState<Invoice[]>([]);
  const [planLoading, setPlanLoading]         = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [checkingOut, setCheckingOut]         = useState(false);
  const [portalLoading, setPortalLoading]     = useState(false);

  // Initialise Paddle JS (overlay checkout)
  useEffect(() => {
    import("@paddle/paddle-js").then(({ initializePaddle }) => {
      initializePaddle({
        environment: (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as "production" | "sandbox") ?? "production",
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
        eventCallback(event) {
          if (event.name === "checkout.completed") {
            setPlanLoading(true);
            fetchPlan();
          }
        },
      }).then((instance) => {
        if (instance) paddleRef.current = instance;
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPlan = useCallback(async () => {
    if (!user) return;
    setPlanLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch("/api/paddle/plan", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.ok) setPlan((await res.json()).plan ?? null);
    } catch { /* silently fail */ }
    finally { setPlanLoading(false); }
  }, [user]);

  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    setInvoicesLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch("/api/paddle/invoices", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.ok) setInvoices((await res.json()).invoices ?? []);
    } catch { /* silently fail */ }
    finally { setInvoicesLoading(false); }
  }, [user]);

  useEffect(() => {
    fetchPlan();
    fetchInvoices();
  }, [fetchPlan, fetchInvoices]);

  const handleSubscribe = () => {
    if (!user || !paddleRef.current) {
      toast.error("Checkout not ready — please refresh the page");
      return;
    }
    setCheckingOut(true);
    try {
      paddleRef.current.Checkout.open({
        items: [{ priceId: PLAN_CONFIGS.starter.priceId, quantity: 1 }],
        customer: { email: user.email ?? "" },
        customData: { userId: user.id },
        settings: {
          successUrl: `${window.location.origin}/billing/success`,
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  };

  const handleManageBilling = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/paddle/portal", {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
      });
      const { url, error } = await res.json();
      if (error || !url) throw new Error(error ?? "Failed to open billing portal");
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const isActive = plan?.status === "active";

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Billing & Plan</h1>
        <p className="text-text-muted mt-1 text-sm">
          Manage your Starter subscription and view payment history.
        </p>
      </div>

      {/* Plan card */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-brand" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text-primary">Starter Plan</h2>
                {!planLoading && plan && <StatusBadge status={plan.status} />}
              </div>
              <p className="text-text-muted text-sm mt-0.5">
                <span className="text-2xl font-bold text-text-primary">${STARTER_PRICE}</span>
                <span className="text-sm">/month</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {planLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
            ) : isActive ? (
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-background transition-all cursor-pointer disabled:opacity-50"
              >
                {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Manage Billing
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={checkingOut}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-sm font-semibold shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:transform-none"
              >
                {checkingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Subscribe — ${STARTER_PRICE}/mo
              </button>
            )}
          </div>
        </div>

        {plan?.current_period_end && (
          <p className="mt-4 text-xs text-text-muted flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-success" />
            {isActive
              ? `Renews on ${new Date(plan.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
              : `Expires on ${new Date(plan.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
          </p>
        )}

        <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
          {STARTER_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
              <Check className="w-3.5 h-3.5 text-success shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {!planLoading && !plan && (
        <div className="flex items-start gap-3 bg-warning/5 border border-warning/20 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-text-primary">No active subscription</p>
            <p className="text-xs text-text-muted mt-0.5">
              Subscribe to keep your bots running after the free trial ends.
            </p>
          </div>
        </div>
      )}

      {/* Invoice history */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Receipt className="w-4 h-4 text-text-muted" />
            Payment History
          </h2>
          <button
            onClick={fetchInvoices}
            disabled={invoicesLoading}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${invoicesLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {invoicesLoading ? (
            <div className="flex items-center justify-center h-28">
              <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 gap-2">
              <Receipt className="w-7 h-7 text-border" />
              <p className="text-sm text-text-muted">No payments yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    {["Date", "Description", "Amount", "Status", "Receipt"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-4 py-3 text-text-secondary">
                        {new Date(inv.date * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-text-primary font-medium">{inv.description}</td>
                      <td className="px-4 py-3 text-text-primary font-semibold">
                        ${(inv.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          inv.status === "paid" ? "bg-success/10 text-success"
                          : inv.status === "open" ? "bg-warning/10 text-warning"
                          : "bg-error/10 text-error"
                        }`}>
                          {inv.status === "paid" ? "Paid" : inv.status === "open" ? "Pending" : "Failed"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {inv.pdf ? (
                          <a href={inv.pdf} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-brand hover:text-brand-dark transition-colors">
                            PDF <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
