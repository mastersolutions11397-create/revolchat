import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Attachment, MessageType, TelegramWebhookUpdate } from "@/lib/types/chat";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const tgServerUrl = process.env.NEXT_PUBLIC_TG_SERVER_URL || "http://127.0.0.1:8000";

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

type BotTrigger = {
  id: string;
  bot_id: string | null;
  trigger_word: string;
  description: string | null;
  media_url: string;
  media_type: "image" | "video" | "audio" | "file";
  media_filename: string | null;
  media_size: number | null;
  is_active: boolean;
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
  const sanitized = text.replace(/<\/?([a-zA-Z_][a-zA-Z0-9_-]*)[^>]*>/g, (match, tagName) => {
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
const TELEGRAM_CAPTION_MAX_LENGTH = 1024;

function normalizeMessageWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function detectMediaTypeFromUrl(url: string): MessageType {
  const lowerUrl = url.toLowerCase();

  if (/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/.test(lowerUrl)) {
    return "image";
  }
  if (/\.(mp4|mov|avi|mkv|webm)(\?|$)/.test(lowerUrl)) {
    return "video";
  }
  if (/\.(mp3|wav|ogg|m4a)(\?|$)/.test(lowerUrl)) {
    return "audio";
  }

  return "file";
}

function extractMarkdownMedia(text: string): {
  cleanText: string;
  attachment: Attachment | null;
  messageType: MessageType;
} {
  const markdownImageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/i;
  const match = text.match(markdownImageRegex);

  if (!match) {
    return {
      cleanText: normalizeMessageWhitespace(text),
      attachment: null,
      messageType: "text",
    };
  }

  const [, altText, url] = match;
  const cleanText = normalizeMessageWhitespace(text.replace(markdownImageRegex, ""));
  const messageType = detectMediaTypeFromUrl(url);

  return {
    cleanText,
    attachment: {
      type: messageType,
      url,
      filename: altText?.trim() || undefined,
    },
    messageType,
  };
}

async function getActiveTriggersForBot(botId: string): Promise<BotTrigger[]> {
  const { data, error } = await supabase
    .from("trigger_words")
    .select("*")
    .eq("bot_id", botId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bot triggers:", error);
    return [];
  }

  return (data || []) as BotTrigger[];
}

function buildAIMessageWithTriggers(message: string, triggers: BotTrigger[]): string {
  if (triggers.length === 0) {
    return message;
  }

  const triggerList = triggers
    .map((trigger) => {
      const description = trigger.description?.trim() || "No description";
      return `${trigger.trigger_word} (${trigger.media_type}): ${description}`;
    })
    .join("\n");

  return [
    message,
    "",
    "SYSTEM INSTRUCTION:",
    "You can send media using the available trigger words below.",
    "If the user asks for a photo, video, audio, or file that matches one of them, reply with ONLY the exact trigger word and nothing else.",
    "If no trigger fits, answer normally.",
    "",
    "AVAILABLE TRIGGERS:",
    triggerList,
  ].join("\n");
}

function findTriggerInResponse(response: string, triggers: BotTrigger[]): BotTrigger | null {
  const normalized = response.trim().toLowerCase();

  for (const trigger of triggers) {
    if (normalized === trigger.trigger_word.toLowerCase()) {
      return trigger;
    }
  }

  return null;
}

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

async function sendTelegramMedia(
  chatId: number,
  attachment: Attachment,
  botToken: string,
  caption?: string
) {
  const methodMap: Record<"image" | "video" | "audio" | "file", { method: string; field: string }> = {
    image: { method: "sendPhoto", field: "photo" },
    video: { method: "sendVideo", field: "video" },
    audio: { method: "sendAudio", field: "audio" },
    file: { method: "sendDocument", field: "document" },
  };

  const mediaType = attachment.type === "image" || attachment.type === "video" || attachment.type === "audio"
    ? attachment.type
    : "file";
  const config = methodMap[mediaType];
  const trimmedCaption = caption?.trim().slice(0, TELEGRAM_CAPTION_MAX_LENGTH);
  const body: Record<string, unknown> = {
    chat_id: chatId,
    [config.field]: attachment.url,
  };

  if (trimmedCaption) {
    body.caption = trimmedCaption;
  }

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/${config.method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("Error sending Telegram media:", error);
    throw new Error("Failed to send Telegram media");
  }

  return response.json();
}

// Helper function to get AI response from knowledge base
async function getAIResponse(message: string, agentId: string, userId: string, triggers: BotTrigger[] = []): Promise<string> {
  try {
    const conversationId = `telegram_${userId}_${agentId}`;
    const requestBody = {
      agent_id: agentId,
      user_id: userId,
      message: buildAIMessageWithTriggers(message, triggers),
      conversation_id: conversationId,
    };

    console.log("Sending AI request to /telegram/chat:", JSON.stringify(requestBody, null, 2));

    // Use the new non-streaming /telegram/chat endpoint
    const response = await fetch(`${tgServerUrl}/telegram/chat`, {
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
  botId: string,
  firstName?: string,
  lastName?: string,
  username?: string
) {
  // Try to find existing session for this user + bot combination
  const { data: existingSession } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("platform", "telegram")
    .eq("external_user_id", externalUserId)
    .eq("bot_id", botId)
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
      bot_id: botId,
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
  platformMessageId?: string,
  messageType: MessageType = "text",
  attachments: Attachment[] = []
) {
  const { data: message, error } = await supabase
    .from("chat_messages")
    .insert({
      session_id: sessionId,
      message_text: messageText,
      message_type: messageType,
      sender_type: senderType,
      sender_id: senderId,
      sender_name: senderName,
      platform_message_id: platformMessageId,
      attachments,
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

    // Get bot_id from URL query parameter (each bot has its own webhook URL)
    const url = new URL(request.url);
    const botIdFromUrl = url.searchParams.get("bot_id");

    let matchedAgent: AgentBot | null = null;

    if (botIdFromUrl) {
      // Bot ID is in the URL - fetch that specific agent
      const { data: agent, error } = await supabase
        .from("agents")
        .select("*")
        .eq("id", botIdFromUrl)
        .not("telegram_bot_token", "is", null)
        .single();

      if (error || !agent) {
        console.error("Agent not found for bot_id:", botIdFromUrl, error);
        return NextResponse.json({ ok: true, message: "Bot not found" });
      }

      matchedAgent = agent as AgentBot;
    } else {
      // Fallback: Try to match by iterating through all bots (legacy support)
      // This is less reliable but maintains backwards compatibility
      const { data: agents, error: agentsError } = await supabase
        .from("agents")
        .select("*")
        .not("telegram_bot_token", "is", null);

      if (agentsError || !agents || agents.length === 0) {
        console.error("No agents with Telegram tokens found");
        return NextResponse.json({ ok: true, message: "No bot configured" });
      }

      // If there's only one bot, use it directly
      if (agents.length === 1) {
        matchedAgent = agents[0] as AgentBot;
      } else {
        // Multiple bots - try to find by sending typing action (less reliable)
        for (const agent of agents) {
          try {
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
              console.warn("Matched bot via typing action fallback - consider re-registering webhooks with bot_id");
              break;
            }
          } catch {
            continue;
          }
        }
      }
    }

    if (!matchedAgent) {
      console.error("Could not find matching agent for this chat");
      return NextResponse.json({ ok: true, message: "No matching bot found" });
    }

    console.log(`Matched agent: ${matchedAgent.name} (${matchedAgent.id})`);

    // Find or create chat session for this user + bot combination
    const session = await findOrCreateSession(
      userId,
      matchedAgent.id,
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
      const botTriggers = await getActiveTriggersForBot(matchedAgent.id);
      // Get AI response using the matched agent
      const aiResponse = await getAIResponse(messageText, matchedAgent.id, userId, botTriggers);
      const matchedTrigger = findTriggerInResponse(aiResponse, botTriggers);
      const triggerAttachment = matchedTrigger
        ? {
            type: matchedTrigger.media_type,
            url: matchedTrigger.media_url,
            filename: matchedTrigger.media_filename || undefined,
            size: matchedTrigger.media_size || undefined,
          }
        : null;
      const { cleanText, attachment, messageType } = matchedTrigger
        ? {
            cleanText: matchedTrigger.description?.trim() || "",
            attachment: triggerAttachment,
            messageType: matchedTrigger.media_type as MessageType,
          }
        : extractMarkdownMedia(aiResponse);
      const finalAttachment = attachment;

      // Send AI response via Telegram using the agent's bot token
      const sentMessage = finalAttachment
        ? await sendTelegramMedia(chatId, finalAttachment, matchedAgent.telegram_bot_token, cleanText)
        : await sendTelegramMessage(chatId, cleanText, matchedAgent.telegram_bot_token);

      // Save AI response to database
      await saveMessage(
        session.id,
        cleanText,
        "ai",
        matchedAgent.id,
        matchedAgent.name,
        sentMessage.result?.message_id?.toString(),
        messageType,
        finalAttachment ? [finalAttachment] : []
      );

      if (matchedTrigger) {
        await supabase.rpc("increment_trigger_word_usage", {
          trigger_id: matchedTrigger.id,
        });
      }

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
