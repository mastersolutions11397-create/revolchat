import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Get commission history
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

    const { data: commissions, error: commissionsError } = await supabaseAdmin
      .from("referral_commissions")
      .select("*")
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false });

    if (commissionsError) {
      console.error("Error fetching commissions:", commissionsError);
      return NextResponse.json(
        { error: "Failed to fetch commissions" },
        { status: 500 }
      );
    }

    // Get referee emails
    const commissionsWithEmails = await Promise.all(
      (commissions || []).map(async (commission) => {
        const { data: refereeUser } = await supabaseAdmin.auth.admin.getUserById(
          commission.referee_id
        );
        return {
          ...commission,
          referee_email: refereeUser?.user?.email || "Unknown",
        };
      })
    );

    return NextResponse.json({ commissions: commissionsWithEmails });
  } catch (error) {
    console.error("Error in commissions endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

