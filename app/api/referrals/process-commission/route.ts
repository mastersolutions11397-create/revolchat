import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { PLAN_CONFIGS } from "@/lib/stripe";

/**
 * Internal API endpoint to process referral commissions
 * Called from Stripe webhook when payment succeeds
 * This uses direct Supabase access as it's an internal server-side operation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      planName,
      planPrice,
      invoiceId,
      userPlanId,
      paymentMonth = 1,
    } = body;

    if (!userId || !planName || !planPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user has a referrer
    const { data: referral, error: referralError } = await supabaseAdmin
      .from("referrals")
      .select("*")
      .eq("referee_id", userId)
      .eq("status", "pending")
      .maybeSingle();

    if (referralError && referralError.code !== "PGRST116") {
      console.error("Error checking referral:", referralError);
      return NextResponse.json(
        { error: "Failed to check referral" },
        { status: 500 }
      );
    }

    // If no referral, nothing to process
    if (!referral) {
      return NextResponse.json({ success: true, message: "No referral found" });
    }

    // Check if commission already exists for this payment
    const { data: existingCommission } = await supabaseAdmin
      .from("referral_commissions")
      .select("*")
      .eq("referral_id", referral.id)
      .eq("user_plan_id", userPlanId)
      .eq("payment_month", paymentMonth)
      .maybeSingle();

    if (existingCommission) {
      return NextResponse.json({
        success: true,
        message: "Commission already processed",
      });
    }

    // Calculate 30% commission
    const commissionAmount = parseFloat((planPrice * 0.3).toFixed(2));

    // Create commission record
    const { data: commission, error: commissionError } = await supabaseAdmin
      .from("referral_commissions")
      .insert({
        referral_id: referral.id,
        referrer_id: referral.referrer_id,
        referee_id: userId,
        plan_name: planName,
        plan_price: planPrice,
        commission_amount: commissionAmount,
        commission_type: "cash",
        status: "pending", // Will be marked as paid when cashout is processed
        stripe_invoice_id: invoiceId || null,
        user_plan_id: userPlanId || null,
        payment_month: paymentMonth,
      })
      .select()
      .single();

    if (commissionError) {
      console.error("Error creating commission:", commissionError);
      return NextResponse.json(
        { error: "Failed to create commission" },
        { status: 500 }
      );
    }

    // Update referral status to completed if first payment
    if (paymentMonth === 1) {
      await supabaseAdmin
        .from("referrals")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", referral.id);

      // Update user profile stats
      await supabaseAdmin.rpc("increment_referral_count", {
        user_id: referral.referrer_id,
      });
    }

    // Update total earnings in user profile
    await supabaseAdmin.rpc("increment_referral_earnings", {
      user_id: referral.referrer_id,
      amount: commissionAmount,
    });

    return NextResponse.json({ success: true, commission });
  } catch (error) {
    console.error("Error processing commission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

