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
  ArrowDownRight,
  Wallet,
  Activity,
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

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#0b1220] p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Billing & Usage</h1>
            <p className="text-white/70 text-sm">
              Manage your credits, usage, and invoices
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Available Credits */}
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                <Wallet className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Available Credits</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {billingData.credits.toLocaleString()}
            </p>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-sky-500 to-blue-500 rounded-full transition-all"
                style={{ width: `${creditsPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {creditsPercentage.toFixed(0)}% of total capacity
            </p>
          </div>
        </div>

        {/* Monthly Usage */}
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <Activity className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Monthly Usage</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {billingData.monthlyUsage.toLocaleString()}
            </p>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-orange-500 to-red-500 rounded-full transition-all"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {usagePercentage.toFixed(0)}% of monthly quota
            </p>
          </div>
        </div>

        {/* Current Plan */}
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-sky-100 text-sky-700 rounded-full">
                Active
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Current Plan</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {billingData.currentPlan}
            </p>
            <p className="text-sm text-gray-500 mt-3">$99/month</p>
            <button className="mt-2 text-xs text-sky-600 hover:text-sky-700 font-medium">
              Upgrade Plan →
            </button>
          </div>
        </div>

        {/* Next Billing */}
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Next Billing Date</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">Dec 14</p>
            <p className="text-sm text-gray-500 mt-3">2025</p>
            <p className="text-xs text-gray-400 mt-2">Auto-renewal enabled</p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
              <p className="text-sm text-gray-600 mt-1">
                Track all your credit transactions and usage
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(transaction.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        transaction.type === "credit"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
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
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${
                      transaction.type === "credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}
                    {transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {transaction.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Load More */}
        <div className="border-t border-gray-200 px-6 py-4 text-center">
          <button className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors">
            Load More Transactions
          </button>
        </div>
      </div>

      {/* Invoices Section */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Invoices</h2>
              <p className="text-sm text-gray-600 mt-1">
                Download and view your billing invoices
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {invoice.id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(invoice.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    ${invoice.amount.toFixed(2)}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                      invoice.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : invoice.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)}
                  </span>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
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
        <div className="rounded-xl border border-gray-200 bg-linear-to-br from-sky-50 to-blue-50 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
              <Plus className="h-6 w-6 text-sky-600" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Purchase Additional Credits
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Running low? Top up your credits to keep your AI agents running smoothly.
          </p>
          <button className="w-full px-4 py-2.5 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors">
            Buy Credits
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-linear-to-br from-sky-50 to-cyan-50 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
              <TrendingUp className="h-6 w-6 text-sky-600" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Upgrade Your Plan
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Get more credits and unlock advanced features with our Enterprise plan.
          </p>
          <button className="w-full px-4 py-2.5 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors">
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
}

