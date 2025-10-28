import { apiRequest } from "./client";

export interface DashboardResponse {
  user_profile: {
    first_name?: string;
    last_name?: string;
    company?: string;
  };
  workspace_summary: {
    total_workspaces: number;
    active_workspaces: number;
    total_agents: number;
    active_agents: number;
    total_integrations: number;
    active_integrations: number;
  };
  recent_activity: Array<{
    type: string;
    message: string;
    platform?: string;
    timestamp: string;
  }>;
  quick_stats: {
    today_interactions: number;
    this_week_interactions: number;
    this_month_interactions: number;
    avg_response_time: number;
  };
}

class DashboardAPI {
  async getDashboard(): Promise<DashboardResponse> {
    return apiRequest<DashboardResponse>("/api/yetti/dashboard", {
      method: "GET",
    });
  }
}

export const dashboardAPI = new DashboardAPI();
