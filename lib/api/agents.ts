/**
 * Agents API client – talks to the Python backend (e.g. http://127.0.0.1:8000).
 * List, get, create, update, delete agents.
 */

const AGENTS_API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_AGENTS_API_URL || "http://127.0.0.1:8000")
    : (process.env.NEXT_PUBLIC_AGENTS_API_URL ||
        process.env.AGENTS_API_URL ||
        "http://127.0.0.1:8000");

export type AgentModel = "openai" | "deepseek" | "gemini";

export type Agent = {
  id: string;
  name: string;
  model: AgentModel;
  model_id: string | null;
  system_prompt: string;
  api_key?: string;
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
};

export type UpdateAgentBody = Partial<{
  name: string;
  model: AgentModel;
  model_id: string | null;
  system_prompt: string;
}>;

async function agentsFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${AGENTS_API_BASE.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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

export const agentsAPI = {
  /** GET /agents – list all agents (api_key not returned in list) */
  async list(): Promise<AgentsListResponse> {
    return agentsFetch<AgentsListResponse>("/agents");
  },

  /** GET /agents/:id – get one agent (api_key masked as "***") */
  async get(id: string): Promise<Agent> {
    return agentsFetch<Agent>(`/agents/${encodeURIComponent(id)}`);
  },

  /** POST /agents – create agent. Returns created agent; api_key in response is "***". */
  async create(body: CreateAgentBody): Promise<Agent> {
    return agentsFetch<Agent>("/agents", {
      method: "POST",
      body: JSON.stringify({
        name: body.name,
        model: body.model,
        model_id: body.model_id ?? null,
        system_prompt: body.system_prompt,
        api_key: body.api_key,
      }),
    });
  },

  /** PATCH /agents/:id – update agent (only send fields to change) */
  async update(id: string, body: UpdateAgentBody): Promise<Agent> {
    return agentsFetch<Agent>(`/agents/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /** DELETE /agents/:id */
  async delete(id: string): Promise<{ message: string; id: string }> {
    return agentsFetch<{ message: string; id: string }>(
      `/agents/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
  },
};
