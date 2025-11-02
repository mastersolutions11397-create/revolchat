export interface DashboardResponse {
  user_profile: {
    first_name?: string;
    last_name?: string;
  };
  workspace_summary: {
    total_workspaces: number;
    active_workspaces: number;
    total_agents: number;
    active_agents: number;
    total_integrations: number;
    active_integrations: number;
  };
  recent_activity: Array<unknown>;
  quick_stats: {
    today_interactions: number;
    this_week_interactions: number;
    this_month_interactions: number;
    avg_response_time: number;
  };
}

export const dashboardAPI = {
  async getDashboard(): Promise<DashboardResponse> {
    // Simple mock so the dashboard can render without a backend
    return {
      user_profile: { first_name: "User" },
      workspace_summary: {
        total_workspaces: 1,
        active_workspaces: 1,
        total_agents: 0,
        active_agents: 0,
        total_integrations: 0,
        active_integrations: 0,
      },
      recent_activity: [],
      quick_stats: {
        today_interactions: 0,
        this_week_interactions: 0,
        this_month_interactions: 0,
        avg_response_time: 0,
      },
    };
  },
};
