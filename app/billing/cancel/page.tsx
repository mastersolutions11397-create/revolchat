"use client";

import Link from "next/link";
import { XCircle, ArrowRight, RefreshCw, CreditCard } from "lucide-react";

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Cancel Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            Your payment was cancelled. No charges have been made to your account.
          </p>
        </div>

        {/* Cancel Details Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Payment Cancelled</h2>
              <p className="text-sm text-slate-500">You can try again at any time</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-slate-900 mb-2">What happened?</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• You cancelled the payment process</li>
              <li>• No charges were made to your card</li>
              <li>• Your account remains unchanged</li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Need help?</h3>
            <p className="text-sm text-blue-700">
              If you encountered any issues during checkout, please contact our support team.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/pricing"
            className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-sky-200 flex items-center justify-center gap-2"
          >
            Try Again
            <RefreshCw className="w-5 h-5" />
          </Link>
          <Link
            href="/dashboard/billing"
            className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-4 px-6 rounded-xl border border-slate-200 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            View Billing Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Remember, you can always upgrade or purchase credits later. Your data is safe and secure.
          </p>
        </div>
      </div>
    </div>
  );
}