import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateReferralCode } from "@/lib/utils/referral-code";

/**
 * Get or create user's referral profile
 * This endpoint will be called by the frontend, which will then call the backend API
 * For now, we'll use direct Supabase access for this internal operation
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from auth token
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from token (simplified - in production, verify JWT properly)
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Get or create profile
    let { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    // Create profile if it doesn't exist
    if (!profile) {
      // Generate referral code from user email or metadata
      const username = user.email?.split("@")[0] || "USER";
      let referralCode = generateReferralCode(username);

      // Ensure uniqueness
      let attempts = 0;
      while (attempts < 10) {
        const { data: existing } = await supabaseAdmin
          .from("user_profiles")
          .select("referral_code")
          .eq("referral_code", referralCode)
          .maybeSingle();

        if (!existing) {
          break; // Code is unique
        }

        // Regenerate with different suffix
        referralCode = generateReferralCode(username);
        attempts++;
      }

      const { data: newProfile, error: createError } = await supabaseAdmin
        .from("user_profiles")
        .insert({
          user_id: userId,
          referral_code: referralCode,
          total_earnings: 0,
          total_referrals: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating profile:", createError);
        return NextResponse.json(
          { error: "Failed to create profile" },
          { status: 500 }
        );
      }

      profile = newProfile;
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error in profile endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

