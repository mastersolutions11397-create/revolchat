import { apiRequest } from "./client";

export interface GoogleSheet {
  id: string;
  workspace_id: string;
  sheet_id: string;
  sheet_type?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoogleSheetListResponse {
  success: boolean;
  data: GoogleSheet[];
  count: number;
}

export interface GoogleSheetResponse {
  success: boolean;
  data: GoogleSheet;
}

export interface GoogleSheetDeleteResponse {
  success: boolean;
  message: string;
  deleted_id: string;
}

export interface CreateGoogleSheetPayload {
  sheet_id: string;
  sheet_type?: string;
}

export interface UpdateGoogleSheetPayload {
  sheet_id?: string;
  sheet_type?: string;
}

/**
 * Extract Google Sheet ID from a Google Sheets URL
 * Supports various Google Sheets URL formats:
 * - https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit...
 * - https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit?usp=share_link
 * - https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit?gid=...
 */
export function extractSheetIdFromUrl(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  // Remove any whitespace
  const cleanUrl = url.trim();

  // Pattern to match Google Sheets URL with sheet ID
  // Matches: /spreadsheets/d/{SHEET_ID}
  const pattern = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = cleanUrl.match(pattern);

  if (match && match[1]) {
    return match[1];
  }

  return null;
}

class GoogleSheetsAPI {
  /**
   * Get all Google Sheets for a workspace
   */
  async getGoogleSheets(
    workspaceId: string
  ): Promise<GoogleSheetListResponse> {
    return apiRequest<GoogleSheetListResponse>(
      `/api/yetti/workspaces/${workspaceId}/google-sheets`
    );
  }

  /**
   * Get a single Google Sheet by ID
   */
  async getGoogleSheet(
    workspaceId: string,
    id: string
  ): Promise<GoogleSheetResponse> {
    return apiRequest<GoogleSheetResponse>(
      `/api/yetti/workspaces/${workspaceId}/google-sheets/${id}`
    );
  }

  /**
   * Create a new Google Sheet entry
   */
  async createGoogleSheet(
    workspaceId: string,
    payload: CreateGoogleSheetPayload
  ): Promise<GoogleSheetResponse> {
    return apiRequest<GoogleSheetResponse>(
      `/api/yetti/workspaces/${workspaceId}/google-sheets`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }

  /**
   * Update an existing Google Sheet entry
   */
  async updateGoogleSheet(
    workspaceId: string,
    id: string,
    payload: UpdateGoogleSheetPayload
  ): Promise<GoogleSheetResponse> {
    return apiRequest<GoogleSheetResponse>(
      `/api/yetti/workspaces/${workspaceId}/google-sheets/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }

  /**
   * Delete a Google Sheet entry
   */
  async deleteGoogleSheet(
    workspaceId: string,
    id: string
  ): Promise<GoogleSheetDeleteResponse> {
    return apiRequest<GoogleSheetDeleteResponse>(
      `/api/yetti/workspaces/${workspaceId}/google-sheets/${id}`,
      {
        method: "DELETE",
      }
    );
  }
}

export const googleSheetsAPI = new GoogleSheetsAPI();

