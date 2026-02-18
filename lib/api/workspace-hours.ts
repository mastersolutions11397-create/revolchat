import { apiRequest } from "./client";

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface TimeRange {
  start: string;
  end: string;
}

export interface WorkspaceHoursPayload {
  timezone: string;
  schedule: Record<DayKey, TimeRange[]>;
  workspace_online: boolean;
  respect_schedule: boolean;
}

export interface WorkspaceHoursResponse extends WorkspaceHoursPayload {
  workspace_id: string;
  updated_at: string;
  created_at: string;
}

class WorkspaceHoursAPI {
  async getWorkingHours(): Promise<WorkspaceHoursResponse> {
    return apiRequest<WorkspaceHoursResponse>("/api/yetti/hours", {
      method: "GET",
    });
  }

  async upsertWorkingHours(
    payload: WorkspaceHoursPayload
  ): Promise<WorkspaceHoursResponse> {
    return apiRequest<WorkspaceHoursResponse>("/api/yetti/hours", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async updateWorkspaceOnlineStatus(
    workspace_online: boolean
  ): Promise<WorkspaceHoursResponse> {
    return apiRequest<WorkspaceHoursResponse>("/api/yetti/hours/status", {
      method: "PATCH",
      body: JSON.stringify({ workspace_online }),
    });
  }
}

export const workspaceHoursAPI = new WorkspaceHoursAPI();
