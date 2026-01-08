import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Link a referral code to a user after signup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, userId } = body;

    if (!referralCode || !userId) {
      return NextResponse.json(
        { error: "Missing referral code or user ID" },
        { status: 400 }
      );
    }

    // Find the referrer by referral code
    const { data: referrerProfile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id")
      .eq("referral_code", referralCode.toUpperCase())
      .maybeSingle();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error finding referrer:", profileError);
      return NextResponse.json(
        { error: "Failed to find referrer" },
        { status: 500 }
      );
    }

    if (!referrerProfile) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 }
      );
    }

    const referrerId = referrerProfile.user_id;

    // Prevent self-referral
    if (referrerId === userId) {
      return NextResponse.json(
        { error: "Cannot use your own referral code" },
        { status: 400 }
      );
    }

    // Check if user already has a referral
    const { data: existingReferral } = await supabaseAdmin
      .from("referrals")
      .select("id")
      .eq("referee_id", userId)
      .maybeSingle();

    if (existingReferral) {
      return NextResponse.json({
        success: true,
        message: "User already has a referral",
      });
    }

    // Create referral relationship
    const { data: referral, error: referralError } = await supabaseAdmin
      .from("referrals")
      .insert({
        referrer_id: referrerId,
        referee_id: userId,
        referral_code: referralCode.toUpperCase(),
        status: "pending",
      })
      .select()
      .single();

    if (referralError) {
      console.error("Error creating referral:", referralError);
      return NextResponse.json(
        { error: "Failed to create referral" },
        { status: 500 }
      );
    }

    // Send email notification to referrer
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Get referrer email
        const { data: { user: referrerUser } } = await supabaseAdmin.auth.admin.getUserById(
          referrerId
        );

        if (referrerUser?.email) {
          await resend.emails.send({
            from: "yetti AI <onboarding@resend.dev>",
            to: referrerUser.email,
            subject: "🎉 Someone signed up using your referral link!",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #5170ff;">Great news! 🎉</h2>
                <p>Someone just signed up using your referral link!</p>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Referral Code:</strong> ${referralCode}</p>
                  <p><strong>Status:</strong> Pending (will earn commission when they purchase a plan)</p>
                </div>
                <p>You'll earn 30% commission when they purchase a plan. Keep sharing your referral link to earn more!</p>
                <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://yetti.ai"}/dashboard/referrals" style="background: #5170ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Referrals Dashboard</a></p>
                <p>Best regards,<br>The yetti AI Team</p>
              </div>
            `,
          });
        }
      } catch (emailError) {
        console.error("Error sending referral signup email:", emailError);
        // Don't fail the referral linking if email fails
      }
    }

    return NextResponse.json({ success: true, referral });
  } catch (error) {
    console.error("Error linking referral:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

