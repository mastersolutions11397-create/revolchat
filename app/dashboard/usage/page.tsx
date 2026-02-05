"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";
import {
  Activity,
  TrendingDown,
  Download,
  Minus,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  created_at: string;
  transaction_type: "credit" | "debit";
  description?: string;
  credits: number;
  balance: number;
  workspace_id: string;
  user_id: string;
}

export default function UsagePage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const urlWorkspaceId = searchParams.get("ws");

  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState({
    workspaceCreditsUsed: 0,
    monthlyUsage: 0,
    dailyAverage: 0,
    totalTransactions: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "all">(
    "30d"
  );

  const effectiveWorkspaceId = urlWorkspaceId || currentWorkspace?.id;

  useEffect(() => {
    async function loadUsageData() {
      console.log("=== USAGE PAGE: Loading Data ===");
      console.log("User ID:", user?.id);
      console.log(
        "Current Workspace:",
        currentWorkspace?.id,
        currentWorkspace?.name
      );
      console.log("Effective Workspace ID:", effectiveWorkspaceId);
      console.log("Selected Period:", selectedPeriod);

      if (!user?.id || !effectiveWorkspaceId) {
        console.log("Missing user ID or workspace ID, returning early");
        return;
      }

      try {
        setLoading(true);

        // Fetch workspace-specific debit transactions directly from Supabase
        console.log(
          "\n--- Fetching Workspace Debit Transactions (Supabase) ---"
        );
        const { data: debitTransactions, error: transactionsError } =
          await supabase
            .from("user_credits")
            .select("*")
            .eq("user_id", user.id)
            .eq("workspace_id", effectiveWorkspaceId)
            .eq("transaction_type", "debit")
            .order("created_at", { ascending: false })
            .limit(100);

        if (transactionsError) {
          throw new Error(transactionsError.message);
        }

        const allDebitTransactions = (debitTransactions || []) as Transaction[];
        console.log("Debit transactions fetched:", allDebitTransactions.length);
        console.log(
          "Debit transactions:",
          JSON.stringify(allDebitTransactions, null, 2)
        );

        // Calculate usage metrics
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        console.log("\n--- Calculating Metrics ---");
        console.log(
          "Current Month:",
          currentMonth,
          "Current Year:",
          currentYear
        );

        // Filter by selected period
        let filteredTransactions = allDebitTransactions;
        if (selectedPeriod === "7d") {
          const sevenDaysAgo = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          console.log("Filtering for last 7 days, cutoff:", sevenDaysAgo);
          filteredTransactions = allDebitTransactions.filter(
            (t: Transaction) => new Date(t.created_at) >= sevenDaysAgo
          );
        } else if (selectedPeriod === "30d") {
          const thirtyDaysAgo = new Date(
            now.getTime() - 30 * 24 * 60 * 60 * 1000
          );
          console.log("Filtering for last 30 days, cutoff:", thirtyDaysAgo);
          filteredTransactions = allDebitTransactions.filter(
            (t: Transaction) => new Date(t.created_at) >= thirtyDaysAgo
          );
        }
        console.log(
          "Filtered transactions for period:",
          filteredTransactions.length
        );

        const totalUsed = allDebitTransactions.reduce(
          (sum: number, t: Transaction) =>
            sum + parseInt(String(t.credits ?? 0)),
          0
        );
        console.log("Total credits used (all time):", totalUsed);

        const monthlyUsage = allDebitTransactions
          .filter(
            (t: Transaction) =>
              new Date(t.created_at).getMonth() === currentMonth &&
              new Date(t.created_at).getFullYear() === currentYear
          )
          .reduce(
            (sum: number, t: Transaction) =>
              sum + parseInt(String(t.credits ?? 0)),
            0
          );
        console.log("Monthly usage (current month):", monthlyUsage);

        const daysInPeriod =
          selectedPeriod === "7d"
            ? 7
            : selectedPeriod === "30d"
              ? 30
              : Math.max(1, allDebitTransactions.length);
        const dailyAvg =
          filteredTransactions.length > 0 ? totalUsed / daysInPeriod : 0;
        console.log(
          "Days in period:",
          daysInPeriod,
          "Daily average:",
          dailyAvg
        );

        const usageUpdate = {
          workspaceCreditsUsed: totalUsed,
          monthlyUsage,
          dailyAverage: Math.round(dailyAvg),
          totalTransactions: allDebitTransactions.length,
        };
        console.log("\n--- Final Usage Data ---");
        console.log("Usage Data:", JSON.stringify(usageUpdate, null, 2));
        setUsageData(usageUpdate);

        console.log(
          "Setting filtered transactions:",
          filteredTransactions.length
        );
        setTransactions(filteredTransactions);

        console.log("=== USAGE PAGE: Data Loading Complete ===\n");
      } catch (error) {
        console.error("=== USAGE PAGE: ERROR ===");
        console.error("Error details:", error);
        console.error(
          "Error message:",
          error instanceof Error ? error.message : "Unknown error"
        );
        console.error(
          "Error stack:",
          error instanceof Error ? error.stack : undefined
        );
        toast.error(t("usage.loadError"));
      } finally {
        setLoading(false);
      }
    }

    loadUsageData();
  }, [user?.id, effectiveWorkspaceId, selectedPeriod]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-teal-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-fade-in-up px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-teal-primary via-[#0d6159] to-slate-800 p-6 sm:p-8 text-white shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-teal-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-teal-accent/20 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md shadow-inner ring-1 ring-white/20 flex-shrink-0">
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-teal-accent" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {t("usage.title")}
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-slate-300 max-w-2xl">
                {t("usage.subtitle", {
                  workspace: currentWorkspace?.name || "your workspace",
                })}
              </p>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20 flex-shrink-0">
            {(["7d", "30d", "all"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedPeriod === period
                    ? "bg-dashboard-card text-teal-primary shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {period === "7d"
                  ? t("usage.period7d")
                  : period === "30d"
                    ? t("usage.period30d")
                    : t("usage.periodAll")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Usage */}
        <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-dashboard-border bg-dashboard-card p-4 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-primary/5 rounded-full blur-2xl group-hover:bg-teal-primary/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-teal-primary/10 text-teal-primary">
                <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              {t("usage.totalUsage")}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {usageData.workspaceCreditsUsed.toLocaleString()}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2">
              {t("usage.totalUsageDesc")}
            </p>
          </div>
        </div>

        {/* Daily Average */}
        <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-dashboard-border bg-dashboard-card p-4 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-primary/5 rounded-full blur-2xl group-hover:bg-teal-primary/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-teal-primary/10 text-teal-primary">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              {t("usage.dailyAverage")}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {usageData.dailyAverage.toLocaleString()}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2">
              {t("usage.dailyAverageDesc")}
            </p>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-dashboard-border bg-dashboard-card p-4 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-primary/5 rounded-full blur-2xl group-hover:bg-teal-primary/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-teal-primary/10 text-teal-primary">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              {t("usage.transactions")}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {usageData.totalTransactions}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2">
              {t("usage.transactionsDesc")}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-xl sm:rounded-2xl border border-dashboard-border bg-dashboard-card shadow-sm overflow-hidden">
        <div className="border-b border-dashboard-border bg-dashboard-bg px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {t("usage.history")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t("usage.historyDesc")}
              </p>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-dashboard-card border border-dashboard-border rounded-lg sm:rounded-xl hover:bg-dashboard-bg hover:border-dashboard-border transition-all shadow-sm w-full sm:w-auto">
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              {t("usage.exportCsv")}
            </button>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden divide-y divide-dashboard-border">
          {transactions.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <Activity className="h-8 w-8 text-slate-300" />
                <p className="text-slate-500 text-sm">{t("usage.noHistory")}</p>
              </div>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 hover:bg-dashboard-bg/80 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-600 truncate">
                      {new Date(transaction.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(transaction.created_at).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-rose-600">
                      <Minus className="h-3 w-3" />
                      {(transaction.credits ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-900 mb-2">
                  {transaction.description || t("usage.creditUsage")}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{t("usage.balanceAfter")}</span>
                  <span className="font-semibold text-slate-700">
                    {(transaction.balance ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dashboard-bg border-b border-dashboard-border">
              <tr>
                <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t("usage.date")}
                </th>
                <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t("usage.description")}
                </th>
                <th className="px-6 lg:px-8 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t("usage.creditsUsed")}
                </th>
                <th className="px-6 lg:px-8 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t("usage.balanceAfterHeader")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashboard-border">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Activity className="h-8 w-8 text-slate-300" />
                      <p className="text-slate-500 text-sm">
                        {t("usage.noHistory")}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-dashboard-bg/80 transition-colors"
                  >
                    <td className="px-6 lg:px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-600">
                      {new Date(transaction.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </td>
                    <td className="px-6 lg:px-8 py-5 text-sm text-slate-900">
                      {transaction.description || "Credit usage"}
                    </td>
                    <td className="px-6 lg:px-8 py-5 whitespace-nowrap text-right text-sm font-bold text-rose-600">
                      <span className="inline-flex items-center gap-1">
                        <Minus className="h-3 w-3" />
                        {(transaction.credits ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 lg:px-8 py-5 whitespace-nowrap text-right text-sm font-semibold text-slate-700">
                      {(transaction.balance ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {transactions.length > 0 && (
          <div className="border-t border-dashboard-border px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-center bg-dashboard-bg/50">
            <button className="text-xs sm:text-sm font-semibold text-teal-primary hover:text-teal-accent transition-colors hover:underline">
              Load More Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
