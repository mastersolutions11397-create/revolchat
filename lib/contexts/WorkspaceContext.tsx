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
  workspaces: WorkspaceListResponse["workspaces"];
  currentWorkspace: WorkspaceResponse | null;
  selectedWorkspaceId: string | null;
  loading: boolean;
  error: string | null;
  hasWorkspaces: boolean;
  createWorkspace: (data: WorkspaceCreateData) => Promise<WorkspaceResponse>;
  fetchWorkspaces: () => Promise<void>;
  selectWorkspace: (workspaceId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<
    WorkspaceListResponse["workspaces"]
  >([]);
  const [currentWorkspace, setCurrentWorkspace] =
    useState<WorkspaceResponse | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    typeof window !== "undefined"
      ? (() => {
          try {
            const val = localStorage.getItem("selectedWorkspaceId");
            if (!val || val === "undefined" || val === "null") return null;
            return val;
          } catch {
            return null;
          }
        })()
      : null
  );
  const hasLoadedWorkspace = useRef(false);

  // Sync from localStorage on mount and cross-tab updates
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const val = localStorage.getItem("selectedWorkspaceId");
      if (val && val !== "undefined" && val !== "null") {
        setSelectedWorkspaceId(val);
      }
    } catch {}

    const onStorage = (e: StorageEvent) => {
      if (e.key === "selectedWorkspaceId") {
        const v = e.newValue;
        if (v && v !== "undefined" && v !== "null") {
          setSelectedWorkspaceId(v);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPersistedWorkspaceId = () => {
    try {
      if (typeof window === "undefined") return null;
      const val = localStorage.getItem("selectedWorkspaceId");
      if (!val || val === "undefined" || val === "null") return null;
      return val;
    } catch {
      return null;
    }
  };

  const persistWorkspaceId = (workspaceId: string) => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem("selectedWorkspaceId", workspaceId);
      setSelectedWorkspaceId(workspaceId);
    } catch {
      // ignore persistence errors
    }
  };

  const fetchWorkspaces = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await workspaceAPI.getWorkspaces();
      setWorkspaces(data.workspaces);

      // Only set workspace if none has been loaded yet
      if (data.workspaces.length > 0 && !hasLoadedWorkspace.current) {
        const persistedId = getPersistedWorkspaceId();
        const targetId =
          persistedId && data.workspaces.some((w) => w.id === persistedId)
            ? persistedId
            : data.workspaces[0].id;
        const target = await workspaceAPI.getWorkspace(targetId);
        setCurrentWorkspace(target);
        persistWorkspaceId(target.id);
        hasLoadedWorkspace.current = true;
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch workspaces");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const createWorkspace = useCallback(
    async (data: WorkspaceCreateData): Promise<WorkspaceResponse> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      setLoading(true);
      setError(null);
      try {
        const workspace = await workspaceAPI.createWorkspace({
          ...data,
          workspace_type: data.workspace_type || "personal",
        });

        // Refresh workspaces list
        await fetchWorkspaces();

        // Set newly created workspace as current
        setCurrentWorkspace(workspace);
        persistWorkspaceId(workspace.id);
        hasLoadedWorkspace.current = true;

        return workspace;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to create workspace";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.id, fetchWorkspaces]
  );

  const selectWorkspace = useCallback(
    async (workspaceId: string) => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);
      try {
        const workspace = await workspaceAPI.getWorkspace(workspaceId);
        setCurrentWorkspace(workspace);
        setSelectedWorkspaceId(workspaceId);
        persistWorkspaceId(workspaceId);
        hasLoadedWorkspace.current = true;
      } catch (err: any) {
        setError(err.message || "Failed to load workspace");
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  // Fetch workspaces when user is available
  useEffect(() => {
    if (user?.id) {
      fetchWorkspaces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const value: WorkspaceContextType = useMemo(
    () => ({
      workspaces,
      currentWorkspace,
      selectedWorkspaceId,
      loading,
      error,
      hasWorkspaces: workspaces.length > 0,
      createWorkspace,
      fetchWorkspaces,
      selectWorkspace,
    }),
    [
      workspaces,
      currentWorkspace,
      selectedWorkspaceId,
      loading,
      error,
      createWorkspace,
      fetchWorkspaces,
      selectWorkspace,
    ]
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
