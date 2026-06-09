# Billing & Plans Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use godmode:task-runner to implement this plan task-by-task.

**Goal:** Simplify Stripe to a single Starter plan, build a clean Billing & Plan dashboard page showing current plan status + full invoice history pulled live from Stripe, and fix the hardcoded webhook secret.

**Architecture:** Three new API routes (plan, invoices, portal) feed a single redesigned plans page. The `lib/stripe.ts` config is stripped to Starter-only. The webhook handler gets the hardcoded fallback removed. No credits system touches anything.

**Tech Stack:** Next.js 14 App Router, Stripe Node SDK v16, Supabase (supabase-admin), TypeScript, Tailwind CSS

---

### Task 1: Simplify lib/stripe.ts to Starter-only

**Files:**
- Modify: `lib/stripe.ts`

**Step 1: Replace the file contents**

```ts
import { loadStripe } from "@stripe/stripe-js";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

import type { Stripe as StripeJS } from "@stripe/stripe-js";
let stripePromise: Promise<StripeJS | null> | null = null;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export type PlanConfig = {
  name:    string;
  priceId: string;
  price:   number;
};

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  starter: {
    name:    "Starter",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER!,
    price:   29,
  },
} as const;
```

**Step 2: Commit**
```bash
git add lib/stripe.ts
git commit -m "refactor: simplify Stripe config to Starter plan only"
```

---

### Task 2: Remove hardcoded webhook secret fallback

**Files:**
- Modify: `app/api/stripe/webhook/route.ts` (lines 29-31)

**Step 1: Replace fallback line**

Change:
```ts
const webhookSecret =
  process.env.STRIPE_WEBHOOK_SECRET ||
  "whsec_0FJxMd7eFuSAbBIOQeOjC9Igrms5ATBO";
```

To:
```ts
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) {
  console.error("STRIPE_WEBHOOK_SECRET is not set");
  return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
}
```

Also remove the now-redundant inner `if (!webhookSecret)` check below it.

**Step 2: Commit**
```bash
git add app/api/stripe/webhook/route.ts
git commit -m "fix: remove hardcoded webhook secret fallback"
```

---

### Task 3: Add GET /api/stripe/plan route

Returns the authenticated user's current plan from Supabase + live status from Stripe.

**Files:**
- Create: `app/api/stripe/plan/route.ts`

**Step 1: Create the file**

```ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: plan } = await supabaseAdmin
      .from("user_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!plan) {
      return NextResponse.json({ plan: null });
    }

    return NextResponse.json({ plan });
  } catch (err) {
    console.error("GET /api/stripe/plan error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Commit**
```bash
git add app/api/stripe/plan/route.ts
git commit -m "feat: add GET /api/stripe/plan route"
```

---

### Task 4: Add GET /api/stripe/invoices route

Fetches up to 24 invoices from Stripe for the authenticated user.

**Files:**
- Create: `app/api/stripe/invoices/route.ts`

**Step 1: Create the file**

```ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: plan } = await supabaseAdmin
      .from("user_plans")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!plan?.stripe_customer_id) {
      return NextResponse.json({ invoices: [] });
    }

    const stripeInvoices = await stripe.invoices.list({
      customer: plan.stripe_customer_id,
      limit: 24,
    });

    const invoices = stripeInvoices.data.map((inv) => ({
      id:          inv.id,
      date:        inv.created,
      amount:      inv.amount_paid,
      currency:    inv.currency,
      status:      inv.status,
      pdf:         inv.invoice_pdf,
      description: inv.lines.data[0]?.description ?? "Starter Plan",
    }));

    return NextResponse.json({ invoices });
  } catch (err) {
    console.error("GET /api/stripe/invoices error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Commit**
```bash
git add app/api/stripe/invoices/route.ts
git commit -m "feat: add GET /api/stripe/invoices route"
```

---

### Task 5: Add POST /api/stripe/portal route

Creates a Stripe Billing Portal session so users can manage payment method, cancel, view receipts.

**Files:**
- Create: `app/api/stripe/portal/route.ts`

**Step 1: Create the file**

```ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: plan } = await supabaseAdmin
      .from("user_plans")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!plan?.stripe_customer_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/plans`;

    const session = await stripe.billingPortal.sessions.create({
      customer: plan.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("POST /api/stripe/portal error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Commit**
```bash
git add app/api/stripe/portal/route.ts
git commit -m "feat: add POST /api/stripe/portal route"
```

---

### Task 6: Rewrite app/dashboard/plans/page.tsx

Single-plan billing page with: plan status card + subscribe/manage buttons + invoice history table.

**Files:**
- Modify: `app/dashboard/plans/page.tsx`

**Step 1: Full rewrite**

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { getStripe } from "@/lib/stripe";
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
    active:   { label: "Active",    cls: "bg-success/10 text-success"   },
    past_due: { label: "Past due",  cls: "bg-warning/10 text-warning"   },
    canceled: { label: "Cancelled", cls: "bg-error/10 text-error"       },
  };
  const cfg = map[status] ?? { label: status, cls: "bg-surface text-text-muted" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

export default function PlansPage() {
  const { user } = useAuth();
  const [plan, setPlan]           = useState<UserPlan | null>(null);
  const [invoices, setInvoices]   = useState<Invoice[]>([]);
  const [planLoading, setPlanLoading]       = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [checkingOut, setCheckingOut]       = useState(false);
  const [portalLoading, setPortalLoading]   = useState(false);

  const authHeader = useCallback(() => {
    // @ts-expect-error – accessing Supabase session from auth context
    const session = user?.__session ?? null;
    return session ? `Bearer ${session.access_token}` : null;
  }, [user]);

  const fetchPlan = useCallback(async () => {
    if (!user) return;
    setPlanLoading(true);
    try {
      // Get access token from Supabase auth
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch("/api/stripe/plan", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan ?? null);
      }
    } catch { /* silently fail */ }
    finally { setPlanLoading(false); }
  }, [user]);

  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    setInvoicesLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch("/api/stripe/invoices", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices ?? []);
      }
    } catch { /* silently fail */ }
    finally { setInvoicesLoading(false); }
  }, [user]);

  useEffect(() => {
    fetchPlan();
    fetchInvoices();
  }, [fetchPlan, fetchInvoices]);

  const handleSubscribe = async () => {
    if (!user) return;
    setCheckingOut(true);
    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId:   process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
          userId:    user.id,
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
      setCheckingOut(false);
    }
  };

  const handleManageBilling = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/stripe/portal", {
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Billing & Plan</h1>
        <p className="text-text-muted mt-1 text-sm">
          Manage your Starter subscription and view payment history.
        </p>
      </div>

      {/* Plan Card */}
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

        {/* Billing period */}
        {plan?.current_period_end && (
          <p className="mt-4 text-xs text-text-muted flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-success" />
            {isActive
              ? `Renews on ${new Date(plan.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
              : `Expires on ${new Date(plan.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
          </p>
        )}

        {/* Features */}
        <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
          {STARTER_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
              <Check className="w-3.5 h-3.5 text-success shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* No subscription notice */}
      {!planLoading && !plan && (
        <div className="flex items-start gap-3 bg-warning/5 border border-warning/20 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-text-primary">No active subscription</p>
            <p className="text-xs text-text-muted mt-0.5">
              You are on a free trial. Subscribe to keep your bots running after the trial ends.
            </p>
          </div>
        </div>
      )}

      {/* Invoice History */}
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
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-4 py-3 text-text-secondary">
                        {new Date(inv.date * 1000).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-text-primary font-medium">{inv.description}</td>
                      <td className="px-4 py-3 text-text-primary font-semibold">
                        ${(inv.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          inv.status === "paid"
                            ? "bg-success/10 text-success"
                            : inv.status === "open"
                            ? "bg-warning/10 text-warning"
                            : "bg-error/10 text-error"
                        }`}>
                          {inv.status === "paid" ? "Paid" : inv.status === "open" ? "Pending" : "Failed"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {inv.pdf ? (
                          <a
                            href={inv.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-brand hover:text-brand-dark transition-colors"
                          >
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
```

**Step 2: Commit**
```bash
git add app/dashboard/plans/page.tsx
git commit -m "feat: rewrite plans page — single Starter plan card + invoice history"
```

---

### Task 7: Environment variable — add NEXT_PUBLIC_STRIPE_PRICE_STARTER to .env.local

**Files:**
- Modify: `.env.local`

**Step 1:** Add these lines (get values from Stripe Console after creating the Starter product):
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Note:** `.env.local` is git-ignored — do not commit it.

---

### Stripe Console Actions (do these manually)

1. **Products → Add product:** Name: "Starter", Price: $29.00, Billing: Monthly recurring → copy the `price_xxx` ID
2. **Developers → Webhooks → Add endpoint:** URL: `https://your-domain.com/api/stripe/webhook`, Events: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted` → copy the `whsec_xxx` signing secret
3. **Settings → Billing → Customer portal:** Enable it (required for "Manage Billing" button)
