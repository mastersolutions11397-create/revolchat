import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Attachment, MessageType } from "@/lib/types/chat";
import { getAuthenticatedUser, jsonError, requireWorkspaceRole } from "@/lib/api-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to check if a string is an image URL
function isImageUrl(text: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const lowerText = text.toLowerCase();
  return imageExtensions.some(ext => lowerText.includes(ext)) &&
         (lowerText.startsWith('http://') || lowerText.startsWith('https://'));
}

// Helper function to check if a string is a video URL
function isVideoUrl(text: string): boolean {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
  const lowerText = text.toLowerCase();
  return videoExtensions.some(ext => lowerText.includes(ext)) &&
         (lowerText.startsWith('http://') || lowerText.startsWith('https://'));
}

// Helper function to send photo via Telegram Bot API
async function sendTelegramPhoto(chatId: string, photoUrl: string, botToken: string) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendPhoto`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoUrl,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Error sending Telegram photo:", error);
      throw new Error("Failed to send Telegram photo");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending Telegram photo:", error);
    throw error;
  }
}

// Helper function to send video via Telegram Bot API
async function sendTelegramVideo(chatId: string, videoUrl: string, botToken: string) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendVideo`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          video: videoUrl,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Error sending Telegram video:", error);
      throw new Error("Failed to send Telegram video");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending Telegram video:", error);
    throw error;
  }
}

function getDocumentFilename(documentUrl: string, providedFilename?: string): string {
  if (providedFilename?.trim()) {
    return providedFilename.trim();
  }

  try {
    const pathname = new URL(documentUrl).pathname;
    const lastSegment = pathname.split("/").pop();
    return lastSegment || "document";
  } catch {
    return "document";
  }
}

async function sendTelegramDocument(
  chatId: string,
  documentUrl: string,
  botToken: string,
  caption?: string,
  filename?: string
) {
  try {
    const fileResponse = await fetch(documentUrl);

    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch document for Telegram upload: ${fileResponse.status}`);
    }

    const fileBlob = await fileResponse.blob();
    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append(
      "document",
      fileBlob,
      getDocumentFilename(documentUrl, filename)
    );

    if (caption?.trim()) {
      formData.append("caption", caption.trim());
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendDocument`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Error sending Telegram document:", error);
      throw new Error("Failed to send Telegram document");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending Telegram document:", error);
    throw error;
  }
}

async function sendTelegramAudio(chatId: string, audioUrl: string, botToken: string) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendAudio`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          audio: audioUrl,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Error sending Telegram audio:", error);
      throw new Error("Failed to send Telegram audio");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending Telegram audio:", error);
    throw error;
  }
}

// Helper function to send message via Telegram Bot API
async function sendTelegramMessage(chatId: string, text: string, botToken: string) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      session_id,
      message_text = "",
      message_type = "text",
      attachments = [],
      sender_type = "admin",
    }: {
      session_id?: string;
      message_text?: string;
      message_type?: MessageType;
      attachments?: Attachment[];
      sender_type?: "admin";
    } = body;

    if (!session_id || (!message_text && attachments.length === 0)) {
      return NextResponse.json(
        { error: "session_id and either message_text or attachments are required" },
        { status: 400 }
      );
    }

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      console.error("Error fetching session:", sessionError);
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const user = await getAuthenticatedUser(request);
    await requireWorkspaceRole(session.workspace_id, user.id, ["owner", "admin"]);

    // Fetch the bot token for this session
    let botToken: string | null = null;
    if (session.bot_id) {
      const { data: agent, error: agentError } = await supabase
        .from("agents")
        .select("telegram_bot_token")
        .eq("id", session.bot_id)
        .single();

      if (agentError || !agent?.telegram_bot_token) {
        console.error("Error fetching bot token:", agentError);
        return NextResponse.json(
          { error: "Bot not found for this session" },
          { status: 404 }
        );
      }
      botToken = agent.telegram_bot_token;
    } else {
      // Fallback to env var for legacy sessions without bot_id
      botToken = process.env.TELEGRAM_BOT_TOKEN || null;
    }

    if (!botToken) {
      console.error("No bot token available for session:", session_id);
      return NextResponse.json(
        { error: "No bot token configured" },
        { status: 500 }
      );
    }

    // Save message to database first
    const { data: message, error: messageError } = await supabase
      .from("chat_messages")
      .insert({
        session_id: session_id,
        message_text: message_text,
        message_type,
        attachments,
        sender_type: sender_type,
        sender_id: "admin", // TODO: Get actual admin user ID from auth
        sender_name: "Support Team",
        is_read: true, // Admin messages are marked as read by default
      })
      .select()
      .single();

    if (messageError) {
      console.error("Error saving message:", messageError);
      return NextResponse.json(
        { error: "Failed to save message" },
        { status: 500 }
      );
    }

    // Send message via appropriate platform
    if (session.platform === "telegram") {
      try {
        let telegramResponse;
        const primaryAttachment = attachments[0];
        const attachmentUrl = primaryAttachment?.url;
        const attachmentFilename = primaryAttachment?.filename;

        if (message_type === "image" && attachmentUrl) {
          telegramResponse = await sendTelegramPhoto(
            session.external_user_id,
            attachmentUrl,
            botToken
          );
        } else if (message_type === "video" && attachmentUrl) {
          telegramResponse = await sendTelegramVideo(
            session.external_user_id,
            attachmentUrl,
            botToken
          );
        } else if (message_type === "audio" && attachmentUrl) {
          telegramResponse = await sendTelegramAudio(
            session.external_user_id,
            attachmentUrl,
            botToken
          );
        } else if (message_type === "file" && attachmentUrl) {
          telegramResponse = await sendTelegramDocument(
            session.external_user_id,
            attachmentUrl,
            botToken,
            message_text,
            attachmentFilename
          );
        } else if (isImageUrl(message_text)) {
          telegramResponse = await sendTelegramPhoto(
            session.external_user_id,
            message_text,
            botToken
          );
        } else if (isVideoUrl(message_text)) {
          telegramResponse = await sendTelegramVideo(
            session.external_user_id,
            message_text,
            botToken
          );
        } else {
          telegramResponse = await sendTelegramMessage(
            session.external_user_id,
            message_text,
            botToken
          );
        }

        // Update message with platform message ID
        if (telegramResponse.result?.message_id) {
          await supabase
            .from("chat_messages")
            .update({
              platform_message_id: telegramResponse.result.message_id.toString(),
            })
            .eq("id", message.id);
        }
      } catch (error) {
        console.error("Error sending message via platform:", error);
        // Message is already saved in DB, so we return success
        // but log the error for debugging
      }
    }

    return NextResponse.json({
      success: true,
      message: message,
    });
  } catch (error) {
    console.error("Error in send message endpoint:", error);
    return jsonError(error);
  }
}
