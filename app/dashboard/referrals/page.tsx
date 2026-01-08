"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";
import { generateReferralCode } from "@/lib/utils/referral-code";
import type { ReferralProfile, ReferralAnalytics, ReferralCommission, ReferralCashoutRequest } from "@/lib/api/referrals";
import {
  Copy,
  Share2,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Loader2,
  Gift,
  ExternalLink,
  Mail,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

export default function ReferralsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ReferralProfile | null>(null);
  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null);
  const [commissions, setCommissions] = useState<ReferralCommission[]>([]);
  const [cashoutRequests, setCashoutRequests] = useState<ReferralCashoutRequest[]>([]);
  const [cashoutLoading, setCashoutLoading] = useState(false);
  const [showCashoutForm, setShowCashoutForm] = useState(false);
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [paymentDetails, setPaymentDetails] = useState({
    email: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
    routingNumber: "",
  });

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://yetti.ai";
  const referralLink = profile ? `${siteUrl}/auth/signup?ref=${profile.referral_code}` : "";

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get or create profile
      let { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      // Create profile if it doesn't exist
      if (!profileData) {
        const username = user.email?.split("@")[0] || "USER";
        let referralCode = generateReferralCode(username);

        // Ensure uniqueness
        let attempts = 0;
        while (attempts < 10) {
          const { data: existing } = await supabase
            .from("user_profiles")
            .select("referral_code")
            .eq("referral_code", referralCode)
            .maybeSingle();

          if (!existing) break;
          referralCode = generateReferralCode(username);
          attempts++;
        }

        const { data: newProfile, error: createError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: user.id,
            referral_code: referralCode,
            total_earnings: 0,
            total_referrals: 0,
          })
          .select()
          .single();

        if (createError) throw createError;
        profileData = newProfile;
      }

      setProfile(profileData);

      // Get referrals
      const { data: referrals, error: referralsError } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (referralsError) throw referralsError;

      // Get commissions
      const { data: commissionsData, error: commissionsError } = await supabase
        .from("referral_commissions")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (commissionsError) throw commissionsError;

      setCommissions(commissionsData || []);

      // Get cashout requests
      const { data: cashoutData, error: cashoutError } = await supabase
        .from("referral_cashout_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cashoutError) throw cashoutError;

      setCashoutRequests(cashoutData || []);

      // Calculate analytics
      const totalReferrals = referrals?.length || 0;
      const successfulSignups = referrals?.filter((r) => r.status === "completed" || r.status === "pending").length || 0;
      const completedPurchases = commissionsData?.length || 0;
      const totalEarnings = parseFloat(profileData.total_earnings?.toString() || "0");
      const pendingEarnings = commissionsData?.filter((c) => c.status === "pending" || c.status === "requested")
        .reduce((sum, c) => sum + parseFloat(c.commission_amount.toString()), 0) || 0;
      const conversionRate = totalReferrals > 0 
        ? parseFloat(((completedPurchases / totalReferrals) * 100).toFixed(1))
        : 0;

      const analyticsData: ReferralAnalytics = {
        stats: {
          total_referrals: totalReferrals,
          successful_signups: successfulSignups,
          completed_purchases: completedPurchases,
          total_earnings: totalEarnings,
          pending_earnings: pendingEarnings,
          conversion_rate: conversionRate,
        },
        recent_referrals: referrals?.slice(0, 10) || [],
        recent_commissions: commissionsData?.slice(0, 10) || [],
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error loading referral data:", error);
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  }

  function copyReferralLink() {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied to clipboard!");
    }
  }

  function shareReferralLink() {
    if (navigator.share && referralLink) {
      navigator.share({
        title: "Join me on Yetti AI",
        text: "Sign up for Yetti AI using my referral link and get started!",
        url: referralLink,
      });
    } else {
      copyReferralLink();
    }
  }

  async function handleSimpleCashoutRequest() {
    if (!user?.id || !user?.email || totalPendingAmount <= 0) {
      toast.error("Unable to process cashout request");
      return;
    }

    try {
      setCashoutLoading(true);

      // Send email to info@yetti.ai
      const response = await fetch("/api/referrals/cashout-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          referralCode: profile?.referral_code || "N/A",
          totalAmount: totalPendingAmount,
          commissionCount: pendingCommissions.length,
          commissionIds: pendingCommissions.map((c) => c.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send cashout request");
      }

      toast.success("Cashout request sent! We'll contact you shortly.");
    } catch (error: any) {
      console.error("Error sending cashout request:", error);
      toast.error(error.message || "Failed to send cashout request");
    } finally {
      setCashoutLoading(false);
    }
  }

  async function handleCashout() {
    if (!user?.id) return;

    if (selectedCommissions.length === 0) {
      toast.error("Please select at least one commission to cash out");
      return;
    }

    if (paymentMethod === "paypal" && !paymentDetails.email) {
      toast.error("Please enter your PayPal email");
      return;
    }

    if (paymentMethod === "bank_transfer" && (!paymentDetails.accountNumber || !paymentDetails.bankName)) {
      toast.error("Please enter all required bank details");
      return;
    }

    try {
      setCashoutLoading(true);

      // Get selected commissions to calculate total
      const selectedComms = pendingCommissions.filter((c) => selectedCommissions.includes(c.id));
      const totalAmount = selectedComms.reduce(
        (sum, c) => sum + parseFloat(c.commission_amount.toString()),
        0
      );

      // Create cashout request
      const { data: cashoutRequest, error: cashoutError } = await supabase
        .from("referral_cashout_requests")
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          commission_ids: selectedCommissions,
          status: "pending",
          payment_method: paymentMethod,
          payment_details: paymentDetails,
        })
        .select()
        .single();

      if (cashoutError) throw cashoutError;

      // Update commission status to requested
      const { error: updateError } = await supabase
        .from("referral_commissions")
        .update({
          status: "requested",
          cashout_requested_at: new Date().toISOString(),
        })
        .in("id", selectedCommissions);

      if (updateError) throw updateError;

      // Send email to info@yetti.ai via API (requires server-side)
      try {
        await fetch("/api/referrals/cashout-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cashoutRequestId: cashoutRequest.id,
            userId: user.id,
            userEmail: user.email,
            referralCode: profile?.referral_code,
            totalAmount,
            paymentMethod,
            paymentDetails,
            commissionIds: selectedCommissions,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't fail the cashout if email fails
      }

      toast.success("Cashout request submitted! You'll receive an email confirmation shortly.");
      setShowCashoutForm(false);
      setSelectedCommissions([]);
      setPaymentDetails({
        email: "",
        accountName: "",
        accountNumber: "",
        bankName: "",
        routingNumber: "",
      });
      await loadData();
    } catch (error: any) {
      console.error("Error creating cashout request:", error);
      toast.error(error.message || "Failed to create cashout request");
    } finally {
      setCashoutLoading(false);
    }
  }

  const pendingCommissions = commissions.filter(
    (c) => c.status === "pending" && !c.cashout_requested_at
  );
  const totalPendingAmount = pendingCommissions.reduce(
    (sum, c) => sum + parseFloat(c.commission_amount.toString()),
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Referral Program</h1>
          <p className="text-slate-500 mt-1">Earn 30% commission when someone you refer purchases a plan</p>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Your Referral Code</h2>
            <p className="text-sky-100 mb-6">Share your unique link and earn commissions!</p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <code className="text-2xl font-bold text-white flex-1">{profile?.referral_code}</code>
                <button
                  onClick={copyReferralLink}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title="Copy code"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-sky-100 mb-2">Your Referral Link</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 bg-white/20 text-white rounded-lg px-4 py-2 text-sm font-mono"
                />
                <button
                  onClick={copyReferralLink}
                  className="px-4 py-2 bg-white text-sky-600 rounded-lg font-semibold hover:bg-sky-50 transition-colors flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
                <button
                  onClick={shareReferralLink}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
          <div className="ml-8">
            <Gift className="h-24 w-24 text-white/20" />
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-sky-100 rounded-lg">
                <Users className="h-6 w-6 text-sky-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{analytics.stats.total_referrals}</h3>
            <p className="text-sm text-slate-500">Total Referrals</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{analytics.stats.completed_purchases}</h3>
            <p className="text-sm text-slate-500">Completed Purchases</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              ${analytics.stats.total_earnings.toFixed(2)}
            </h3>
            <p className="text-sm text-slate-500">Total Earnings</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              {analytics.stats.conversion_rate}%
            </h3>
            <p className="text-sm text-slate-500">Conversion Rate</p>
          </div>
        </div>
      )}

      {/* Pending Earnings & Cashout */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Pending Earnings</h3>
            <p className="text-2xl font-bold text-sky-600 mt-1">${totalPendingAmount.toFixed(2)}</p>
            <p className="text-sm text-slate-500 mt-1">
              {pendingCommissions.length} commission{pendingCommissions.length !== 1 ? "s" : ""} ready for cashout
            </p>
          </div>
          <div className="flex gap-3">
            {totalPendingAmount > 0 && (
              <button
                onClick={handleSimpleCashoutRequest}
                disabled={cashoutLoading}
                className="px-6 py-3 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cashoutLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    Request Cashout
                  </>
                )}
              </button>
            )}
            {pendingCommissions.length > 0 && (
              <button
                onClick={() => setShowCashoutForm(!showCashoutForm)}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors flex items-center gap-2"
              >
                <CreditCard className="h-5 w-5" />
                Advanced Cashout
              </button>
            )}
          </div>
        </div>

        {/* Cashout Form */}
        {showCashoutForm && (
          <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-4">Request Cashout</h4>
            
            {/* Select Commissions */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Commissions to Cash Out
              </label>
              <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-3 bg-white">
                {pendingCommissions.map((commission) => (
                  <label
                    key={commission.id}
                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCommissions.includes(commission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCommissions([...selectedCommissions, commission.id]);
                        } else {
                          setSelectedCommissions(selectedCommissions.filter((id) => id !== commission.id));
                        }
                      }}
                      className="rounded border-slate-300 text-sky-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        ${parseFloat(commission.commission_amount.toString()).toFixed(2)} - {commission.plan_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(commission.created_at).toLocaleDateString()} • Month {commission.payment_month}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Selected: ${selectedCommissions
                  .reduce((sum, id) => {
                    const comm = pendingCommissions.find((c) => c.id === id);
                    return sum + (comm ? parseFloat(comm.commission_amount.toString()) : 0);
                  }, 0)
                  .toFixed(2)}
              </p>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>

            {/* Payment Details */}
            {paymentMethod === "paypal" && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">PayPal Email</label>
                <input
                  type="email"
                  value={paymentDetails.email}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            )}

            {paymentMethod === "bank_transfer" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Account Name</label>
                  <input
                    type="text"
                    value={paymentDetails.accountName}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, accountName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={paymentDetails.bankName}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                    placeholder="Bank Name"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Account Number</label>
                    <input
                      type="text"
                      value={paymentDetails.accountNumber}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })}
                      placeholder="123456789"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Routing Number</label>
                    <input
                      type="text"
                      value={paymentDetails.routingNumber}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, routingNumber: e.target.value })}
                      placeholder="123456789"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCashout}
                disabled={cashoutLoading || selectedCommissions.length === 0}
                className="px-6 py-2 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {cashoutLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Submit Request
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowCashoutForm(false);
                  setSelectedCommissions([]);
                }}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Commission History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Commission History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No commissions yet. Start referring to earn!
                  </td>
                </tr>
              ) : (
                commissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {new Date(commission.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {commission.plan_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      ${parseFloat(commission.commission_amount.toString()).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      Month {commission.payment_month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          commission.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : commission.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : commission.status === "requested"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Referral List */}
      {analytics && analytics.recent_referrals.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Recent Referrals</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.recent_referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-sky-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        Referred User
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      referral.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : referral.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

