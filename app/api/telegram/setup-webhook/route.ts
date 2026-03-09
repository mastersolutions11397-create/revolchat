import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

type SetupWebhookBody = {
  agent_id?: string;
  webhook_url: string;
};

// POST /api/telegram/setup-webhook - Set up webhook for a bot or all bots
export async function POST(request: NextRequest) {
  try {
    const body: SetupWebhookBody = await request.json();
    const { agent_id, webhook_url } = body;

    if (!webhook_url) {
      return NextResponse.json({ error: "webhook_url is required" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Get agent(s) to set up webhooks for
    let query = supabase
      .from("agents")
      .select("id, name, telegram_bot_token, telegram_username")
      .not("telegram_bot_token", "is", null);

    if (agent_id) {
      query = query.eq("id", agent_id);
    }

    const { data: agents, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!agents || agents.length === 0) {
      return NextResponse.json({ error: "No agents with Telegram tokens found" }, { status: 404 });
    }

    const results = [];

    for (const agent of agents) {
      try {
        // Set webhook for this bot
        const response = await fetch(
          `https://api.telegram.org/bot${agent.telegram_bot_token}/setWebhook`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: webhook_url }),
          }
        );

        const data = await response.json();

        results.push({
          agent_id: agent.id,
          agent_name: agent.name,
          telegram_username: agent.telegram_username,
          success: data.ok === true,
          description: data.description || null,
        });
      } catch (err) {
        results.push({
          agent_id: agent.id,
          agent_name: agent.name,
          telegram_username: agent.telegram_username,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const allSuccess = results.every((r) => r.success);

    return NextResponse.json({
      success: allSuccess,
      webhook_url,
      results,
    });
  } catch (err) {
    console.error("Error setting up webhooks:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to set up webhooks" },
      { status: 500 }
    );
  }
}

// GET /api/telegram/setup-webhook - Get webhook info for all bots
export async function GET() {
  try {
    const supabase = getSupabase();

    const { data: agents, error } = await supabase
      .from("agents")
      .select("id, name, telegram_bot_token, telegram_username")
      .not("telegram_bot_token", "is", null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!agents || agents.length === 0) {
      return NextResponse.json({ agents: [], message: "No agents with Telegram tokens" });
    }

    const results = [];

    for (const agent of agents) {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${agent.telegram_bot_token}/getWebhookInfo`
        );
        const data = await response.json();

        results.push({
          agent_id: agent.id,
          agent_name: agent.name,
          telegram_username: agent.telegram_username,
          webhook_url: data.result?.url || null,
          pending_update_count: data.result?.pending_update_count || 0,
          last_error_message: data.result?.last_error_message || null,
          last_error_date: data.result?.last_error_date || null,
        });
      } catch (err) {
        results.push({
          agent_id: agent.id,
          agent_name: agent.name,
          telegram_username: agent.telegram_username,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({ agents: results });
  } catch (err) {
    console.error("Error getting webhook info:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get webhook info" },
      { status: 500 }
    );
  }
}
