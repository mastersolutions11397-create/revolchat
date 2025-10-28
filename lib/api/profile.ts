import { apiRequest } from "./client";

export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  avatar_url?: string;
  timezone: string;
  notification_preferences: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  timezone?: string;
  notification_preferences?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
}

class ProfileAPI {
  async getProfile(): Promise<UserProfile> {
    return apiRequest<UserProfile>("/api/yetti/profile", {
      method: "GET",
    });
  }

  async updateProfile(data: UserProfileUpdate): Promise<UserProfile> {
    return apiRequest<UserProfile>("/api/yetti/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

export const profileAPI = new ProfileAPI();
