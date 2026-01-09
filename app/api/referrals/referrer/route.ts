import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Get the referral code that was used to refer the current user
 */
export async function GET(request: NextRequest) {
  try {
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

    // Get referral where the current user is the referee
    const { data: referral, error: referralError } = await supabaseAdmin
      .from("referrals")
      .select("referral_code, created_at")
      .eq("referee_id", userId)
      .maybeSingle();

    if (referralError) {
      console.error("Error fetching referrer:", referralError);
      return NextResponse.json(
        { error: "Failed to fetch referrer" },
        { status: 500 }
      );
    }

    return NextResponse.json({ referral });
  } catch (error) {
    console.error("Error in referrer endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
