import { apiRequest } from "./client";
import type {
  ChatSession,
  ChatMessage,
  SessionWithLastMessage,
  Attachment,
  MessageType,
} from "@/lib/types/chat";

function isValidUuid(value?: string): value is string {
  return (
    typeof value === "string" &&
      value !== "undefined" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value
      )
  );
}

export interface GetSessionsResponse {
  sessions: SessionWithLastMessage[];
}

export interface GetMessagesResponse {
  messages: ChatMessage[];
}

export interface SendMessageRequest {
  session_id: string;
  message_text?: string;
  message_type?: MessageType;
  attachments?: Attachment[];
  sender_type: "admin";
}

export interface SendMessageResponse {
  success: boolean;
  message: ChatMessage;
}

export interface UploadChatAttachmentResponse {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  mime_type: string;
  message_type: MessageType;
  path: string;
}

export interface ToggleAIModeRequest {
  session_id: string;
  ai_mode: boolean;
}

export interface ToggleAIModeResponse {
  success: boolean;
  session: ChatSession;
}

export interface DeleteSessionResponse {
  success: boolean;
  deleted_session_id: string;
}

export interface DeleteAllSessionsResponse {
  success: boolean;
  deleted_count: number;
}

class ChatSystemAPI {
  // Get all chat sessions (with online users)
  async getSessions(
    platform?: string,
    workspaceId?: string,
    botId?: string
  ): Promise<SessionWithLastMessage[]> {
    const params = new URLSearchParams();
    if (platform) params.append("platform", platform);
    if (isValidUuid(workspaceId)) params.append("workspace_id", workspaceId);
    if (isValidUuid(botId)) params.append("bot_id", botId);

    const queryString = params.toString();
    const url = queryString
      ? `/api/chat/sessions?${queryString}`
      : `/api/chat/sessions`;

    const response = await apiRequest<GetSessionsResponse>(url, {
      method: "GET",
    });
    return response.sessions;
  }

  // Get messages for a specific session
  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const response = await apiRequest<GetMessagesResponse>(
      `/api/chat/messages?session_id=${sessionId}`,
      { method: "GET" }
    );
    return response.messages;
  }

  // Send a message as admin
  async sendMessage(payload: SendMessageRequest): Promise<ChatMessage> {
    if (
      !isValidUuid(payload.session_id)
    ) {
      throw new Error("Please select a valid conversation before sending.");
    }

    const response = await apiRequest<SendMessageResponse>(`/api/chat/send`, {
      method: "POST",
      body: JSON.stringify({
        session_id: payload.session_id,
        message_text: payload.message_text,
        ...(payload.message_type ? { message_type: payload.message_type } : {}),
        ...(payload.attachments ? { attachments: payload.attachments } : {}),
        sender_type: payload.sender_type,
      }),
    });
    return response.message;
  }

  async uploadAttachment(file: File): Promise<UploadChatAttachmentResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/chat/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    return response.json();
  }

  // Toggle AI mode for a session
  async toggleAIMode(payload: ToggleAIModeRequest): Promise<ChatSession> {
    const response = await apiRequest<ToggleAIModeResponse>(
      `/api/chat/toggle-ai`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return response.session;
  }

  // Mark messages as read
  async markMessagesAsRead(sessionId: string): Promise<void> {
    await apiRequest(`/api/chat/mark-read`, {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  // Delete a single chat session
  async deleteSession(sessionId: string): Promise<string> {
    const response = await apiRequest<DeleteSessionResponse>(
      `/api/chat/sessions/${encodeURIComponent(sessionId)}`,
      { method: "DELETE" }
    );
    return response.deleted_session_id;
  }

  // Delete all chat sessions for a workspace/channel, optionally scoped to one bot.
  async deleteAllSessions(payload: {
    platform: string;
    workspace_id?: string;
    bot_id?: string;
  }): Promise<number> {
    const params = new URLSearchParams({ platform: payload.platform });
    if (isValidUuid(payload.workspace_id)) {
      params.append("workspace_id", payload.workspace_id);
    }
    if (isValidUuid(payload.bot_id)) {
      params.append("bot_id", payload.bot_id);
    }

    const response = await apiRequest<DeleteAllSessionsResponse>(
      `/api/chat/sessions?${params.toString()}`,
      { method: "DELETE" }
    );
    return response.deleted_count;
  }
}

export const chatSystemAPI = new ChatSystemAPI();
