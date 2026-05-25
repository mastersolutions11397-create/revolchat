import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser, jsonError, type AuthenticatedUser } from "@/lib/api-auth";
import type { Attachment, MessageType } from "@/lib/types/chat";

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
}, user: AuthenticatedUser) {
  const displayName = user.name || user.email?.split("@")[0] || "Website visitor";

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
        external_username: user.email,
        external_first_name: displayName,
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
      user_id: user.id,
      external_user_id: user.id,
      external_username: user.email,
      external_first_name: displayName,
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
    let visitor = null;
    try {
      const user = await getAuthenticatedUser(request);
      session = await findOrCreateWebSession(bot, user);
      messages = await getMessages(session.id);
      visitor = {
        name: user.name || user.email?.split("@")[0] || "Website visitor",
        email: user.email,
        avatarUrl: user.avatarUrl ?? null,
      };
    } catch {
      // Public bot metadata is still available before sign-in.
    }

    return NextResponse.json({
      bot: {
        id: bot.id,
        name: bot.name,
        profile_picture_url: bot.profile_picture_url,
      },
      visitor,
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
    const attachments: Attachment[] = Array.isArray(body.attachments) ? body.attachments : [];
    const messageType: MessageType =
      typeof body.message_type === "string" ? body.message_type : attachments[0]?.type || "text";

    if (!messageText && attachments.length === 0) {
      return NextResponse.json(
        { error: "message or attachment is required" },
        { status: 400 }
      );
    }

    const session = await findOrCreateWebSession(bot, user);

    const { data: userMessage, error: userMessageError } = await supabase
      .from("chat_messages")
      .insert({
        session_id: session.id,
        message_text: messageText,
        message_type: messageType,
        sender_type: "user",
        sender_id: user.id,
        sender_name: user.name || user.email || "Website visitor",
        attachments,
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

    const aiPrompt = messageText || `The visitor sent a ${messageType} attachment.`;
    const aiText = await getAIResponse(aiPrompt, bot.id, user.id);
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from("chat_messages")
      .insert({
        session_id: session.id,
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
