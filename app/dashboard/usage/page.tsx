"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
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
  transaction_type?: "credit" | "debit";
  type?: "credit" | "debit"; // Backend uses 'type' instead of 'transaction_type'
  description?: string;
  credits?: number;
  amount?: number; // Backend uses 'amount' instead of 'credits'
  balance?: number;
  workspace_id: string;
}


export default function UsagePage() {
  const searchParams = useSearchParams();
  const urlWorkspaceId = searchParams.get('ws');

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
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "all">("30d");

  const effectiveWorkspaceId = urlWorkspaceId || currentWorkspace?.id;

  useEffect(() => {
    async function loadUsageData() {
      console.log('=== USAGE PAGE: Loading Data ===');
      console.log('User ID:', user?.id);
      console.log('Current Workspace:', currentWorkspace?.id, currentWorkspace?.name);
      console.log('Effective Workspace ID:', effectiveWorkspaceId);
      console.log('Selected Period:', selectedPeriod);
      
      if (!user?.id || !effectiveWorkspaceId) {
        console.log('Missing user ID or workspace ID, returning early');
        return;
      }

      try {
        setLoading(true);

        // Fetch workspace-specific debit transactions
        console.log('\n--- Fetching Workspace Transactions ---');
        const transactionsUrl = `${process.env.NEXT_PUBLIC_API_URL}/v2/api/credits/transactions?user_id=${user.id}&workspace_id=${effectiveWorkspaceId}&limit=100&offset=0`;
        console.log('Transactions URL:', transactionsUrl);
        const transactionsResponse = await fetch(transactionsUrl);
        console.log('Transactions Response Status:', transactionsResponse.status);
        const transactionsData = await transactionsResponse.json();
        console.log('Transactions Data:', JSON.stringify(transactionsData, null, 2));
        if (!transactionsResponse.ok) throw new Error(transactionsData.error);

        // Filter only debit transactions (workspace-specific usage)
        const allTransactions = transactionsData.transactions || [];
        console.log('Total transactions fetched:', allTransactions.length);
        
        // Map transactions to normalize field names (backend uses 'type' and 'amount', frontend uses 'transaction_type' and 'credits')
        const normalizedTransactions = allTransactions.map((t: Transaction) => ({
          ...t,
          transaction_type: t.transaction_type || t.type,
          credits: t.credits ?? t.amount ?? 0,
          balance: t.balance ?? 0, // Backend doesn't return balance, so we'll show 0 for now
        }));
        
        const debitTransactions = normalizedTransactions.filter(
          (t: Transaction) => (t.transaction_type || t.type) === 'debit'
        );
        console.log('Debit transactions (filtered):', debitTransactions.length);
        console.log('Debit transactions:', JSON.stringify(debitTransactions, null, 2));

        // Calculate usage metrics
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        console.log('\n--- Calculating Metrics ---');
        console.log('Current Month:', currentMonth, 'Current Year:', currentYear);

        // Filter by selected period
        let filteredTransactions = debitTransactions;
        if (selectedPeriod === "7d") {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          console.log('Filtering for last 7 days, cutoff:', sevenDaysAgo);
          filteredTransactions = debitTransactions.filter(
            (t: Transaction) => new Date(t.created_at) >= sevenDaysAgo
          );
        } else if (selectedPeriod === "30d") {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          console.log('Filtering for last 30 days, cutoff:', thirtyDaysAgo);
          filteredTransactions = debitTransactions.filter(
            (t: Transaction) => new Date(t.created_at) >= thirtyDaysAgo
          );
        }
        console.log('Filtered transactions for period:', filteredTransactions.length);

        const totalUsed = debitTransactions.reduce((sum: number, t: Transaction) => sum + (t.credits ?? t.amount ?? 0), 0);
        console.log('Total credits used (all time):', totalUsed);
        
        const monthlyUsage = debitTransactions
          .filter((t: Transaction) =>
            new Date(t.created_at).getMonth() === currentMonth &&
            new Date(t.created_at).getFullYear() === currentYear
          )
          .reduce((sum: number, t: Transaction) => sum + (t.credits ?? t.amount ?? 0), 0);
        console.log('Monthly usage (current month):', monthlyUsage);

        const daysInPeriod = selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : Math.max(1, debitTransactions.length);
        const dailyAvg = filteredTransactions.length > 0 ? totalUsed / daysInPeriod : 0;
        console.log('Days in period:', daysInPeriod, 'Daily average:', dailyAvg);

        const usageUpdate = {
          workspaceCreditsUsed: totalUsed,
          monthlyUsage,
          dailyAverage: Math.round(dailyAvg),
          totalTransactions: debitTransactions.length,
        };
        console.log('\n--- Final Usage Data ---');
        console.log('Usage Data:', JSON.stringify(usageUpdate, null, 2));
        setUsageData(usageUpdate);

        console.log('Setting filtered transactions:', filteredTransactions.length);
        setTransactions(filteredTransactions);
        
        console.log('=== USAGE PAGE: Data Loading Complete ===\n');

      } catch (error) {
        console.error('=== USAGE PAGE: ERROR ===');
        console.error('Error details:', error);
        console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('Error stack:', error instanceof Error ? error.stack : undefined);
        toast.error('Failed to load usage data');
      } finally {
        setLoading(false);
      }
    }

    loadUsageData();
  }, [user?.id, effectiveWorkspaceId, selectedPeriod]);


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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-8 text-white shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner ring-1 ring-white/20">
              <Activity className="h-8 w-8 text-sky-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Workspace Usage</h1>
              <p className="mt-2 text-lg text-slate-300 max-w-2xl">
                Track credits used in {currentWorkspace?.name || 'your workspace'}
              </p>
            </div>
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
            {(['7d', '30d', 'all'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedPeriod === period
                    ? 'bg-white text-sky-900 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Usage */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">Total Usage</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {usageData.workspaceCreditsUsed.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-2">Credits used in workspace</p>
          </div>
        </div>

        {/* Daily Average */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">Daily Average</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {usageData.dailyAverage.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-2">Credits per day</p>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Activity className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">Transactions</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {usageData.totalTransactions}
            </p>
            <p className="text-xs text-slate-400 mt-2">Debit transactions</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Usage History</h2>
              <p className="text-sm text-slate-500 mt-1">
                All debit transactions for this workspace
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
                  Credits Used
                </th>
                <th className="px-8 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Balance After
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Activity className="h-8 w-8 text-slate-300" />
                      <p className="text-slate-500 text-sm">No usage history found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
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
                    <td className="px-8 py-5 text-sm text-slate-900">
                      {transaction.description || 'Credit usage'}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-bold text-rose-600">
                      <span className="inline-flex items-center gap-1">
                        <Minus className="h-3 w-3" />
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

        {transactions.length > 0 && (
          <div className="border-t border-slate-100 px-8 py-5 text-center bg-slate-50/30">
            <button className="text-sm font-semibold text-sky-500 hover:text-sky-700 transition-colors hover:underline">
              Load More Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
