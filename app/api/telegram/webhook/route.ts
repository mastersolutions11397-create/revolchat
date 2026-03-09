import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { TelegramWebhookUpdate } from "@/lib/types/chat";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN!;
const agentsApiUrl = process.env.NEXT_PUBLIC_AGENTS_API_URL || "http://127.0.0.1:8000";

// Create Supabase admin client (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to send message via Telegram Bot API
async function sendTelegramMessage(chatId: number, text: string) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Error sending Telegram message:", error);
      throw new Error("Failed to send Telegram message");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    throw error;
  }
}

// Helper function to get AI response from knowledge base
async function getAIResponse(message: string, workspaceId: string, userId: string): Promise<string> {
  try {
    const agentId = process.env.DEFAULT_AGENT_ID || "d7abb763-88eb-4b76-b07e-90055d5fbf23";
    const requestBody = {
      prompt: message,
      agent_id: agentId,
      user_id: userId,
      conversation_id: `telegram_${userId}`,
    };

    console.log("Sending AI request:", JSON.stringify(requestBody, null, 2));

    // The API expects form-urlencoded data, not JSON
    const formData = new URLSearchParams();
    formData.append('prompt', message);
    formData.append('agent_id', agentId);
    formData.append('user_id', userId);
    formData.append('conversation_id', `telegram_${userId}`);

    // Use the /agent/stream endpoint from your knowledge base API
    const response = await fetch(`${agentsApiUrl}/agent/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      console.error("Error getting AI response:", response.status, await response.text());
      return "Sorry, I'm having trouble processing your request right now. An admin will respond shortly.";
    }

    // For streaming endpoint, read the full stream
    const reader = response.body?.getReader();
    if (!reader) {
      return "Sorry, I couldn't get a response. An admin will help you shortly.";
    }

    const decoder = new TextDecoder();
    let fullResponse = "";
    let currentEvent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      // Parse SSE format: "event: token\ndata: text\n"
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.substring(7).trim();
        } else if (line.startsWith('data: ')) {
          // Only process tokens, skip the final "done" event with JSON
          if (currentEvent === 'token') {
            const token = line.substring(6);
            fullResponse += token;
          }
        }
      }
    }

    return fullResponse || "I received your message. An admin will respond shortly.";
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
    const messageText = message.text;
    const messageId = message.message_id.toString();

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
      // Get AI response
      const aiResponse = await getAIResponse(messageText, "", userId);

      // Send AI response via Telegram
      const sentMessage = await sendTelegramMessage(chatId, aiResponse);

      // Save AI response to database
      await saveMessage(
        session.id,
        aiResponse,
        "ai",
        "ai-bot",
        "AI Assistant",
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
