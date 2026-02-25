import { apiRequest, ApiRequestError } from "./client";

type InstagramIntegrationData = {
  username: string;
  profile_picture: string | null;
};

type InstagramIntegrationResponse = {
  success: boolean;
  data?: InstagramIntegrationData | null;
};

async function getInstagramIntegration() {
  try {
    const response = await apiRequest<InstagramIntegrationResponse>(
      "/api/yetti/integrations/instagram",
      { method: "GET" }
    );
    if (response.success && response.data) return response.data;
    return null;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return null;
    throw error;
  }
}

async function disconnectInstagramIntegration() {
  await apiRequest("/api/yetti/integrations/instagram", { method: "DELETE" });
}

export type Message = {
  id: string;
  text: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  timestamp: string;
  is_from_me?: boolean;
};

export type Conversation = {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  is_online?: boolean;
  ai_mode?: boolean;
};

export type MessagesResponse = {
  success: boolean;
  data?: {
    conversations?: Conversation[];
    messages?: Message[];
  };
};

async function getInstagramConversations() {
  try {
    const response = await apiRequest<MessagesResponse>(
      "/api/yetti/integrations/instagram/conversations",
      { method: "GET" }
    );
    if (response.success && response.data?.conversations)
      return response.data.conversations;
    return [];
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return [];
    throw error;
  }
}

async function getInstagramMessages(conversationId: string) {
  try {
    const response = await apiRequest<MessagesResponse>(
      `/api/yetti/integrations/instagram/conversations/${conversationId}/messages`,
      { method: "GET" }
    );
    if (response.success && response.data?.messages)
      return response.data.messages;
    return [];
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return [];
    throw error;
  }
}

async function getTelegramConversations() {
  try {
    const response = await apiRequest<MessagesResponse>(
      "/api/yetti/integrations/telegram/conversations",
      { method: "GET" }
    );
    if (response.success && response.data?.conversations)
      return response.data.conversations;
    return [];
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return [];
    throw error;
  }
}

async function getTelegramMessages(conversationId: string) {
  try {
    const response = await apiRequest<MessagesResponse>(
      `/api/yetti/integrations/telegram/conversations/${conversationId}/messages`,
      { method: "GET" }
    );
    if (response.success && response.data?.messages)
      return response.data.messages;
    return [];
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return [];
    throw error;
  }
}

type CreateTelegramIntegrationPayload = {
  user_id: string;
  telegram_bot_token: string;
  workspace_id?: string;
};

type CreateTelegramIntegrationResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

async function createTelegramIntegration(
  payload: CreateTelegramIntegrationPayload
): Promise<CreateTelegramIntegrationResponse> {
  let workspace_id = payload.workspace_id;
  if (!workspace_id) {
    const me = await apiRequest<{ workspace_id: string }>("/api/yetti/me");
    workspace_id = me.workspace_id;
  }

  const TELEGRAM_API_URL =
    process.env.NEXT_PUBLIC_TELEGRAM_API_URL || "http://localhost:4000";

  const response = await fetch(`${TELEGRAM_API_URL}/telegram/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: payload.user_id,
      telegram_bot_token: payload.telegram_bot_token,
      workspace_id,
    }),
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage =
        errorData?.message ||
        errorData?.detail ||
        errorData?.error ||
        errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch {
    return { success: true };
  }
}

type TelegramBotInfo = {
  username?: string;
  first_name?: string;
  token?: string;
  telegram_bot_token?: string;
  data?: {
    username?: string;
    first_name?: string;
    token?: string;
    telegram_bot_token?: string;
  };
};

async function getTelegramBotInfo(): Promise<{
  username: string;
  first_name: string;
} | null> {
  try {
    const response = await apiRequest<TelegramBotInfo>(
      "/api/yetti/integrations/telegram/token",
      { method: "GET" }
    );
    const username =
      response.username || response.data?.username || null;
    const first_name =
      response.first_name || response.data?.first_name || "";
    if (username) return { username, first_name };
    return null;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return null;
    console.error("Error fetching Telegram bot info:", error);
    return null;
  }
}

export const integrationsAPI = {
  getInstagramIntegration,
  disconnectInstagramIntegration,
  getInstagramConversations,
  getInstagramMessages,
  getTelegramConversations,
  getTelegramMessages,
  createTelegramIntegration,
  getTelegramBotInfo,
};
