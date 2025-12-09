import { apiRequest, getAuthToken, API_BASE_URL } from "./client";

export interface WorkspaceCreateData {
  name: string;
  description?: string;
  workspace_type?: string;
  logo?: File;
}

export interface WorkspaceResponse {
  id: string;
  name: string;
  description?: string;
  workspace_type: string;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceListResponse {
  workspaces: Array<{
    id: string;
    name: string;
    description?: string;
    workspace_type: string;
    owner_id: string;
    is_active: boolean;
    member_count: number;
    agent_count: number;
    created_at: string;
    updated_at: string;
  }>;
}

class WorkspaceAPI {
  async createWorkspace(data: WorkspaceCreateData): Promise<WorkspaceResponse> {
    // If logo is provided, use FormData; otherwise use JSON
    if (data.logo) {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const formData = new FormData();
      formData.append("name", data.name);
      if (data.description) {
        formData.append("description", data.description);
      }
      if (data.workspace_type) {
        formData.append("workspace_type", data.workspace_type);
      }
      formData.append("logo", data.logo, data.logo.name);

      const response = await fetch(`${API_BASE_URL}/api/yetti/workspaces`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          const detail =
            errorData?.detail ?? errorData?.message ?? errorData?.error;
          if (typeof detail === "string") {
            errorMessage = detail;
          } else if (Array.isArray(detail)) {
            errorMessage = detail
              .map((d: unknown) =>
                typeof d === "string" ? d : JSON.stringify(d)
              )
              .join(", ");
          }
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } else {
      return apiRequest<WorkspaceResponse>("/api/yetti/workspaces", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          workspace_type: data.workspace_type,
        }),
      });
    }
  }

  async getWorkspaces(): Promise<WorkspaceListResponse> {
    return apiRequest<WorkspaceListResponse>("/api/yetti/workspaces", {
      method: "GET",
    });
  }

  async getWorkspace(workspaceId: string): Promise<WorkspaceResponse> {
    return apiRequest<WorkspaceResponse>(
      `/api/yetti/workspaces/${workspaceId}`,
      {
        method: "GET",
      }
    );
  }
}

export const workspaceAPI = new WorkspaceAPI();
