import { apiRequest } from "./client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  user_id?: string;
}

export type ChatAnswer =
  | string
  | {
      content?: string;
      [key: string]: unknown;
    };

export interface ChatResponse {
  success: boolean;
  answer: ChatAnswer;
}

export interface ChatHistoryCountResponse {
  count: number;
}

class ChatAPI {
  async sendMessage(payload: ChatRequest): Promise<ChatResponse> {
    return apiRequest<ChatResponse>("/api/yetti/yetti-agent/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getMessageCount(workspaceId?: string): Promise<number> {
    const query = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : "";
    const response = await apiRequest<ChatHistoryCountResponse>(
      `/api/yetti/chat-history/count${query}`,
      { method: "GET" }
    );
    return response.count;
  }
}

export const chatAPI = new ChatAPI();
