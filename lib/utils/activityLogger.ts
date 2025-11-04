import { activitiesAPI } from "@/lib/api/activities";

export class ActivityLogger {
  static async logActivity(
    type: "success" | "info" | "warning" | "error",
    message: string,
    platform?: string,
    metadata?: {
      workspace_id?: string;
      agent_id?: string;
      integration_id?: string;
      user_id?: string;
    }
  ) {
    try {
      await activitiesAPI.createActivity({
        type,
        message,
        platform,
        metadata,
      });
    } catch (error: any) {
      const message = error?.message || (typeof error === "string" ? error : JSON.stringify(error));
      console.error("Failed to log activity:", message);
    }
  }

  static async logKnowledgeUpdate(
    workspaceId: string,
    updateType: "text" | "pdf" | "sheets",
    details?: string
  ) {
    const messages = {
      text: "Knowledge base updated with new text content",
      pdf: "PDF document processed and added to knowledge base",
      sheets: "Google Sheets data synced to knowledge base",
    };

    await this.logActivity(
      "success",
      details || messages[updateType],
      "knowledge",
      { workspace_id: workspaceId }
    );
  }

  static async logIntegrationEvent(
    workspaceId: string,
    platform: string,
    eventType: "connected" | "disconnected" | "error",
    details?: string
  ) {
    const messages = {
      connected: `Successfully connected to ${platform}`,
      disconnected: `Disconnected from ${platform}`,
      error: `Error with ${platform} integration`,
    };

    await this.logActivity(
      eventType === "error" ? "error" : "success",
      details || messages[eventType],
      platform,
      { workspace_id: workspaceId }
    );
  }

  static async logAgentEvent(
    workspaceId: string,
    agentId: string,
    eventType: "created" | "updated" | "deleted" | "message_processed",
    details?: string
  ) {
    const messages = {
      created: "AI agent created successfully",
      updated: "AI agent configuration updated",
      deleted: "AI agent deleted",
      message_processed: "AI agent processed messages",
    };

    await this.logActivity(
      "success",
      details || messages[eventType],
      "agent",
      { workspace_id: workspaceId, agent_id: agentId }
    );
  }
}



