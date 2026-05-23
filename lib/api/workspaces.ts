"use client";

import { supabase } from "@/lib/supabase";

export type WorkspaceRole = "owner" | "admin" | "member";

export type Workspace = {
  id: string;
  name: string;
  owner_id: string;
  role: WorkspaceRole;
  is_active: boolean;
  created_at: string;
};

export type WorkspaceMember = {
  id: string;
  user_id: string;
  email: string | null;
  role: WorkspaceRole;
  allowed_bot_ids: string[];
  created_at: string;
};

export type WorkspaceInvitation = {
  id: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  allowed_bot_ids: string[];
  status: string;
  created_at: string;
};

async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    ...(session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {}),
  };
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      ...(await authHeaders()),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error || json?.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const workspacesAPI = {
  list() {
    return apiFetch<{ workspaces: Workspace[] }>("/api/workspaces");
  },
  create(name: string) {
    return apiFetch<{ workspace: Workspace }>("/api/workspaces", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },
  update(id: string, name: string) {
    return apiFetch<{ workspace: Workspace }>(`/api/workspaces/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
  },
  members(workspaceId: string) {
    return apiFetch<{ members: WorkspaceMember[]; invitations: WorkspaceInvitation[] }>(
      `/api/workspaces/${workspaceId}/members`
    );
  },
  invite(
    workspaceId: string,
    body: { email: string; role: WorkspaceRole; allowed_bot_ids: string[] }
  ) {
    return apiFetch<{ invitation: WorkspaceInvitation; invite_url: string }>(
      `/api/workspaces/${workspaceId}/invitations`,
      { method: "POST", body: JSON.stringify(body) }
    );
  },
  updateMember(
    workspaceId: string,
    memberId: string,
    body: { role: WorkspaceRole; allowed_bot_ids: string[] }
  ) {
    return apiFetch<{ member: WorkspaceMember }>(
      `/api/workspaces/${workspaceId}/members/${memberId}`,
      { method: "PATCH", body: JSON.stringify(body) }
    );
  },
  removeMember(workspaceId: string, memberId: string) {
    return apiFetch<{ ok: boolean }>(
      `/api/workspaces/${workspaceId}/members/${memberId}`,
      { method: "DELETE" }
    );
  },
  acceptInvite(token: string) {
    return apiFetch<{ workspace_id: string }>("/api/workspace-invitations/accept", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },
};
