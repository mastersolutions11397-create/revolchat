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

export const integrationsAPI = {
  getInstagramIntegration,
  disconnectInstagramIntegration,
};
