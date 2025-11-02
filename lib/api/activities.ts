export type ActivityType = "success" | "info" | "warning" | "error";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  platform: "knowledge" | "instagram" | "telegram" | "system" | string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export const activitiesAPI = {
  async getActivitiesByWorkspace(
    workspaceId: string,
    limit = 5
  ): Promise<{ activities: ActivityItem[] }> {
    // Return a small mock list for demo
    const now = Date.now();
    const activities: ActivityItem[] = [
      {
        id: "a1",
        type: "success",
        message: "Workspace initialized",
        platform: "system",
        timestamp: new Date(now - 60_000).toISOString(),
        metadata: { workspace_id: workspaceId },
      },
    ].slice(0, limit);
    return { activities };
  },

  async createActivity(
    _input: Omit<ActivityItem, "id" | "timestamp"> & {
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    // No-op mock
    return;
  },
};
