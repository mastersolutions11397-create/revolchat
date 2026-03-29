import { apiRequest } from "./client";
import type {
  ChatSession,
  ChatMessage,
  SessionWithLastMessage,
  Attachment,
  MessageType,
} from "@/lib/types/chat";

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
  async getSessions(platform?: string): Promise<SessionWithLastMessage[]> {
    const params = new URLSearchParams();
    if (platform) params.append("platform", platform);

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
    const response = await apiRequest<SendMessageResponse>(`/api/chat/send`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.message;
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

  // Delete all chat sessions for a specific bot and platform
  async deleteAllSessions(payload: {
    platform: string;
    bot_id: string;
  }): Promise<number> {
    const params = new URLSearchParams({
      platform: payload.platform,
      bot_id: payload.bot_id,
    });

    const response = await apiRequest<DeleteAllSessionsResponse>(
      `/api/chat/sessions?${params.toString()}`,
      { method: "DELETE" }
    );
    return response.deleted_count;
  }
}

export const chatSystemAPI = new ChatSystemAPI();
