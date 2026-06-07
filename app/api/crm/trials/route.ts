import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/api-auth";

// GET /api/crm/trials — all end_user_trials for bots owned by this admin
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    // Fetch all bot IDs belonging to this admin
    const { data: bots, error: botsErr } = await supabaseAdmin
      .from("agents")
      .select("id, name")
      .eq("user_id", user.id);

    if (botsErr) {
      return NextResponse.json({ error: botsErr.message }, { status: 500 });
    }
    if (!bots || bots.length === 0) {
      return NextResponse.json({ trials: [] });
    }

    const botIds = bots.map((b) => b.id);
    const botNameMap = Object.fromEntries(bots.map((b) => [b.id, b.name]));

    // Fetch all trials for those bots
    const { data: trials, error: trialsErr } = await supabaseAdmin
      .from("end_user_trials")
      .select("id, bot_id, platform, platform_user_id, trial_start_at, trial_end_at, status, admin_notified_at, created_at")
      .in("bot_id", botIds)
      .order("created_at", { ascending: false })
      .limit(500);

    if (trialsErr) {
      return NextResponse.json({ error: trialsErr.message }, { status: 500 });
    }

    const enriched = (trials ?? []).map((t) => ({
      ...t,
      bot_name: botNameMap[t.bot_id] ?? "Unknown bot",
    }));

    return NextResponse.json({ trials: enriched });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
