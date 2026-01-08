import { apiRequest } from "./client";

export interface ReferralProfile {
  user_id: string;
  referral_code: string;
  total_earnings: number;
  total_referrals: number;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string;
  referral_code: string;
  status: "pending" | "completed" | "expired";
  created_at: string;
  completed_at: string | null;
}

export interface ReferralCommission {
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

export interface ReferralCashoutRequest {
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

export interface ReferralStats {
  total_referrals: number;
  successful_signups: number;
  completed_purchases: number;
  total_earnings: number;
  pending_earnings: number;
  conversion_rate: number;
}

export interface ReferralAnalytics {
  stats: ReferralStats;
  recent_referrals: Referral[];
  recent_commissions: ReferralCommission[];
}

class ReferralsAPI {
  /**
   * Get or create user's referral profile
   */
  async getProfile(): Promise<ReferralProfile> {
    return apiRequest<ReferralProfile>("/api/referrals/profile");
  }

  /**
   * Get referral statistics and analytics
   */
  async getAnalytics(): Promise<ReferralAnalytics> {
    return apiRequest<ReferralAnalytics>("/api/referrals/analytics");
  }

  /**
   * Get list of referrals
   */
  async getReferrals(): Promise<Referral[]> {
    return apiRequest<{ referrals: Referral[] }>("/api/referrals/list").then(
      (res) => res.referrals
    );
  }

  /**
   * Get commission history
   */
  async getCommissions(): Promise<ReferralCommission[]> {
    return apiRequest<{ commissions: ReferralCommission[] }>(
      "/api/referrals/commissions"
    ).then((res) => res.commissions);
  }

  /**
   * Create a cashout request
   */
  async requestCashout(
    commissionIds: string[],
    paymentMethod: string,
    paymentDetails: Record<string, any>
  ): Promise<ReferralCashoutRequest> {
    return apiRequest<ReferralCashoutRequest>("/api/referrals/cashout", {
      method: "POST",
      body: JSON.stringify({
        commission_ids: commissionIds,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
      }),
    });
  }

  /**
   * Get cashout requests
   */
  async getCashoutRequests(): Promise<ReferralCashoutRequest[]> {
    return apiRequest<{ requests: ReferralCashoutRequest[] }>(
      "/api/referrals/cashout-requests"
    ).then((res) => res.requests);
  }
}

export const referralsAPI = new ReferralsAPI();

