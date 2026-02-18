"use client";

/* ========== PLANS PAGE - COMMENTED OUT FOR NOW ==========
 * Restore by uncommenting the block below and removing the placeholder export.
 *
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
 * (workspace context removed)
import { useLanguage } from "@/lib/contexts/LanguageContext";
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
  ... (full component body - see git history or backup)
  return ( ... );
}
========== END COMMENTED PLANS PAGE ========== */

/**
 * Placeholder: Plans page is commented out for now.
 * Sidebar link has been removed in DashboardShell.tsx.
 */
export default function PlansPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-dashboard-border bg-dashboard-card p-8">
      <p className="text-slate-500">Plans — coming soon.</p>
    </div>
  );
}
