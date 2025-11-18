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

export const integrationsAPI = {
  getInstagramIntegration,
  disconnectInstagramIntegration,
  getInstagramConversations,
  getInstagramMessages,
  getTelegramConversations,
  getTelegramMessages,
};
