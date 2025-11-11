import { apiRequest } from "./client";

export type YettiOnboardingAnswerValue =
  | string
  | number
  | boolean
  | string[]
  | null;

export interface YettiQuestionOption {
  id?: string;
  value?: string;
  label?: string;
  name?: string;
}

export interface YettiQuestion {
  id?: string | number;
  key?: string;
  prompt?: string;
  question?: string;
  title?: string;
  description?: string;
  helper_text?: string;
  placeholder?: string;
  type?: string;
  field_type?: string;
  input_type?: string;
  answer_type?: string;
  required?: boolean | string | number;
  options?: Array<YettiQuestionOption | string>;
}

export interface YettiQuestionnaireResponse {
  identifier: string;
  title?: string;
  description?: string;
  questions: YettiQuestion[];
}

export interface YettiOnboardingStatusResponse {
  workspace_id: string;
  is_onboarded: boolean;
  solved_answers: Record<string, YettiOnboardingAnswerValue>;
  updated_at?: string;
}

export interface YettiOnboardingSubmitPayload {
  solved_answers: Record<string, YettiOnboardingAnswerValue>;
}

class YettiOnboardingAPI {
  private readonly defaultQuestionnaireIdentifier =
    process.env.NEXT_PUBLIC_YETTI_WORKSPACE_ONBOARDING_IDENTIFIER ||
    "general-questions";

  private unwrapResponse<T>(payload: any): T {
    if (
      payload &&
      typeof payload === "object" &&
      "data" in payload &&
      payload.data !== undefined
    ) {
      return payload.data as T;
    }
    return payload as T;
  }

  async getQuestionnaire(
    identifier: string = this.defaultQuestionnaireIdentifier
  ): Promise<YettiQuestionnaireResponse> {
    const response = await apiRequest<
      YettiQuestionnaireResponse | { data: YettiQuestionnaireResponse }
    >(`/get_questionare/identifier/${identifier}`, {
      method: "GET",
    });
    return this.unwrapResponse<YettiQuestionnaireResponse>(response);
  }

  async getOnboardingStatus(
    workspaceId: string
  ): Promise<YettiOnboardingStatusResponse> {
    const response = await apiRequest<
      YettiOnboardingStatusResponse | { data: YettiOnboardingStatusResponse }
    >(`/api/yetti/workspaces/${workspaceId}/onboarding/status`, {
      method: "GET",
    });
    return this.unwrapResponse<YettiOnboardingStatusResponse>(response);
  }

  async submitOnboarding(
    workspaceId: string,
    payload: YettiOnboardingSubmitPayload
  ): Promise<YettiOnboardingStatusResponse> {
    const response = await apiRequest<
      YettiOnboardingStatusResponse | { data: YettiOnboardingStatusResponse }
    >(`/api/yetti/workspaces/${workspaceId}/onboarding/submit`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return this.unwrapResponse<YettiOnboardingStatusResponse>(response);
  }

  async updateOnboarding(
    workspaceId: string,
    payload: YettiOnboardingSubmitPayload
  ): Promise<YettiOnboardingStatusResponse> {
    const response = await apiRequest<
      YettiOnboardingStatusResponse | { data: YettiOnboardingStatusResponse }
    >(`/api/yetti/workspaces/${workspaceId}/onboarding/update`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return this.unwrapResponse<YettiOnboardingStatusResponse>(response);
  }
}

export const yettiOnboardingAPI = new YettiOnboardingAPI();
