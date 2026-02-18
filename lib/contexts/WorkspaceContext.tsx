"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "@/lib/auth-context";
import {
  workspaceAPI,
  WorkspaceResponse,
  WorkspaceCreateData,
  WorkspaceListResponse,
} from "@/lib/api/workspace";

interface WorkspaceContextType {
  /** Single default workspace ID for the current user (auto-selected or auto-created). */
  workspaceId: string | null;
  /** Display name of the default workspace. */
  workspaceName: string;
  loading: boolean;
  error: string | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

function persistWorkspaceId(workspaceId: string | null) {
  try {
    if (typeof window === "undefined") return;
    if (!workspaceId || workspaceId === "undefined" || workspaceId === "null") {
      localStorage.removeItem("selectedWorkspaceId");
      document.cookie = "selectedWorkspaceId=; path=/; max-age=0; SameSite=Lax";
      return;
    }
    localStorage.setItem("selectedWorkspaceId", workspaceId);
    document.cookie = `selectedWorkspaceId=${workspaceId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
  } catch {
    // ignore
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasResolved = useRef(false);

  const ensureDefaultWorkspace = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await workspaceAPI.getWorkspaces();
      const list = data.workspaces || [];

      if (list.length > 0) {
        const first = list[0];
        const id = first.id;
        setWorkspaceId(id);
        setWorkspaceName(first.name ?? "Workspace");
        persistWorkspaceId(id);
        hasResolved.current = true;
        return;
      }

      // No workspace: create one automatically so the user never sees "select workspace"
      const created = await workspaceAPI.createWorkspace({
        name: "My Workspace",
        workspace_type: "personal",
      } as WorkspaceCreateData);
      const createdData = (created as { data?: WorkspaceResponse })?.data ?? (created as WorkspaceResponse);
      if (createdData?.id) {
        setWorkspaceId(createdData.id);
        setWorkspaceName(createdData.name ?? "My Workspace");
        persistWorkspaceId(createdData.id);
      }
      hasResolved.current = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load workspace";
      setError(msg);
      setWorkspaceId(null);
      setWorkspaceName("");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && !hasResolved.current) {
      ensureDefaultWorkspace();
    } else if (!user?.id) {
      setWorkspaceId(null);
      setWorkspaceName("");
      setLoading(false);
      hasResolved.current = false;
    }
  }, [user?.id, ensureDefaultWorkspace]);

  const value: WorkspaceContextType = useMemo(
    () => ({
      workspaceId,
      workspaceName,
      loading,
      error,
    }),
    [workspaceId, workspaceName, loading, error]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
