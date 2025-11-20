import { apiRequest, ApiRequestError } from "./client";

type InstagramIntegrationData = {
  username: string;
  profile_picture: string | null;
};

type InstagramIntegrationResponse = {
  success: boolean;
  data?: InstagramIntegrationData | null;
};

async function getInstagramIntegration(workspaceId: string) {
  try {
    const response = await apiRequest<InstagramIntegrationResponse>(
      `/api/yetti/workspaces/${workspaceId}/integrations/instagram`,
      {
        method: "GET",
      }
    );

    if (response.success && response.data) {
      return response.data;
    }

    return null;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

async function disconnectInstagramIntegration(workspaceId: string) {
  await apiRequest(
    `/api/yetti/workspaces/${workspaceId}/integrations/instagram`,
    {
      method: "DELETE",
    }
  );
}

// Message types
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
};

export type MessagesResponse = {
  success: boolean;
  data?: {
    conversations?: Conversation[];
    messages?: Message[];
  };
};

async function getInstagramConversations(workspaceId: string) {
  try {
    const response = await apiRequest<MessagesResponse>(
      `/api/yetti/workspaces/${workspaceId}/integrations/instagram/conversations`,
      {
        method: "GET",
      }
    );

    if (response.success && response.data?.conversations) {
      return response.data.conversations;
    }

    return [];
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return [];
    }
    throw error;
  }
}

async function getInstagramMessages(
  workspaceId: string,
  conversationId: string
) {
  try {
    const response = await apiRequest<MessagesResponse>(
      `/api/yetti/workspaces/${workspaceId}/integrations/instagram/conversations/${conversationId}/messages`,
      {
        method: "GET",
      }
    );

    if (response.success && response.data?.messages) {
      return response.data.messages;
    }

    return [];
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return [];
    }
    throw error;
  }
}

async function getTelegramConversations(workspaceId: string) {
  try {
    const response = await apiRequest<MessagesResponse>(
      `/api/yetti/workspaces/${workspaceId}/integrations/telegram/conversations`,
      {
        method: "GET",
      }
    );

    if (response.success && response.data?.conversations) {
      return response.data.conversations;
    }

    return [];
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return [];
    }
    throw error;
  }
}

async function getTelegramMessages(
  workspaceId: string,
  conversationId: string
) {
  try {
    const response = await apiRequest<MessagesResponse>(
      `/api/yetti/workspaces/${workspaceId}/integrations/telegram/conversations/${conversationId}/messages`,
      {
        method: "GET",
      }
    );

    if (response.success && response.data?.messages) {
      return response.data.messages;
    }

    return [];
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return [];
    }
    throw error;
  }
}

type CreateTelegramIntegrationPayload = {
  user_id: string;
  telegram_bot_token: string;
  workspace_id: string;
};

type CreateTelegramIntegrationResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

async function createTelegramIntegration(
  payload: CreateTelegramIntegrationPayload
): Promise<CreateTelegramIntegrationResponse> {
  const TELEGRAM_API_URL =
    process.env.NEXT_PUBLIC_TELEGRAM_API_URL || "http://localhost:4000";

  const response = await fetch(`${TELEGRAM_API_URL}/telegram/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
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

export const integrationsAPI = {
  getInstagramIntegration,
  disconnectInstagramIntegration,
  getInstagramConversations,
  getInstagramMessages,
  getTelegramConversations,
  getTelegramMessages,
  createTelegramIntegration,
};
