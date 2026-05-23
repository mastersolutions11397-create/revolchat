import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser, jsonError, requireWorkspaceRole } from "@/lib/api-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Get the base URL for webhook registration
function getWebhookUrl(): string {
  // In production, use the actual domain
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/telegram/webhook`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`;
  }
  return "";
}

// Register webhook for a Telegram bot
async function registerTelegramWebhook(botToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    const webhookUrl = getWebhookUrl();

    // Skip webhook registration for localhost
    if (!webhookUrl || webhookUrl.includes("localhost")) {
      console.log("Skipping webhook registration - no production URL configured");
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

// Remove webhook for a Telegram bot
async function removeTelegramWebhook(botToken: string): Promise<void> {
  try {
    await fetch(
      `https://api.telegram.org/bot${botToken}/deleteWebhook`,
      { method: "POST" }
    );
  } catch (err) {
    console.error("Error removing webhook:", err);
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

async function requireBotAccess(request: NextRequest, botId: string) {
  const user = await getAuthenticatedUser(request);
  const supabase = getSupabase();
  const { data: bot, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", botId)
    .single();

  if (error || !bot) {
    const err = new Error("Bot not found");
    (err as Error & { status?: number }).status = 404;
    throw err;
  }
  if (!bot.workspace_id) {
    const err = new Error("Bot is not assigned to a workspace");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }

  const membership = await requireWorkspaceRole(bot.workspace_id, user.id, [
    "owner",
    "admin",
    "member",
  ]);
  if (membership.role === "member") {
    const allowedIds = membership.allowed_bot_ids ?? [];
    if (!allowedIds.includes(bot.id)) {
      const err = new Error("You do not have access to this bot");
      (err as Error & { status?: number }).status = 403;
      throw err;
    }
  }

  return bot;
}

// GET /api/bots/[id] - Get a single bot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await requireBotAccess(request, id);

    return NextResponse.json(maskSensitiveFields(data));
  } catch (err) {
    console.error("Error getting bot:", err);
    return jsonError(err);
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
    await requireBotAccess(request, id);
    const body = await request.json();

    if (
      body.model !== undefined &&
      !["openai", "deepseek", "gemini"].includes(body.model)
    ) {
      return NextResponse.json({ error: "Valid model is required" }, { status: 400 });
    }

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

    // Re-register webhook if Telegram token was updated
    let webhookRegistered = false;
    if (updates.telegram_bot_token && data.telegram_bot_token) {
      const webhookResult = await registerTelegramWebhook(data.telegram_bot_token);
      webhookRegistered = webhookResult.success;
    }

    return NextResponse.json({ ...maskSensitiveFields(data), webhook_registered: webhookRegistered });
  } catch (err) {
    console.error("Error updating bot:", err);
    return jsonError(err);
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
    await requireBotAccess(request, id);

    // Get the bot first to remove webhook
    const { data: existingBot } = await supabase
      .from("agents")
      .select("telegram_bot_token")
      .eq("id", id)
      .single();

    // Remove dependent rows first. `chat_sessions.bot_id` uses `ON DELETE SET NULL`,
    // but that can violate the per-bot unique constraint when multiple sessions would
    // collapse to the same `(platform, external_user_id, NULL)` key.
    const { error: triggerWordsError } = await supabase
      .from("trigger_words")
      .delete()
      .eq("bot_id", id);

    if (triggerWordsError) {
      return NextResponse.json({ error: triggerWordsError.message }, { status: 500 });
    }

    const { error: chatSessionsError } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("bot_id", id);

    if (chatSessionsError) {
      return NextResponse.json({ error: chatSessionsError.message }, { status: 500 });
    }

    const { error } = await supabase
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

    // Remove webhook if bot had a Telegram token
    if (existingBot?.telegram_bot_token) {
      await removeTelegramWebhook(existingBot.telegram_bot_token);
    }

    return NextResponse.json({ message: "Bot deleted", id });
  } catch (err) {
    console.error("Error deleting bot:", err);
    return jsonError(err);
  }
}
