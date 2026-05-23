import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser, jsonError } from "@/lib/api-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const tgServerUrl = process.env.NEXT_PUBLIC_TG_SERVER_URL || "http://127.0.0.1:8000";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function getBot(botId: string) {
  const { data, error } = await supabase
    .from("agents")
    .select("id, name, workspace_id, profile_picture_url")
    .eq("id", botId)
    .single();

  if (error || !data?.workspace_id) {
    const err = new Error("Bot not found");
    (err as Error & { status?: number }).status = 404;
    throw err;
  }

  return data;
}

async function findOrCreateWebSession(bot: {
  id: string;
  workspace_id: string;
}, user: { id: string; email: string | null }) {
  const { data: existing } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("platform", "web")
    .eq("external_user_id", user.id)
    .eq("bot_id", bot.id)
    .maybeSingle();

  if (existing) {
    const { data: updated, error } = await supabase
      .from("chat_sessions")
      .update({
        is_online: true,
        last_activity_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  }

  const { data: created, error } = await supabase
    .from("chat_sessions")
    .insert({
      workspace_id: bot.workspace_id,
      user_id: user.id,
      external_user_id: user.id,
      external_username: user.email,
      external_first_name: user.email?.split("@")[0] ?? "Website visitor",
      platform: "web",
      bot_id: bot.id,
      ai_mode: true,
      is_online: true,
      session_status: "active",
      last_activity_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      metadata: { source: "web_embed" },
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

async function getMessages(sessionId: string) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function getAIResponse(message: string, botId: string, userId: string) {
  try {
    const response = await fetch(`${tgServerUrl}/telegram/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent_id: botId,
        user_id: userId,
        message,
        conversation_id: `web_${userId}_${botId}`,
      }),
    });

    if (!response.ok) {
      console.error("Web embed AI request failed:", response.status, await response.text());
      return "Sorry, I am having trouble responding right now.";
    }

    const data = await response.json();
    return data.response || "I received your message.";
  } catch (error) {
    console.error("Web embed AI request failed:", error);
    return "Sorry, I am having trouble responding right now.";
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  try {
    const { botId } = await params;
    const bot = await getBot(botId);

    let session = null;
    let messages: unknown[] = [];
    try {
      const user = await getAuthenticatedUser(request);
      session = await findOrCreateWebSession(bot, user);
      messages = await getMessages(session.id);
    } catch {
      // Public bot metadata is still available before sign-in.
    }

    return NextResponse.json({
      bot: {
        id: bot.id,
        name: bot.name,
        profile_picture_url: bot.profile_picture_url,
      },
      session,
      messages,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  try {
    const { botId } = await params;
    const user = await getAuthenticatedUser(request);
    const bot = await getBot(botId);
    const body = await request.json();
    const messageText = typeof body.message === "string" ? body.message.trim() : "";

    if (!messageText) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const session = await findOrCreateWebSession(bot, user);

    const { data: userMessage, error: userMessageError } = await supabase
      .from("chat_messages")
      .insert({
        session_id: session.id,
        workspace_id: bot.workspace_id,
        message_text: messageText,
        message_type: "text",
        sender_type: "user",
        sender_id: user.id,
        sender_name: user.email ?? "Website visitor",
        is_read: false,
        metadata: { source: "web_embed" },
      })
      .select()
      .single();
    if (userMessageError) throw userMessageError;

    await supabase
      .from("chat_sessions")
      .update({
        last_activity_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        is_online: true,
      })
      .eq("id", session.id);

    const aiText = await getAIResponse(messageText, bot.id, user.id);
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from("chat_messages")
      .insert({
        session_id: session.id,
        workspace_id: bot.workspace_id,
        message_text: aiText,
        message_type: "text",
        sender_type: "ai",
        sender_id: bot.id,
        sender_name: bot.name,
        is_read: true,
        metadata: { source: "web_embed" },
      })
      .select()
      .single();
    if (aiMessageError) throw aiMessageError;

    return NextResponse.json({
      session,
      messages: [userMessage, aiMessage],
    });
  } catch (error) {
    return jsonError(error);
  }
}
