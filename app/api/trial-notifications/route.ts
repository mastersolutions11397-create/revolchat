import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/api-auth";

// GET — fetch notifications for the authenticated admin (latest 50)
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    const { data, error } = await supabaseAdmin
      .from("end_user_trial_notifications")
      .select(
        "id, trial_id, bot_id, bot_name, platform, platform_user_id, notification_type, read_at, created_at"
      )
      .eq("admin_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notifications: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

// PATCH — mark notification(s) as read
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();
    const ids: string[] = Array.isArray(body.ids) ? body.ids : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: "ids array required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("end_user_trial_notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", ids)
      .eq("admin_user_id", user.id); // scoped to this admin only

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
