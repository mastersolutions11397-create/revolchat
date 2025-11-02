"use client";

import * as React from "react";

export interface Workspace {
  id: string;
  name: string;
  agent_count: number;
  member_count: number;
  description?: string;
}

export interface UseWorkspaceResult {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  createWorkspace: (input: {
    name: string;
    description?: string;
    workspace_type?: string;
  }) => Promise<void>;
  selectWorkspace: (workspaceId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Lightweight client-only stub so UI compiles and can demo flows without backend
export function useWorkspace(): UseWorkspaceResult {
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = React.useState<Workspace | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error] = React.useState<string | null>(null);

  const createWorkspace = React.useCallback(
    async ({ name, description }: { name: string; description?: string; workspace_type?: string }) => {
      setLoading(true);
      try {
        // Simulate a short async operation
        await new Promise((r) => setTimeout(r, 200));
        const newWorkspace: Workspace = {
          id: `${Date.now()}`,
          name,
          description,
          agent_count: 0,
          member_count: 1,
        };
        setWorkspaces((prev) => [newWorkspace, ...prev]);
        setCurrentWorkspace(newWorkspace);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const selectWorkspace = React.useCallback(async (workspaceId: string) => {
    const found = workspaces.find((w) => w.id === workspaceId) || null;
    setCurrentWorkspace(found);
  }, [workspaces]);

  return {
    workspaces,
    currentWorkspace,
    createWorkspace,
    selectWorkspace,
    loading,
    error,
  };
}


