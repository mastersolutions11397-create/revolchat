"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";
import { generateReferralCode } from "@/lib/utils/referral-code";

// Define types locally since we removed the API file
interface ReferralProfile {
  user_id: string;
  referral_code: string;
  total_earnings: number;
  total_referrals: number;
  created_at: string;
  updated_at: string;
}

interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string;
  referral_code: string;
  status: "pending" | "completed" | "expired";
  created_at: string;
  completed_at: string | null;
}

interface ReferralCommission {
  id: string;
  referral_id: string;
  referrer_id: string;
  referee_id: string;
  plan_name: string;
  plan_price: number;
  commission_amount: number;
  commission_type: "credits" | "cash" | "pending";
  status: "pending" | "paid" | "failed" | "cancelled" | "requested";
  stripe_invoice_id: string | null;
  user_plan_id: string | null;
  payment_month: number;
  created_at: string;
  paid_at: string | null;
  cashout_requested_at: string | null;
}

interface ReferralCashoutRequest {
  id: string;
  user_id: string;
  total_amount: number;
  commission_ids: string[];
  status: "pending" | "processing" | "completed" | "rejected";
  payment_method: string | null;
  payment_details: Record<string, any> | null;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
}

interface ReferralStats {
  total_referrals: number;
  successful_signups: number;
  completed_purchases: number;
  total_earnings: number;
  pending_earnings: number;
  conversion_rate: number;
}

interface ReferralAnalytics {
  stats: ReferralStats;
  recent_referrals: Referral[];
  recent_commissions: ReferralCommission[];
}
import {
  Copy,
  Share2,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Loader2,
  Gift,
  ExternalLink,
  Mail,
  CreditCard,
  ChevronRight,
  UserCheck,
  Building2,
  ArrowRightLeft,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export default function ReferralsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ReferralProfile | null>(null);
  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<ReferralCommission[]>([]);
  const [cashoutRequests, setCashoutRequests] = useState<
    ReferralCashoutRequest[]
  >([]);
  const [cashoutLoading, setCashoutLoading] = useState(false);

  const siteUrl =
    typeof window !== "undefined" ? window.location.origin : "https://yetti.ai";
  const affiliateLink = profile
    ? `${siteUrl}/auth/signup?ref=${profile.referral_code}`
    : "";

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

      if (profileError) throw profileError;

      if (!profileData) {
        // Profile might have been created by trigger, try to fetch again
        const { data: refetchProfile, error: refetchError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!refetchError && refetchProfile) {
          profileData = refetchProfile;
        } else {
          // Create profile if it still doesn't exist
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

          if (createError) {
            // If creation fails due to duplicate, try fetching again
            if (createError.code === "23505") {
              const { data: finalFetch } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();
              if (finalFetch) {
                profileData = finalFetch;
              } else {
                throw new Error("Failed to create or fetch user profile");
              }
            } else {
              throw createError;
            }
          } else {
            profileData = newProfile;
          }
        }
      }

      setProfile(profileData);

      // Get referrals with referee email via a join or secondary fetch
      // For now, let's fetch referrals and then emails if needed, or assume referee_id is enough
      const { data: referralsData, error: referralsError } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (referralsError) throw referralsError;
      setReferrals(referralsData || []);

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
      const totalReferrals = referralsData?.length || 0;
      const successfulSignups =
        referralsData?.filter(
          (r) => r.status === "completed" || r.status === "pending"
        ).length || 0;
      const completedPurchases = commissionsData?.length || 0;
      const totalEarnings = parseFloat(
        profileData.total_earnings?.toString() || "0"
      );
      const pendingEarnings =
        commissionsData
          ?.filter((c) => c.status === "pending" || c.status === "requested")
          .reduce(
            (sum, c) => sum + parseFloat(String(c.commission_amount)),
            0
          ) || 0;
      const conversionRate =
        totalReferrals > 0
          ? parseFloat(((completedPurchases / totalReferrals) * 100).toFixed(1))
          : 0;

      setAnalytics({
        stats: {
          total_referrals: totalReferrals,
          successful_signups: successfulSignups,
          completed_purchases: completedPurchases,
          total_earnings: totalEarnings,
          pending_earnings: pendingEarnings,
          conversion_rate: conversionRate,
        },
        recent_referrals: referralsData?.slice(0, 10) || [],
        recent_commissions: commissionsData?.slice(0, 10) || [],
      });
    } catch (error) {
      console.error("Error loading referral data:", error);
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  }

  function copyAffiliateCode() {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast.success("Affiliate code copied!", {
        description: "Your friends can enter this code during signup or in Settings. Note: Once entered, the code cannot be changed.",
        duration: 6000,
        closeButton: true,
      });
    }
  }

  function copyAffiliateLink() {
    if (affiliateLink) {
      navigator.clipboard.writeText(affiliateLink);
      toast.success("Affiliate link copied!", {
        description: "Share this link with your friends. They can enter your code during signup or in Settings (note: code cannot be changed once entered).",
        duration: 6000,
        closeButton: true,
      });
    }
  }

  function shareAffiliateLink() {
    if (navigator.share && affiliateLink) {
      navigator.share({
        title: "Join me on Yetti AI",
        text: "Sign up for Yetti AI using my affiliate link and get started!",
        url: affiliateLink,
      });
    } else {
      copyAffiliateLink();
    }
  }

  const pendingCommissions = commissions.filter(
    (c) => c.status === "pending" && !c.cashout_requested_at
  );

  const totalPendingAmount = analytics?.stats.pending_earnings || 0;

  async function handleSimpleCashoutRequest() {
    if (!user?.id || !user?.email || totalPendingAmount <= 0) {
      toast.error("No pending earnings to cash out");
      return;
    }

    try {
      setCashoutLoading(true);

      // Save payout request to database
      const { data: cashoutRequest, error: dbError } = await supabase
        .from("referral_cashout_requests")
        .insert({
          user_id: user.id,
          total_amount: totalPendingAmount,
          commission_ids: pendingCommissions.map((c) => c.id),
          status: "pending",
          payment_method: "email",
          payment_details: { email: user.email },
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Update commission status to requested
      const { error: updateError } = await supabase
        .from("referral_commissions")
        .update({
          status: "requested",
          cashout_requested_at: new Date().toISOString(),
        })
        .in(
          "id",
          pendingCommissions.map((c) => c.id)
        );

      if (updateError) throw updateError;

      toast.success(
        "Cashout request submitted! We'll process your payout soon."
      );
      loadData(); // Refresh data to show updated commission status
    } catch (error: any) {
      console.error("Error submitting cashout request:", error);
      toast.error(error.message || "Failed to submit cashout request");
    } finally {
      setCashoutLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-10">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-teal-primary via-[#0d6159] to-slate-800 p-8 text-white shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-teal-accent/20 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-teal-accent/20 blur-3xl opacity-50" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner ring-1 ring-white/20">
              <Gift className="h-8 w-8 text-teal-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Affiliate Program
              </h1>
              <p className="mt-1 text-slate-300 text-lg">
                Earn 30% commission on every affiliate
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 ring-1 ring-white/20">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-accent">
                Your Code
              </span>
              <div className="flex items-center gap-3 mt-1">
                <code className="text-xl font-mono font-bold text-white">
                  {profile?.referral_code}
                </code>
                <button
                  onClick={copyAffiliateCode}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                  title="Copy affiliate code"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 ring-1 ring-white/20">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-accent">
                    Pending Payout
                  </p>
                  <p className="text-lg font-bold text-white">
                    ${totalPendingAmount.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={handleSimpleCashoutRequest}
                  disabled={cashoutLoading || totalPendingAmount <= 0}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {cashoutLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  Request Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-dashboard-border bg-dashboard-card p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Share your link
            </h3>
            <p className="text-slate-500 mb-6">
              Invite your friends to Yetti and earn rewards when they upgrade to
              a paid plan.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 p-2 bg-dashboard-bg rounded-2xl border border-dashboard-border">
              <div className="flex-1 flex items-center px-4 py-2 text-sm font-mono text-slate-600 truncate bg-dashboard-card rounded-xl border border-dashboard-border shadow-xs">
                {affiliateLink}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyAffiliateLink}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
                <button
                  onClick={shareAffiliateLink}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-sky-600"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="space-y-3">
                <div className="h-10 w-10 bg-teal-primary/10 rounded-lg flex items-center justify-center text-teal-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900">1. Invite friends</h4>
                <p className="text-sm text-slate-500">
                  Send your unique affiliate link to your friends and network.
                </p>
              </div>
              <div className="space-y-3">
                <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                  <UserCheck className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900">2. They sign up</h4>
                <p className="text-sm text-slate-500">
                  They create an account and start exploring Yetti AI.
                </p>
              </div>
              <div className="space-y-3">
                <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                  <DollarSign className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900">3. Earn rewards</h4>
                <p className="text-sm text-slate-500">
                  Get 30% commission for the first 3 months of their
                  subscription.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Affiliates */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-8 py-5 border-b border-dashboard-border flex items-center justify-between bg-dashboard-bg">
              <h3 className="font-bold text-slate-900">Recent Affiliates</h3>
              <div className="text-xs font-bold text-teal-primary bg-teal-primary/10 px-3 py-1 rounded-full uppercase tracking-wider border border-teal-primary/20">
                {analytics?.stats.total_referrals || 0} Total
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {referrals.length === 0 ? (
                <div className="px-8 py-12 text-center">
                  <div className="mx-auto h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-slate-500">
                    No affiliates yet. Share your link to get started!
                  </p>
                </div>
              ) : (
                referrals.slice(0, 5).map((referral) => (
                  <div
                    key={referral.id}
                    className="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                        U
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          Referred User
                        </p>
                        <p className="text-xs text-slate-500">
                          Joined{" "}
                          {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        referral.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : referral.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-slate-50 text-slate-700 border border-slate-100"
                      }`}
                    >
                      {referral.status.charAt(0).toUpperCase() +
                        referral.status.slice(1)}
                    </span>
                  </div>
                ))
              )}
            </div>
            {referrals.length > 5 && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <button className="text-sm font-bold text-teal-primary hover:text-teal-accent">
                  View all affiliates
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Rewards Card */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-sky-500/10 blur-2xl rounded-full -mt-16 -mr-16" />
              <p className="text-teal-accent text-xs font-bold uppercase tracking-widest mb-1">
                Your Balance
              </p>
              <h3 className="text-4xl font-bold">
                ${analytics?.stats.total_earnings.toFixed(2) || "0.00"}
              </h3>
              <p className="text-slate-400 text-sm mt-4 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span>Available for withdrawal</span>
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                  <p className="text-slate-500 text-sm">Pending</p>
                  <p className="text-xl font-bold text-slate-900">
                    ${analytics?.stats.pending_earnings.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div className="h-10 w-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                  <Clock className="h-5 w-5" />
                </div>
              </div>

              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                  <p className="text-slate-500 text-sm">Total Earned</p>
                  <p className="text-xl font-bold text-slate-900">
                    ${analytics?.stats.total_earnings.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div className="h-10 w-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>

              {totalPendingAmount > 0 ? (
                <button
                  onClick={handleSimpleCashoutRequest}
                  disabled={cashoutLoading}
                  className="w-full bg-linear-to-r from-sky-500 to-sky-500 hover:scale-[1.02] active:scale-[0.98] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {cashoutLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRightLeft className="h-4 w-4" />
                  )}
                  Request Payout
                </button>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3">
                  <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Affiliate earnings are processed within 30 days of the
                    referee's payment. Once available, you can request a payout.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info Card */}
        </div>
      </div>

      {/* Commission Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-900">Earnings History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-8 py-4">Transaction</th>
                <th className="px-8 py-4">Amount</th>
                <th className="px-8 py-4">Month</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center">
                    <div className="mx-auto h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                      <DollarSign className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500">
                      No transactions recorded yet.
                    </p>
                  </td>
                </tr>
              ) : (
                commissions.map((comm) => (
                  <tr
                    key={comm.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-white transition-colors">
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {comm.plan_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Affiliate reward
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-slate-900">
                        ${parseFloat(String(comm.commission_amount)).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                        Month {comm.payment_month}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          comm.status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : comm.status === "pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-sky-50 text-sky-700 border border-sky-100"
                        }`}
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            comm.status === "paid"
                              ? "bg-emerald-500"
                              : comm.status === "pending"
                                ? "bg-amber-500"
                                : "bg-sky-500"
                          }`}
                        />
                        {comm.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-sm text-slate-500">
                        {new Date(comm.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
