"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle,  CreditCard, Home } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function BillingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessionDetails, setSessionDetails] = useState<Record<string, unknown> | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId) {
        router.push('/workspace');
        return;
      }

      try {
        const response = await fetch(`/api/stripe/session?session_id=${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to retrieve session details');
        }

        const data = await response.json();
        setSessionDetails(data.session);

        // You could add additional verification logic here
        // For example, check if the payment was actually processed in your database

      } catch (error) {
        console.error('Error verifying payment:', error);
        router.push('/workspace');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      verifyPayment();
    }
  }, [sessionId, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            Thank you for your purchase. Your credits have been added to your account.
          </p>
        </div>

        {/* Payment Details Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Payment Details</h2>
              <p className="text-sm text-slate-500">Transaction completed successfully</p>
            </div>
          </div>

          {sessionDetails && (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600">Amount Paid</span>
                <span className="font-semibold text-slate-900">
                  {sessionDetails?.amount_total && !isNaN(Number(sessionDetails.amount_total))
                    ? `$${(Number(sessionDetails.amount_total) / 100).toFixed(2)}`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600">Payment Method</span>
                <span className="font-semibold text-slate-900 capitalize">
                  {sessionDetails.payment_status === 'paid' ? 'Card' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-600">Transaction ID</span>
                <span className="font-mono text-sm text-slate-500">
                  {typeof sessionDetails.id === 'string'
                    ? sessionDetails.id.slice(-8)
                    : 'N/A'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/workspace"
            className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-4 px-6 rounded-xl border border-slate-200 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Workspace
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Your credits are now available in your account. You can start using Yetti right away!
          </p>
        </div>
      </div>
    </div>
  );
}