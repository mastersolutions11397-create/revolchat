import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Get list of referrals
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

    // Get referrals with referee email
    const { data: referrals, error: referralsError } = await supabaseAdmin
      .from("referrals")
      .select("*")
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false });

    if (referralsError) {
      console.error("Error fetching referrals:", referralsError);
      return NextResponse.json(
        { error: "Failed to fetch referrals" },
        { status: 500 }
      );
    }

    // Get referee emails
    const referralsWithEmails = await Promise.all(
      (referrals || []).map(async (referral) => {
        const { data: refereeUser } = await supabaseAdmin.auth.admin.getUserById(
          referral.referee_id
        );
        return {
          ...referral,
          referee_email: refereeUser?.user?.email || "Unknown",
        };
      })
    );

    return NextResponse.json({ referrals: referralsWithEmails });
  } catch (error) {
    console.error("Error in list endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

