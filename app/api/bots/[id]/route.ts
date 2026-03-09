import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

function maskSensitiveFields(data: Record<string, unknown>) {
  const out = { ...data };
  if (out.api_key) out.api_key = "***";
  if (out.telegram_bot_token) out.telegram_bot_token = "***";
  return out;
}

// GET /api/bots/[id] - Get a single bot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Bot not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(maskSensitiveFields(data));
  } catch (err) {
    console.error("Error getting bot:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get bot" },
      { status: 500 }
    );
  }
}

// PATCH /api/bots/[id] - Update a bot
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    const body = await request.json();

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.model !== undefined) updates.model = body.model;
    if (body.model_id !== undefined) updates.model_id = body.model_id?.trim() || null;
    if (body.system_prompt !== undefined) updates.system_prompt = body.system_prompt.trim();
    if (body.api_key !== undefined) updates.api_key = body.api_key.trim();
    if (body.telegram_bot_token !== undefined) updates.telegram_bot_token = body.telegram_bot_token || null;
    if (body.telegram_username !== undefined) updates.telegram_username = body.telegram_username?.trim() || null;
    if (body.telegram_first_name !== undefined) updates.telegram_first_name = body.telegram_first_name?.trim() || null;
    if (body.profile_picture_url !== undefined) updates.profile_picture_url = body.profile_picture_url || null;

    if (Object.keys(updates).length === 0) {
      // No updates, just return current bot
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return NextResponse.json({ error: "Bot not found" }, { status: 404 });
      }
      return NextResponse.json(maskSensitiveFields(data));
    }

    const { data, error } = await supabase
      .from("agents")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Bot not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(maskSensitiveFields(data));
  } catch (err) {
    console.error("Error updating bot:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update bot" },
      { status: 500 }
    );
  }
}

// DELETE /api/bots/[id] - Delete a bot
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("agents")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Bot not found" }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Bot deleted", id });
  } catch (err) {
    console.error("Error deleting bot:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete bot" },
      { status: 500 }
    );
  }
}
