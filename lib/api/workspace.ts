import { apiRequest } from "./client";

export interface WorkspaceCreateData {
  name: string;
  description?: string;
  workspace_type?: string;
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
    return apiRequest<WorkspaceResponse>("/api/yetti/workspaces", {
      method: "POST",
      body: JSON.stringify(data),
    });
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
