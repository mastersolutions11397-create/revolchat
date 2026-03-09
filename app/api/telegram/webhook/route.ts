import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { TelegramWebhookUpdate } from "@/lib/types/chat";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const agentsApiUrl = process.env.NEXT_PUBLIC_AGENTS_API_URL || "http://127.0.0.1:8000";

type AgentBot = {
  id: string;
  name: string;
  model: string;
  model_id: string | null;
  system_prompt: string;
  api_key: string;
  telegram_bot_token: string;
  telegram_username: string | null;
  telegram_first_name: string | null;
};

// Create Supabase admin client (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to find agent/bot by Telegram bot username
async function findAgentByTelegramBot(botUsername: string): Promise<AgentBot | null> {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("telegram_username", botUsername)
    .single();

  if (error || !data) {
    console.error("Agent not found for bot:", botUsername, error);
    return null;
  }

  return data as AgentBot;
}

// Helper function to strip unsupported HTML/XML tags from text
function sanitizeForTelegram(text: string): string {
  // Remove any XML-like tags that Telegram doesn't support
  // Telegram HTML only supports: <b>, <i>, <u>, <s>, <code>, <pre>, <a>, <tg-spoiler>, <tg-emoji>
  const supportedTags = ['b', 'i', 'u', 's', 'code', 'pre', 'a', 'tg-spoiler', 'tg-emoji', 'strong', 'em'];

  // Replace unsupported tags with their content
  let sanitized = text.replace(/<\/?([a-zA-Z_][a-zA-Z0-9_-]*)[^>]*>/g, (match, tagName) => {
    const tag = tagName.toLowerCase();
    if (supportedTags.includes(tag)) {
      return match; // Keep supported tags
    }
    return ''; // Remove unsupported tags
  });

  // Also escape any remaining < or > that might cause issues
  // But only if they're not part of valid HTML tags
  return sanitized;
}

// Telegram max message length
const TELEGRAM_MAX_LENGTH = 4096;

// Helper function to split text into chunks for Telegram
function splitMessageForTelegram(text: string, maxLength: number = TELEGRAM_MAX_LENGTH): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    // Try to split at a newline or space
    let splitIndex = remaining.lastIndexOf('\n', maxLength);
    if (splitIndex === -1 || splitIndex < maxLength / 2) {
      splitIndex = remaining.lastIndexOf(' ', maxLength);
    }
    if (splitIndex === -1 || splitIndex < maxLength / 2) {
      splitIndex = maxLength;
    }

    chunks.push(remaining.substring(0, splitIndex));
    remaining = remaining.substring(splitIndex).trimStart();
  }

  return chunks;
}

// Helper function to send message via Telegram Bot API
async function sendTelegramMessage(chatId: number, text: string, botToken: string) {
  try {
    // Strip ALL HTML/XML tags for plain text to avoid parsing issues
    const plainText = text.replace(/<[^>]*>/g, '');

    // Split long messages into chunks
    const chunks = splitMessageForTelegram(plainText);
    let lastResponse = null;

    for (const chunk of chunks) {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: chunk,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Error sending Telegram message:", error);
        throw new Error("Failed to send Telegram message");
      }

      lastResponse = await response.json();

      // Small delay between chunks to avoid rate limiting
      if (chunks.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return lastResponse;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    throw error;
  }
}

// Helper function to get AI response from knowledge base
async function getAIResponse(message: string, agentId: string, userId: string): Promise<string> {
  try {
    const conversationId = `telegram_${userId}_${agentId}`;
    const requestBody = {
      agent_id: agentId,
      user_id: userId,
      message: message,
      conversation_id: conversationId,
    };

    console.log("Sending AI request to /telegram/chat:", JSON.stringify(requestBody, null, 2));

    // Use the new non-streaming /telegram/chat endpoint
    const response = await fetch(`${agentsApiUrl}/telegram/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error getting AI response:", response.status, errorText);
      return "Sorry, I'm having trouble processing your request right now. An admin will respond shortly.";
    }

    const data = await response.json();
    return data.response || "I received your message. An admin will respond shortly.";
  } catch (error) {
    console.error("Error getting AI response:", error);
    return "Sorry, I'm having trouble processing your request right now. An admin will respond shortly.";
  }
}

// Helper function to find or create chat session
async function findOrCreateSession(
  externalUserId: string,
  firstName?: string,
  lastName?: string,
  username?: string
) {
  // Try to find existing session
  const { data: existingSession } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("platform", "telegram")
    .eq("external_user_id", externalUserId)
    .single();

  if (existingSession) {
    // Update last activity and online status
    const { data: updatedSession } = await supabase
      .from("chat_sessions")
      .update({
        is_online: true,
        last_activity_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", existingSession.id)
      .select()
      .single();

    return updatedSession;
  }

  // Create new session
  const { data: newSession, error } = await supabase
    .from("chat_sessions")
    .insert({
      external_user_id: externalUserId,
      external_first_name: firstName,
      external_last_name: lastName,
      external_username: username,
      platform: "telegram",
      ai_mode: true, // Start with AI mode enabled
      is_online: true,
      session_status: "active",
      last_activity_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create chat session");
  }

  return newSession;
}

// Helper function to save message to database
async function saveMessage(
  sessionId: string,
  messageText: string,
  senderType: "user" | "admin" | "ai",
  senderId?: string,
  senderName?: string,
  platformMessageId?: string
) {
  const { data: message, error } = await supabase
    .from("chat_messages")
    .insert({
      session_id: sessionId,
      message_text: messageText,
      message_type: "text",
      sender_type: senderType,
      sender_id: senderId,
      sender_name: senderName,
      platform_message_id: platformMessageId,
      is_read: senderType !== "user", // Auto-mark admin/AI messages as read
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving message:", error);
    throw new Error("Failed to save message");
  }

  return message;
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramWebhookUpdate = await request.json();
    console.log("Received Telegram webhook update:", JSON.stringify(update, null, 2));

    // Only handle text messages for now
    if (!update.message?.text) {
      return NextResponse.json({ ok: true, message: "No text message" });
    }

    const { message } = update;
    const chatId = message.chat.id;
    const userId = message.from.id.toString();
    const messageText = message.text!;
    const messageId = message.message_id.toString();

    // Get the bot username from the update (the bot that received this message)
    // For direct messages, we need to look up by the bot info in the message
    // The bot's username comes from message.entities or we need to get it via getMe
    // For simplicity, let's try to find by checking which bot token matches this chat

    // First, try to find the agent by checking all bots with telegram tokens
    const { data: agents, error: agentsError } = await supabase
      .from("agents")
      .select("*")
      .not("telegram_bot_token", "is", null);

    if (agentsError || !agents || agents.length === 0) {
      console.error("No agents with Telegram tokens found");
      return NextResponse.json({ ok: true, message: "No bot configured" });
    }

    // Find the agent whose bot received this message by checking getMe for each
    let matchedAgent: AgentBot | null = null;
    for (const agent of agents) {
      try {
        const getMeResponse = await fetch(
          `https://api.telegram.org/bot${agent.telegram_bot_token}/getMe`
        );
        const getMeData = await getMeResponse.json();
        if (getMeData.ok) {
          // Check if this webhook came from this bot by trying to send a typing action
          // This is a lightweight way to verify the bot can interact with this chat
          const chatResponse = await fetch(
            `https://api.telegram.org/bot${agent.telegram_bot_token}/sendChatAction`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, action: "typing" }),
            }
          );
          if (chatResponse.ok) {
            matchedAgent = agent as AgentBot;
            break;
          }
        }
      } catch {
        continue;
      }
    }

    if (!matchedAgent) {
      console.error("Could not find matching agent for this chat");
      return NextResponse.json({ ok: true, message: "No matching bot found" });
    }

    console.log(`Matched agent: ${matchedAgent.name} (${matchedAgent.id})`);

    // Find or create chat session
    const session = await findOrCreateSession(
      userId,
      message.from.first_name,
      message.from.last_name,
      message.from.username
    );

    // Save user message
    await saveMessage(
      session.id,
      messageText,
      "user",
      userId,
      message.from.first_name,
      messageId
    );

    // Check if AI mode is enabled
    if (session.ai_mode) {
      // Get AI response using the matched agent
      const aiResponse = await getAIResponse(messageText, matchedAgent.id, userId);

      // Send AI response via Telegram using the agent's bot token
      const sentMessage = await sendTelegramMessage(chatId, aiResponse, matchedAgent.telegram_bot_token);

      // Save AI response to database
      await saveMessage(
        session.id,
        aiResponse,
        "ai",
        matchedAgent.id,
        matchedAgent.name,
        sentMessage.result?.message_id?.toString()
      );

      // Update last AI response time
      await supabase
        .from("chat_sessions")
        .update({
          last_ai_response_at: new Date().toISOString(),
        })
        .eq("id", session.id);
    }
    // AI mode is off - no auto-reply, admin will respond manually

    return NextResponse.json({ ok: true, message: "Message processed" });
  } catch (error) {
    console.error("Error processing Telegram webhook:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Telegram webhook endpoint is active",
    timestamp: new Date().toISOString()
  });
}
