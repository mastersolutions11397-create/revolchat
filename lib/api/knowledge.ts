import { apiRequest, API_BASE_URL, getAuthToken } from "./client";

export type KnowledgeImportance = "low" | "normal" | "high" | "critical";

export interface TextKnowledgePayload {
  title: string;
  content: string;
  category: string;
  importance: KnowledgeImportance;
  tags?: string[];
}

export interface TextKnowledgeResponse {
  id: string;
  workspace_id: string;
  title: string;
  content: string;
  category: string;
  importance: KnowledgeImportance;
  tags: string[];
  created_at: string;
}

export interface PdfKnowledgeMetadata {
  title: string;
  category: string;
  importance: KnowledgeImportance;
  tags?: string[];
}

export interface PdfKnowledgeResponse {
  id: string;
  workspace_id: string;
  title: string;
  filename?: string;
  category?: string;
  importance?: KnowledgeImportance;
  tags?: string[];
  created_at?: string;
  [key: string]: unknown;
}

export interface KnowledgeRecord {
  id: string;
  entry_id?: string;
  workspace_id: string;
  title: string;
  category?: string | null;
  importance?: KnowledgeImportance | null;
  tags?: string[] | null;
  created_by?: string | null;
  file_url?: string | null;
  file_type?: string | null;
  created_at?: string;
  updated_at?: string;
  usage_count?: number;
  last_used_at?: string | null;
  content?: string | null;
}

export interface KnowledgeListResponse {
  success: boolean;
  results: KnowledgeRecord[];
  count: number;
  message?: string;
}

class KnowledgeAPI {
  async getKnowledgeList(
    workspaceId: string
  ): Promise<KnowledgeListResponse> {
    return apiRequest<KnowledgeListResponse>(
      `/api/yetti/workspaces/${workspaceId}/knowledge`
    );
  }

  async addTextKnowledge(
    workspaceId: string,
    payload: TextKnowledgePayload
  ): Promise<TextKnowledgeResponse> {
    return apiRequest<TextKnowledgeResponse>(
      `/api/yetti/workspaces/${workspaceId}/knowledge/text`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  async uploadPdfKnowledge(
    workspaceId: string,
    file: File,
    metadata: PdfKnowledgeMetadata
  ): Promise<PdfKnowledgeResponse | null> {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("No authentication token available");
    }

    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("title", metadata.title);
    formData.append("category", metadata.category);
    formData.append("importance", metadata.importance);
    formData.append("tags", JSON.stringify(metadata.tags ?? []));

    const response = await fetch(
      `${API_BASE_URL}/api/yetti/workspaces/${workspaceId}/knowledge/pdf`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;

      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);
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
          } else if (typeof errorData === "string") {
            errorMessage = errorData;
          } else if (errorData) {
            errorMessage = JSON.stringify(errorData);
          }
        } catch {
          errorMessage = responseText;
        }
      }

      throw new Error(errorMessage);
    }

    if (!responseText) {
      return null;
    }

    try {
      return JSON.parse(responseText) as PdfKnowledgeResponse;
    } catch {
      return responseText as unknown as PdfKnowledgeResponse;
    }
  }
}

export const knowledgeAPI = new KnowledgeAPI();


