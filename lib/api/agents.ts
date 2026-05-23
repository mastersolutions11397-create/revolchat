/**
 * Agents/Bots API client – uses Next.js API routes.
 * List, get, create, update, delete agents/bots with Telegram integration.
 */

export type AgentModel = "openai" | "deepseek" | "gemini";

export type Agent = {
  id: string;
  name: string;
  model: AgentModel;
  model_id: string | null;
  system_prompt: string;
  api_key?: string;
  telegram_bot_token?: string;
  telegram_username?: string | null;
  telegram_first_name?: string | null;
  profile_picture_url?: string | null;
  user_id?: string | null;
  workspace_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type AgentsListResponse = {
  agents: Agent[];
  count: number;
};

export type CreateAgentBody = {
  name: string;
  model: AgentModel;
  model_id?: string | null;
  system_prompt: string;
  api_key: string;
  telegram_bot_token?: string;
  telegram_username?: string;
  telegram_first_name?: string;
  profile_picture_url?: string;
  user_id?: string;
  workspace_id?: string;
};

export type UpdateAgentBody = Partial<{
  name: string;
  model: AgentModel;
  model_id: string | null;
  system_prompt: string;
  api_key: string;
  telegram_bot_token: string;
  telegram_username: string;
  telegram_first_name: string;
  profile_picture_url: string;
}>;

export type TelegramBotInfo = {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries?: boolean;
};

export type ValidateTelegramTokenResponse = {
  valid: boolean;
  bot_info?: TelegramBotInfo | null;
  error?: string | null;
};

export type UploadProfilePictureResponse = {
  success: boolean;
  profile_picture_url: string;
  telegram_synced: boolean;
};

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const {
    data: { session },
  } = await import("@/lib/supabase").then(({ supabase }) =>
    supabase.auth.getSession()
  );
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      const detail = data?.detail ?? data?.message ?? data?.error;
      if (typeof detail === "string") message = detail;
      else if (Array.isArray(detail))
        message = detail.map((d: unknown) => (typeof d === "string" ? d : JSON.stringify(d))).join(", ");
      else if (detail != null) message = JSON.stringify(detail);
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return (await res.text()) as unknown as T;
  }

  return res.json();
}

async function apiFetchFormData<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const {
    data: { session },
  } = await import("@/lib/supabase").then(({ supabase }) =>
    supabase.auth.getSession()
  );
  const res = await fetch(path, {
    method: "POST",
    body: formData,
    headers: {
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      const detail = data?.detail ?? data?.message ?? data?.error;
      if (typeof detail === "string") message = detail;
      else if (detail != null) message = JSON.stringify(detail);
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return res.json();
}

export const agentsAPI = {
  /** GET /api/bots – list all agents/bots */
  async list(workspaceId?: string): Promise<AgentsListResponse> {
    const params = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : "";
    return apiFetch<AgentsListResponse>(`/api/bots${params}`);
  },

  /** GET /api/bots/:id – get one agent/bot */
  async get(id: string): Promise<Agent> {
    return apiFetch<Agent>(`/api/bots/${encodeURIComponent(id)}`);
  },

  /** POST /api/bots – create agent/bot */
  async create(body: CreateAgentBody): Promise<Agent> {
    return apiFetch<Agent>("/api/bots", {
      method: "POST",
      body: JSON.stringify({
        name: body.name,
        model: body.model,
        model_id: body.model_id ?? null,
        system_prompt: body.system_prompt,
        api_key: body.api_key,
        telegram_bot_token: body.telegram_bot_token ?? null,
        telegram_username: body.telegram_username ?? null,
        telegram_first_name: body.telegram_first_name ?? null,
        profile_picture_url: body.profile_picture_url ?? null,
        user_id: body.user_id ?? null,
        workspace_id: body.workspace_id ?? null,
      }),
    });
  },

  /** PATCH /api/bots/:id – update agent/bot */
  async update(id: string, body: UpdateAgentBody): Promise<Agent> {
    return apiFetch<Agent>(`/api/bots/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /** DELETE /api/bots/:id */
  async delete(id: string): Promise<{ message: string; id: string }> {
    return apiFetch<{ message: string; id: string }>(
      `/api/bots/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
  },

  /** POST /api/telegram/validate – validate a Telegram bot token */
  async validateTelegramToken(token: string): Promise<ValidateTelegramTokenResponse> {
    return apiFetch<ValidateTelegramTokenResponse>("/api/telegram/validate", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  /** POST /api/bots/:id/profile-picture – upload profile picture */
  async uploadProfilePicture(agentId: string, file: File): Promise<UploadProfilePictureResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetchFormData<UploadProfilePictureResponse>(
      `/api/bots/${encodeURIComponent(agentId)}/profile-picture`,
      formData
    );
  },

  /** DELETE /api/bots/:id/profile-picture – remove profile picture */
  async deleteProfilePicture(agentId: string): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>(
      `/api/bots/${encodeURIComponent(agentId)}/profile-picture`,
      { method: "DELETE" }
    );
  },
};
