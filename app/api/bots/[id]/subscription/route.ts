import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/api-auth";

type Params = Promise<{ id: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  try {
    const user = await getAuthenticatedUser(_req);
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("agents")
      .select("id, subscription_enabled, end_user_price_cents, trial_days")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  try {
    const user = await getAuthenticatedUser(req);
    const { id } = await params;

    // Verify ownership
    const { data: bot, error: fetchErr } = await supabaseAdmin
      .from("agents")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchErr || !bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }
    if (bot.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const patch: Record<string, unknown> = {};

    if (typeof body.subscription_enabled === "boolean")
      patch.subscription_enabled = body.subscription_enabled;
    if (typeof body.end_user_price_cents === "number" && body.end_user_price_cents > 0)
      patch.end_user_price_cents = body.end_user_price_cents;
    if (typeof body.trial_days === "number" && body.trial_days > 0)
      patch.trial_days = body.trial_days;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { error: updateErr } = await supabaseAdmin
      .from("agents")
      .update(patch)
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
