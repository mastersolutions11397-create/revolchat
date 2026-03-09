import { apiRequest } from "./client";
import type {
  TriggerWord,
  CreateTriggerWordParams,
  UpdateTriggerWordParams,
} from "@/lib/types/chat";

export interface GetTriggerWordsResponse {
  trigger_words: TriggerWord[];
}

export interface TriggerWordResponse {
  success: boolean;
  trigger_word: TriggerWord;
}

export interface DeleteTriggerWordResponse {
  success: boolean;
}

export interface UploadMediaResponse {
  success: boolean;
  url: string;
  filename: string;
  size: number;
  media_type: "image" | "video" | "audio" | "file";
  path: string;
}

class TriggerWordsAPI {
  // Get all trigger words for user
  async getTriggerWords(): Promise<TriggerWord[]> {
    const response = await apiRequest<GetTriggerWordsResponse>(`/api/trigger-words`, {
      method: "GET",
    });
    return response.trigger_words;
  }

  // Get active trigger words for user (for chat suggestions)
  async getActiveTriggerWords(): Promise<TriggerWord[]> {
    const response = await apiRequest<GetTriggerWordsResponse>(
      `/api/trigger-words?active_only=true`,
      { method: "GET" }
    );
    return response.trigger_words;
  }

  // Create a new trigger word
  async createTriggerWord(payload: CreateTriggerWordParams): Promise<TriggerWord> {
    const response = await apiRequest<TriggerWordResponse>(`/api/trigger-words`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.trigger_word;
  }

  // Update a trigger word
  async updateTriggerWord(
    id: string,
    payload: UpdateTriggerWordParams
  ): Promise<TriggerWord> {
    const response = await apiRequest<TriggerWordResponse>(
      `/api/trigger-words/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
    return response.trigger_word;
  }

  // Delete a trigger word
  async deleteTriggerWord(id: string): Promise<void> {
    await apiRequest<DeleteTriggerWordResponse>(`/api/trigger-words/${id}`, {
      method: "DELETE",
    });
  }

  // Increment usage count
  async incrementUsage(id: string): Promise<void> {
    await apiRequest(`/api/trigger-words/${id}/use`, {
      method: "POST",
    });
  }

  // Upload media file
  async uploadMedia(file: File): Promise<UploadMediaResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/trigger-words/upload", {
      method: "POST",
      credentials: "include", // Include cookies for admin auth
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    return response.json();
  }
}

export const triggerWordsAPI = new TriggerWordsAPI();
