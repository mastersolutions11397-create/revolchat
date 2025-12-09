"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { getStripe, PLAN_CONFIGS } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import {
  CreditCard,
  TrendingUp,
  Download,
  Plus,
  Calendar,
  DollarSign,
  FileText,
  ArrowUpRight,
  Wallet,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  created_at: string;
  transaction_type?: "credit" | "debit";
  type?: "credit" | "debit"; // Backend uses 'type' instead of 'transaction_type'
  description?: string;
  credits?: number;
  amount?: number; // Backend uses 'amount' instead of 'credits'
  balance?: number;
  workspace_id: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  download_url?: string;
  number?: string;
}

interface UserPlan {
  id: string;
  user_id: string;
  workspace_id: string;
  plan_name: string;
  stripe_subscription_id?: string;
  current_period_end?: string;
  created_at: string;
}

const GLOBAL_WORKSPACE_ID = "00000000-0000-0000-0000-000000000000";

export default function BillingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState({
    globalCredits: 0,
    totalUsedAllWorkspaces: 0,
    creditTransactionsCount: 0,
    currentPlan: "Free",
    nextBillingDate: null as string | null,
  });
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [creditTransactions, setCreditTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function loadBillingData() {

      if (!user?.id) {
        console.log('No user ID, returning early');
        return;
      }

      try {
        setLoading(true);

        // Fetch credit transactions directly from Supabase
        console.log('\n--- Fetching Credit Transactions (Supabase) ---');
        const { data: creditRows, error: creditError } = await supabase
          .from("user_credits")
          .select("*")
          .eq("user_id", user.id)
          .eq("transaction_type", "credit")
          .order("created_at", { ascending: false });

        if (creditError) throw new Error(creditError.message);

        const normalizedCreditTransactions = (creditRows || []).map((t: Transaction) => ({
          ...t,
          transaction_type: t.transaction_type || t.type,
          credits: t.credits ?? 0,
          balance: t.balance ?? 0,
        }));

        console.log('Credit transactions count:', normalizedCreditTransactions.length);
        console.log('Credit transactions:', JSON.stringify(normalizedCreditTransactions, null, 2));

        // Fetch debit transactions to calculate total used across all workspaces
        console.log('\n--- Fetching Debit Totals (Supabase) ---');
        const { data: debitRows, error: debitError } = await supabase
          .from("user_credits")
          .select("credits, transaction_type")
          .eq("user_id", user.id)
          .eq("transaction_type", "debit");

        if (debitError) throw new Error(debitError.message);

        const totalDebits = (debitRows || []).reduce(
          (sum: number, t: { credits?: number | null }) =>
            sum + (t.credits ?? 0),
          0
        );
        console.log('Total debits calculated:', totalDebits);

        // Get current credits balance from most recent transaction
        console.log('\n--- Fetching Current Credits Balance (Supabase) ---');
        const { data: latestTransaction, error: balanceError } = await supabase
          .from("user_credits")
          .select("balance")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (balanceError && balanceError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" which is fine for new users
          throw new Error(balanceError.message);
        }

        const globalCredits = latestTransaction?.balance ?? 0;
        console.log('Current credits balance:', globalCredits);

        // Fetch user plan from Supabase
        console.log('\n--- Fetching User Plan (Supabase) ---');
        const workspaceForPlan = currentWorkspace?.id || GLOBAL_WORKSPACE_ID;
        const { data: planRows, error: planError } = await supabase
          .from("user_plans")
          .select("id, user_id, workspace_id, plan_name, stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end, created_at, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (planError) throw new Error(planError.message);

        const currentPlan = planRows || null;
        console.log('Current Plan:', currentPlan);

        // Update billing data
        const billingUpdate = {
          globalCredits: globalCredits,
          totalUsedAllWorkspaces: totalDebits,
          creditTransactionsCount: normalizedCreditTransactions.length,
          currentPlan: currentPlan?.plan_name || "Free",
          nextBillingDate: currentPlan?.current_period_end || null,
        };
        console.log('\n--- Final Billing Data ---');
        console.log('Billing Data:', JSON.stringify(billingUpdate, null, 2));
        setBillingData(billingUpdate);

        setUserPlan(currentPlan);
        setCreditTransactions(normalizedCreditTransactions);
        
        console.log('=== BILLING PAGE: Data Loading Complete ===\n');

      } catch (error) {
        console.error('=== BILLING PAGE: ERROR ===');
        console.error('Error details:', error);
        console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('Error stack:', error instanceof Error ? error.stack : undefined);
        toast.error('Failed to load billing data');
      } finally {
        setLoading(false);
      }
    }

    loadBillingData();
  }, [user?.id, currentWorkspace?.id]);

  const handlePurchaseCredits = async () => {
    if (!user?.email) {
      toast.error('Please log in to purchase credits');
      return;
    }

    try {
      setCheckoutLoading(true);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: PLAN_CONFIGS.yetti_credits.priceId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw stripeError;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleUpgradePlan = () => {
    router.push('/dashboard/plans');
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20">
            <CreditCard className="h-8 w-8 text-sky-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Billing</h1>
            <p className="mt-2 text-lg text-sky-100/80 max-w-2xl">
              Manage your global credits, view transactions, and access invoices.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Global Credits */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-sky-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-500 group-hover:scale-110 transition-transform">
                <Wallet className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-medium">
                <ArrowUpRight className="h-3 w-3" />
                <span>Global</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">Global Credits</p>
            <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">
              {billingData.globalCredits.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-4">Available across all workspaces</p>
          </div>
        </div>

        {/* Total Used (All Workspaces) */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-orange-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">Total Used</p>
            <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">
              {billingData.totalUsedAllWorkspaces.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-4">Across all workspaces</p>
          </div>
        </div>

        {/* Next Billing */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-sky-500 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6" />
              </div>
              <FileText className="h-5 w-5 text-blue-400 opacity-50" />
            </div>
            <p className="text-sm font-medium text-slate-500">Next Billing Date</p>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-3xl font-bold text-slate-900 tracking-tight">
                {billingData.nextBillingDate 
                  ? new Date(billingData.nextBillingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "N/A"
                }
              </p>
            </div>
            <p className="text-sm font-medium mt-6 text-slate-400">
              {billingData.nextBillingDate 
                ? new Date(billingData.nextBillingDate).getFullYear()
                : ""
              }
            </p>
          </div>
        </div>

        {/* Current Plan */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-purple-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                <DollarSign className="h-6 w-6" />
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-700 rounded-lg border border-purple-100">
                Active
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500">Current Plan</p>
            <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">
              {billingData.currentPlan}
            </p>
            
          </div>
        </div>
      </div>

      {/* Credit Transactions Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Credit Transactions</h2>
              <p className="text-sm text-slate-500 mt-1">
                Global credit purchases and additions
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-8 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Credits Added
                </th>
                <th className="px-8 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Balance After
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {creditTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Wallet className="h-8 w-8 text-slate-300" />
                      <p className="text-slate-500 text-sm">No credit transactions yet</p>
                      <p className="text-slate-400 text-xs">Purchase credits to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                creditTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                    className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-600">
                      {new Date(transaction.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                  </td>
                    <td className="px-8 py-5 text-sm text-slate-900 font-medium">
                      {transaction.description || 'Credit purchase'}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-bold text-emerald-600">
                      <span className="inline-flex items-center gap-1">
                        <Plus className="h-3 w-3" />
                        {(transaction.credits ?? transaction.amount ?? 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-semibold text-slate-700">
                      {(transaction.balance ?? 0).toLocaleString()}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {creditTransactions.length > 0 && (
        <div className="border-t border-slate-100 px-8 py-5 text-center bg-slate-50/30">
          <button className="text-sm font-semibold text-sky-500 hover:text-sky-700 transition-colors hover:underline">
            Load More Transactions
          </button>
        </div>
        )}
      </div>

      {/* Invoices Section
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Invoices</h2>
              <p className="text-sm text-slate-500 mt-1">
                Download and view your billing invoices
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {invoices.length === 0 ? (
            <div className="px-8 py-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8 text-slate-300" />
                <p className="text-slate-500 text-sm">No invoices available</p>
              </div>
            </div>
          ) : (
            invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors group"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm group-hover:text-sky-500 transition-all">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                      {invoice.number || invoice.id}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(invoice.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    ${invoice.amount.toFixed(2)}
                  </p>
                  <span
                    className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full mt-1 ${
                      invoice.status === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : invoice.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </div>
                  {invoice.download_url && (
                    <a
                      href={invoice.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
                    >
                  <Download className="h-4 w-4" />
                  Download
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div> */}

      {/* Quick Actions
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/50 to-blue-50/50 p-8 transition-all hover:shadow-lg hover:border-sky-200">
          <div className="flex items-start justify-between mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-sky-500">
              <Plus className="h-7 w-7" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Purchase Additional Credits
          </h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Running low? Top up your global credits instantly to keep your AI agents running smoothly across all workspaces.
          </p>
          <button
            onClick={handlePurchaseCredits}
            disabled={checkoutLoading}
            className="w-full px-6 py-3.5 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {checkoutLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Buy Credits'
            )}
          </button>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/50 to-fuchsia-50/50 p-8 transition-all hover:shadow-lg hover:border-purple-200">
          <div className="flex items-start justify-between mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-purple-600">
              <TrendingUp className="h-7 w-7" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Upgrade Your Plan
          </h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Unlock advanced features, higher limits, and priority support with our premium plans.
          </p>
          <button
            onClick={handleUpgradePlan}
            className="w-full px-6 py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-[0.98]"
          >
            View Plans
          </button>
        </div>
      </div> */}
    </div>
  );
}
