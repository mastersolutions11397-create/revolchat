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

// GET /api/bots - List all bots
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    let query = supabase.from("agents").select("*");
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Normalize response for backwards compatibility
    const agents = (data || []).map((agent) => ({
      id: agent.id,
      name: agent.name,
      model: agent.model,
      model_id: agent.model_id,
      system_prompt: agent.system_prompt || "",
      telegram_username: agent.telegram_username || null,
      telegram_first_name: agent.telegram_first_name || null,
      profile_picture_url: agent.profile_picture_url || null,
      user_id: agent.user_id || null,
      created_at: agent.created_at,
      updated_at: agent.updated_at,
    }));

    return NextResponse.json({ agents, count: agents.length });
  } catch (err) {
    console.error("Error listing bots:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list bots" },
      { status: 500 }
    );
  }
}

// POST /api/bots - Create a new bot
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!body.model || !["openai", "deepseek", "gemini"].includes(body.model)) {
      return NextResponse.json({ error: "Valid model is required" }, { status: 400 });
    }
    if (!body.api_key || body.api_key.trim().length === 0) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    const row = {
      name: body.name.trim(),
      model: body.model,
      model_id: body.model_id?.trim() || null,
      system_prompt: body.system_prompt?.trim() || "",
      api_key: body.api_key.trim(),
      telegram_bot_token: body.telegram_bot_token || null,
      telegram_username: body.telegram_username?.trim() || null,
      telegram_first_name: body.telegram_first_name?.trim() || null,
      profile_picture_url: body.profile_picture_url || null,
      user_id: body.user_id || null,
    };

    const { data, error } = await supabase
      .from("agents")
      .insert(row)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(maskSensitiveFields(data), { status: 201 });
  } catch (err) {
    console.error("Error creating bot:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create bot" },
      { status: 500 }
    );
  }
}
