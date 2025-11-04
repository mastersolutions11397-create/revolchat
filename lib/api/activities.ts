import { apiRequest } from "./client";

export interface ActivityItem {
  id: string;
  type: "success" | "info" | "warning" | "error";
  message: string;
  platform?: string;
  timestamp: string;
  metadata?: {
    workspace_id?: string;
    agent_id?: string;
    integration_id?: string;
    user_id?: string;
  };
}

export interface ActivitiesResponse {
  activities: ActivityItem[];
  total_count: number;
  has_more: boolean;
}

class ActivitiesAPI {
  async getRecentActivities(limit: number = 10): Promise<ActivitiesResponse> {
    return apiRequest<ActivitiesResponse>(`/api/yetti/activities?limit=${limit}`, {
      method: "GET",
    });
  }

  async getActivitiesByWorkspace(workspaceId: string, limit: number = 10): Promise<ActivitiesResponse> {
    return apiRequest<ActivitiesResponse>(`/api/yetti/activities/workspace/${workspaceId}?limit=${limit}`, {
      method: "GET",
    });
  }

  async createActivity(activity: Omit<ActivityItem, "id" | "timestamp">): Promise<ActivityItem> {
    return apiRequest<ActivityItem>("/api/yetti/activities", {
      method: "POST",
      body: JSON.stringify(activity),
    });
  }
}

export const activitiesAPI = new ActivitiesAPI();








