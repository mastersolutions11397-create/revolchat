"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  CreditCard,
  TrendingUp,
  Download,
  Plus,
  Minus,
  Calendar,
  DollarSign,
  FileText,
  ArrowUpRight,
  Wallet,
  Activity,
  Loader2,
} from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  type: "credit" | "debit";
  description: string;
  amount: number;
  balance: number;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  downloadUrl?: string;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  const [billingData] = useState({
    credits: 12500,
    usedCredits: 7320,
    totalCredits: 15000,
    monthlyUsage: 7320,
    currentPlan: "Professional",
    nextBillingDate: "2025-12-14",
  });

  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      date: "2025-11-14",
      type: "credit",
      description: "Monthly credits purchased - Pro Plan",
      amount: 10000,
      balance: 12500,
    },
    {
      id: "2",
      date: "2025-11-13",
      type: "debit",
      description: "Instagram API usage - 1,230 messages",
      amount: 1230,
      balance: 2500,
    },
    {
      id: "3",
      date: "2025-11-12",
      type: "debit",
      description: "Telegram API usage - 856 messages",
      amount: 856,
      balance: 3730,
    },
    {
      id: "4",
      date: "2025-11-11",
      type: "credit",
      description: "Bonus credits - Referral reward",
      amount: 500,
      balance: 4586,
    },
    {
      id: "5",
      date: "2025-11-10",
      type: "debit",
      description: "Messenger API usage - 2,450 messages",
      amount: 2450,
      balance: 4086,
    },
    {
      id: "6",
      date: "2025-11-09",
      type: "credit",
      description: "Top-up purchase",
      amount: 5000,
      balance: 6536,
    },
    {
      id: "7",
      date: "2025-11-08",
      type: "debit",
      description: "Knowledge base processing - 120 documents",
      amount: 350,
      balance: 1536,
    },
    {
      id: "8",
      date: "2025-11-07",
      type: "debit",
      description: "Instagram API usage - 980 messages",
      amount: 980,
      balance: 1886,
    },
  ]);

  const [invoices] = useState<Invoice[]>([
    {
      id: "INV-2025-11",
      date: "2025-11-01",
      amount: 99.0,
      status: "paid",
      downloadUrl: "#",
    },
    {
      id: "INV-2025-10",
      date: "2025-10-01",
      amount: 99.0,
      status: "paid",
      downloadUrl: "#",
    },
    {
      id: "INV-2025-09",
      date: "2025-09-01",
      amount: 99.0,
      status: "paid",
      downloadUrl: "#",
    },
    {
      id: "INV-2025-08",
      date: "2025-08-01",
      amount: 49.0,
      status: "paid",
      downloadUrl: "#",
    },
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  const creditsPercentage = (billingData.credits / billingData.totalCredits) * 100;
  const usagePercentage = (billingData.usedCredits / billingData.totalCredits) * 100;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8  max-w-7xl mx-auto animate-fade-in-up">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20">
            <CreditCard className="h-8 w-8 text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Billing & Usage</h1>
            <p className="mt-2 text-lg text-sky-100/80 max-w-2xl">
              Manage your credits, track usage, and view your invoice history.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        

        {/* Monthly Usage */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-orange-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6" />
              </div>
              <TrendingUp className="h-5 w-5 text-orange-500 opacity-50" />
            </div>
            <p className="text-sm font-medium text-slate-500">Monthly Usage</p>
            <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">
              {billingData.monthlyUsage.toLocaleString()}
            </p>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              {usagePercentage.toFixed(0)}% of monthly quota
            </p>
          </div>
        </div>

        {/* Available Credits */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-sky-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
                <Wallet className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-medium">
                <ArrowUpRight className="h-3 w-3" />
                <span>Good</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">Available Credits</p>
            <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">
              {billingData.credits.toLocaleString()}
            </p>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${creditsPercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              {creditsPercentage.toFixed(0)}% of total capacity
            </p>
          </div>
        </div>

        

        {/* Next Billing */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6" />
              </div>
              <FileText className="h-5 w-5 text-blue-400 opacity-50" />
            </div>
            <p className="text-sm font-medium text-slate-500">Next Billing Date</p>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-3xl font-bold text-slate-900 tracking-tight">Dec 14</p>
              <p className="text-sm font-medium text-slate-400">2025</p>
            </div>
            <p className="text-xs text-slate-400 mt-4 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Auto-renewal enabled
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
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm font-medium text-slate-500">$99/month</p>
              <button className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline">
                Upgrade →
              </button>
            </div>
          </div>
        </div>
      </div>

      

      {/* Transactions Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Transaction History</h2>
              <p className="text-sm text-slate-500 mt-1">
                Track all your credit transactions and usage
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
                  Type
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-8 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-8 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-600">
                    {new Date(transaction.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        transaction.type === "credit"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}
                    >
                      {transaction.type === "credit" ? (
                        <Plus className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      {transaction.type === "credit" ? "Credit" : "Debit"}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-900 font-medium">
                    {transaction.description}
                  </td>
                  <td
                    className={`px-8 py-5 whitespace-nowrap text-right text-sm font-bold ${
                      transaction.type === "credit"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}
                    {transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-semibold text-slate-700">
                    {transaction.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Load More */}
        <div className="border-t border-slate-100 px-8 py-5 text-center bg-slate-50/30">
          <button className="text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors hover:underline">
            Load More Transactions
          </button>
        </div>
      </div>

      {/* Invoices Section */}
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
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors group"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm group-hover:text-sky-600 transition-all">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {invoice.id}
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
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/50 to-blue-50/50 p-8 transition-all hover:shadow-lg hover:border-sky-200">
          <div className="flex items-start justify-between mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-sky-600">
              <Plus className="h-7 w-7" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Purchase Additional Credits
          </h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Running low? Top up your credits instantly to keep your AI agents running smoothly without interruption.
          </p>
          <button className="w-full px-6 py-3.5 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-200 active:scale-[0.98]">
            Buy Credits
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
            Unlock advanced features, higher limits, and priority support with our Enterprise plan.
          </p>
          <button className="w-full px-6 py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-[0.98]">
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
}
