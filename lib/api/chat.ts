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
  async sendMessage(
    workspaceId: string,
    payload: ChatRequest
  ): Promise<ChatResponse> {
    return apiRequest<ChatResponse>(
      `/api/yetti/workspaces/${workspaceId}/yetti-agent/chat`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  async getMessageCount(workspaceId: string): Promise<number> {
    const response = await apiRequest<ChatHistoryCountResponse>(
      `/api/yetti/workspaces/${workspaceId}/chat-history/count`,
      {
        method: "GET",
      }
    );
    return response.count;
  }
}

export const chatAPI = new ChatAPI();
