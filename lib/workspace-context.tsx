"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { workspacesAPI, type Workspace } from "@/lib/api/workspaces";
import { useAuth } from "@/lib/auth-context";

type WorkspaceContextValue = {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loading: boolean;
  onboardingOpen: boolean;
  setOnboardingOpen: (open: boolean) => void;
  setActiveWorkspaceId: (id: string) => void;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
};

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const refreshWorkspaces = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setActiveWorkspaceIdState(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { workspaces: list } = await workspacesAPI.list();
      setWorkspaces(list);
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem(`active_workspace_${user.id}`)
          : null;
      const nextActive =
        (saved && list.find((w) => w.id === saved)?.id) || list[0]?.id || null;
      setActiveWorkspaceIdState(nextActive);
      setOnboardingOpen(list.length === 0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) refreshWorkspaces();
  }, [authLoading, refreshWorkspaces]);

  const setActiveWorkspaceId = useCallback(
    (id: string) => {
      setActiveWorkspaceIdState(id);
      if (user && typeof window !== "undefined") {
        localStorage.setItem(`active_workspace_${user.id}`, id);
      }
    },
    [user]
  );

  const createWorkspace = useCallback(
    async (name: string) => {
      const { workspace } = await workspacesAPI.create(name);
      await refreshWorkspaces();
      setActiveWorkspaceId(workspace.id);
      setOnboardingOpen(false);
      return workspace;
    },
    [refreshWorkspaces, setActiveWorkspaceId]
  );

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) ?? null,
    [workspaces, activeWorkspaceId]
  );

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        loading,
        onboardingOpen,
        setOnboardingOpen,
        setActiveWorkspaceId,
        refreshWorkspaces,
        createWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return value;
}
