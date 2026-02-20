/**
 * Agent Chat API – stream chat, query, sessions, history (backend at 127.0.0.1:8000).
 * Use agent_id from GET /agents in every request.
 */

const AGENT_CHAT_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_AGENTS_API_URL || "http://127.0.0.1:8000")
    : (process.env.NEXT_PUBLIC_AGENTS_API_URL ||
        process.env.AGENTS_API_URL ||
        "http://127.0.0.1:8000");

const base = () => AGENT_CHAT_BASE.replace(/\/$/, "");

// --- Stream (SSE) ---

export type StreamCallbacks = {
  onToken: (chunk: string) => void;
  onDone?: (data: { full_text?: string }) => void;
  onError?: (err: Error) => void;
};

/**
 * POST /agent/stream – stream response via SSE.
 * Use onToken to append chunks for typing effect.
 */
export async function streamChat(
  prompt: string,
  agentId: string,
  options: {
    conversationId?: string | null;
    userId?: string | null;
  } = {},
  callbacks: StreamCallbacks
): Promise<string> {
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("agent_id", agentId);
  if (options.conversationId) form.append("conversation_id", options.conversationId);
  if (options.userId) form.append("user_id", options.userId);

  const res = await fetch(`${base()}/agent/stream`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `Request failed: ${res.status}`);
    callbacks.onError?.(err);
    throw err;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    const err = new Error("No response body");
    callbacks.onError?.(err);
    throw err;
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split(/\r?\n\r?\n/);
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const lines = part.split(/\r?\n/);
      let event = "";
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) {
          event = line.replace(/^event:\s*/, "").trim();
        } else if (line.startsWith("data:")) {
          data = line.replace(/^data:\s*/, "").trim();
        }
      }

      if (event === "token") {
        fullText += data;
        callbacks.onToken(data);
      } else if (event === "done") {
        try {
          const parsed = JSON.parse(data) as { full_text?: string };
          if (parsed.full_text != null) fullText = parsed.full_text;
          callbacks.onDone?.(parsed);
        } catch {
          callbacks.onDone?.({});
        }
      } else if (event === "error") {
        try {
          const parsed = JSON.parse(data) as { error?: string };
          const err = new Error(parsed.error ?? data);
          callbacks.onError?.(err);
          throw err;
        } catch (e) {
          if (e instanceof Error) throw e;
          const err = new Error(data);
          callbacks.onError?.(err);
          throw err;
        }
      }
    }
  }

  return fullText;
}

// --- Non-stream query ---

export type QueryResponse = {
  response: string;
  conversation_id: string | null;
  agent_id: string;
};

/**
 * POST /agent/query – single response (no stream).
 */
export async function queryAgent(
  prompt: string,
  agentId: string,
  conversationId?: string | null,
  userId?: string | null
): Promise<QueryResponse> {
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("agent_id", agentId);
  if (conversationId) form.append("conversation_id", conversationId);
  if (userId) form.append("user_id", userId);

  const res = await fetch(`${base()}/agent/query`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// --- Sessions ---

export type ChatSession = {
  session_id: string;
  session_name: string;
  user_id: string;
  agent_name: string;
  preview: string;
  created_at: string;
  updated_at: string;
};

export type SessionsResponse = {
  sessions: ChatSession[];
  count: number;
};

/**
 * GET /agent/sessions?user_id=...&limit=...
 */
export async function listSessions(
  userId?: string | null,
  limit = 50
): Promise<SessionsResponse> {
  const params = new URLSearchParams();
  if (userId) params.set("user_id", userId);
  params.set("limit", String(Math.min(100, Math.max(1, limit))));
  const res = await fetch(`${base()}/agent/sessions?${params}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// --- Session history ---

export type HistoryMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  tool_calls: unknown;
  created_at: string;
};

export type SessionHistoryResponse = {
  session_id: string;
  messages: HistoryMessage[];
  count: number;
};

/**
 * GET /agent/sessions/:sessionId/history?limit=...
 */
export async function getSessionHistory(
  sessionId: string,
  limit = 100
): Promise<SessionHistoryResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(Math.min(500, Math.max(1, limit))));
  const res = await fetch(
    `${base()}/agent/sessions/${encodeURIComponent(sessionId)}/history?${params}`
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * DELETE /agent/sessions/:sessionId
 */
export async function deleteSession(
  sessionId: string
): Promise<{ message: string; session_id: string }> {
  const res = await fetch(
    `${base()}/agent/sessions/${encodeURIComponent(sessionId)}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const agentChatAPI = {
  stream: streamChat,
  query: queryAgent,
  listSessions,
  getSessionHistory,
  deleteSession,
};
