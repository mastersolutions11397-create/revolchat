import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { getAuthenticatedUser, jsonError, requireWorkspaceRole } from "@/lib/api-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Get the base URL for webhook registration
async function getBaseWebhookUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || "http";

  // In production, use the actual domain
  // Check for common production indicators
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/telegram/webhook`;
  }

  return `${protocol}://${host}/api/telegram/webhook`;
}

// Register webhook for a Telegram bot with bot_id in URL
async function registerTelegramWebhook(botToken: string, botId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = await getBaseWebhookUrl();
    // Include bot_id in webhook URL so we know which bot received the message
    const webhookUrl = `${baseUrl}?bot_id=${botId}`;

    // Skip webhook registration for localhost (won't work anyway)
    if (webhookUrl.includes("localhost")) {
      console.log("Skipping webhook registration for localhost - use ngrok and setup script");
      return { success: true };
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl }),
      }
    );

    const data = await response.json();

    if (data.ok) {
      console.log(`Webhook registered successfully: ${webhookUrl}`);
      return { success: true };
    } else {
      console.error("Failed to register webhook:", data.description);
      return { success: false, error: data.description };
    }
  } catch (err) {
    console.error("Error registering webhook:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

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
    const user = await getAuthenticatedUser(request);
    const workspaceId = searchParams.get("workspace_id");

    if (!workspaceId) {
      return NextResponse.json({ agents: [], count: 0 });
    }

    const membership = await requireWorkspaceRole(workspaceId, user.id, [
      "owner",
      "admin",
      "member",
    ]);

    let query = supabase.from("agents").select("*").eq("workspace_id", workspaceId);
    if (membership.role === "member") {
      const allowedIds = membership.allowed_bot_ids ?? [];
      if (!allowedIds.length) {
        return NextResponse.json({ agents: [], count: 0 });
      }
      query = query.in("id", allowedIds);
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
      workspace_id: agent.workspace_id || null,
      created_at: agent.created_at,
      updated_at: agent.updated_at,
    }));

    return NextResponse.json({ agents, count: agents.length });
  } catch (err) {
    console.error("Error listing bots:", err);
    return jsonError(err);
  }
}

// POST /api/bots - Create a new bot
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const user = await getAuthenticatedUser(request);
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
    const workspaceId = typeof body.workspace_id === "string" ? body.workspace_id : "";
    if (!workspaceId) {
      return NextResponse.json({ error: "workspace_id is required" }, { status: 400 });
    }
    await requireWorkspaceRole(workspaceId, user.id, ["owner", "admin"]);

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
      user_id: user.id,
      workspace_id: workspaceId,
    };

    const { data, error } = await supabase
      .from("agents")
      .insert(row)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto-register webhook if Telegram bot token is provided
    let webhookRegistered = false;
    if (row.telegram_bot_token) {
      const webhookResult = await registerTelegramWebhook(row.telegram_bot_token, data.id);
      webhookRegistered = webhookResult.success;
      if (!webhookResult.success) {
        console.warn(`Webhook registration failed for bot ${data.id}: ${webhookResult.error}`);
      }
    }

    return NextResponse.json(
      { ...maskSensitiveFields(data), webhook_registered: webhookRegistered },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating bot:", err);
    return jsonError(err);
  }
}
