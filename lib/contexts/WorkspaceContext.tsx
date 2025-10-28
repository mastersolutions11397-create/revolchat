"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
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
  loading: boolean;
  error: string | null;
  createWorkspace: (data: WorkspaceCreateData) => Promise<WorkspaceResponse>;
  fetchWorkspaces: () => Promise<void>;
  selectWorkspace: (workspaceId: string) => void;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await workspaceAPI.getWorkspaces();
      setWorkspaces(data.workspaces);

      // Set first workspace as current if no workspace is selected
      if (data.workspaces.length > 0 && !currentWorkspace) {
        const firstWorkspace = await workspaceAPI.getWorkspace(
          data.workspaces[0].id
        );
        setCurrentWorkspace(firstWorkspace);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch workspaces");
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (
    data: WorkspaceCreateData
  ): Promise<WorkspaceResponse> => {
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

      return workspace;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create workspace";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectWorkspace = async (workspaceId: string) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const workspace = await workspaceAPI.getWorkspace(workspaceId);
      setCurrentWorkspace(workspace);
    } catch (err: any) {
      setError(err.message || "Failed to load workspace");
    } finally {
      setLoading(false);
    }
  };

  // Fetch workspaces when user is available
  useEffect(() => {
    if (user?.id) {
      fetchWorkspaces();
    }
  }, [user?.id]);

  const value: WorkspaceContextType = {
    workspaces,
    currentWorkspace,
    loading,
    error,
    createWorkspace,
    fetchWorkspaces,
    selectWorkspace,
  };

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
