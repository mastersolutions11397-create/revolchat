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
}

export const chatAPI = new ChatAPI();

