import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

/**
 * Create a cashout request
 * Sends email to info@yetti.ai
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commissionIds, paymentMethod, paymentDetails } = body;

    if (!commissionIds || !Array.isArray(commissionIds) || commissionIds.length === 0) {
      return NextResponse.json(
        { error: "Commission IDs are required" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    // Get auth header to get user ID
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from token (simplified - in production, verify JWT properly)
    // For now, we'll get it from the commissions
    const { data: commissions, error: commissionsError } = await supabaseAdmin
      .from("referral_commissions")
      .select("referrer_id, commission_amount, status")
      .in("id", commissionIds);

    if (commissionsError || !commissions || commissions.length === 0) {
      return NextResponse.json(
        { error: "Invalid commission IDs" },
        { status: 400 }
      );
    }

    // Verify all commissions belong to same user and are pending
    const referrerId = commissions[0].referrer_id;
    const allSameUser = commissions.every((c) => c.referrer_id === referrerId);
    const allPending = commissions.every((c) => c.status === "pending");

    if (!allSameUser) {
      return NextResponse.json(
        { error: "All commissions must belong to the same user" },
        { status: 400 }
      );
    }

    if (!allPending) {
      return NextResponse.json(
        { error: "All commissions must be pending" },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = commissions.reduce(
      (sum, c) => sum + parseFloat(c.commission_amount.toString()),
      0
    );

    // Create cashout request
    const { data: cashoutRequest, error: cashoutError } = await supabaseAdmin
      .from("referral_cashout_requests")
      .insert({
        user_id: referrerId,
        total_amount: totalAmount,
        commission_ids: commissionIds,
        status: "pending",
        payment_method: paymentMethod,
        payment_details: paymentDetails || {},
      })
      .select()
      .single();

    if (cashoutError) {
      console.error("Error creating cashout request:", cashoutError);
      return NextResponse.json(
        { error: "Failed to create cashout request" },
        { status: 500 }
      );
    }

    // Update commission status to requested
    await supabaseAdmin
      .from("referral_commissions")
      .update({
        status: "requested",
        cashout_requested_at: new Date().toISOString(),
      })
      .in("id", commissionIds);

    // Get user info for email
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(referrerId);
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("referral_code")
      .eq("user_id", referrerId)
      .single();

    // Send email to info@yetti.ai
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "yetti AI <onboarding@resend.dev>",
        to: "info@yetti.ai",
        subject: `New Referral Cashout Request - $${totalAmount.toFixed(2)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #5170ff;">New Referral Cashout Request</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>User ID:</strong> ${referrerId}</p>
              <p><strong>User Email:</strong> ${user?.user?.email || "N/A"}</p>
              <p><strong>Referral Code:</strong> ${profile?.referral_code || "N/A"}</p>
              <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p><strong>Number of Commissions:</strong> ${commissions.length}</p>
            </div>
            <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
              <h3 style="color: #333;">Payment Details:</h3>
              <pre style="color: #666; white-space: pre-wrap;">${JSON.stringify(paymentDetails, null, 2)}</pre>
            </div>
            <div style="background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; margin-top: 20px;">
              <h3 style="color: #333;">Commission IDs:</h3>
              <p style="color: #666;">${commissionIds.join(", ")}</p>
            </div>
            <p style="margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://yetti.ai"}/admin/cashouts/${cashoutRequest.id}" style="background: #5170ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Cashout Request
              </a>
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, cashoutRequest });
  } catch (error) {
    console.error("Error creating cashout request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

