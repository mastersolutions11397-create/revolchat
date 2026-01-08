import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Get referral analytics and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from auth token
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get all referrals
    const { data: referrals } = await supabaseAdmin
      .from("referrals")
      .select("*")
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false });

    // Get all commissions
    const { data: commissions } = await supabaseAdmin
      .from("referral_commissions")
      .select("*")
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false });

    // Calculate statistics
    const totalReferrals = referrals?.length || 0;
    const successfulSignups = referrals?.filter((r) => r.status === "completed" || r.status === "pending").length || 0;
    const completedPurchases = commissions?.length || 0;
    const totalEarnings = parseFloat(profile.total_earnings?.toString() || "0");
    const pendingEarnings = commissions?.filter((c) => c.status === "pending" || c.status === "requested")
      .reduce((sum, c) => sum + parseFloat(c.commission_amount.toString()), 0) || 0;
    
    // Calculate conversion rate (signups that led to purchases)
    const conversionRate = totalReferrals > 0 
      ? ((completedPurchases / totalReferrals) * 100).toFixed(1)
      : "0.0";

    // Get recent referrals (last 10)
    const recentReferrals = referrals?.slice(0, 10) || [];

    // Get recent commissions (last 10)
    const recentCommissions = commissions?.slice(0, 10) || [];

    return NextResponse.json({
      stats: {
        total_referrals: totalReferrals,
        successful_signups: successfulSignups,
        completed_purchases: completedPurchases,
        total_earnings: totalEarnings,
        pending_earnings: pendingEarnings,
        conversion_rate: parseFloat(conversionRate),
      },
      recent_referrals: recentReferrals,
      recent_commissions: recentCommissions,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

