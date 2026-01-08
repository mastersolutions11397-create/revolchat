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

  const clearWorkspaceId = () => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem("selectedWorkspaceId");
      // Also clear cookie
      document.cookie = "selectedWorkspaceId=; path=/; max-age=0; SameSite=Lax";
    } catch {
      // ignore errors
    }
  };

  const persistWorkspaceId = (workspaceId: string | undefined | null) => {
    try {
      if (typeof window === "undefined") return;
      // Don't persist invalid workspace IDs
      if (
        !workspaceId ||
        workspaceId === "undefined" ||
        workspaceId === "null" ||
        typeof workspaceId !== "string"
      ) {
        // Only log error in development, silently return in production
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Attempted to persist invalid workspace ID:",
            workspaceId
          );
        }
        return;
      }
      localStorage.setItem("selectedWorkspaceId", workspaceId);
      setSelectedWorkspaceId(workspaceId);
      
      // Also set cookie for middleware to use
      document.cookie = `selectedWorkspaceId=${workspaceId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
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

        // Clear persisted ID if it's not in the list of accessible workspaces
        if (persistedId && !data.workspaces.some((w) => w.id === persistedId)) {
          console.log("Clearing invalid persisted workspace ID");
          clearWorkspaceId();
        }

        const targetId =
          persistedId && data.workspaces.some((w) => w.id === persistedId)
            ? persistedId
            : data.workspaces[0].id;

        try {
          const target = await workspaceAPI.getWorkspace(targetId);
          setCurrentWorkspace(target);
          if (target?.id) {
            persistWorkspaceId(target.id);
          }
          hasLoadedWorkspace.current = true;
        } catch (workspaceErr: any) {
          console.error("Failed to load workspace details:", workspaceErr);
          // If failed to get workspace details, at least set the first one from the list
          const firstWorkspace = data.workspaces[0];
          if (firstWorkspace?.id) {
            setCurrentWorkspace(firstWorkspace as any);
            persistWorkspaceId(firstWorkspace.id);
          }
          hasLoadedWorkspace.current = true;
        }
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

        // Log the full response for debugging
        console.log(
          "Full workspace response:",
          JSON.stringify(workspace, null, 2)
        );
        console.log("Workspace type:", typeof workspace);
        console.log(
          "Workspace keys:",
          workspace ? Object.keys(workspace) : "null/undefined"
        );

        // Check if response is wrapped in a data field
        const workspaceData = (workspace as any)?.data || workspace;

        // Validate returned workspace has a valid ID
        if (
          !workspaceData ||
          !workspaceData.id ||
          workspaceData.id === "undefined" ||
          workspaceData.id === null
        ) {
          console.error("Invalid workspace response:", workspace);
          console.error("Attempted to extract:", workspaceData);
          throw new Error(
            `Invalid workspace data returned from server.\n` +
              `Response type: ${typeof workspace}\n` +
              `Has 'data' field: ${!!(workspace as any)?.data}\n` +
              `Received: ${JSON.stringify(workspace)?.substring(0, 500)}`
          );
        }

        console.log("Workspace created successfully:", workspaceData.id);

        // Refresh workspaces list
        await fetchWorkspaces();

        // Set newly created workspace as current
        setCurrentWorkspace(workspaceData);
        persistWorkspaceId(workspaceData.id);
        hasLoadedWorkspace.current = true;

        return workspaceData;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to create workspace";
        console.error("Create workspace error:", errorMessage, err);
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

      // Validate workspace ID before attempting to select
      if (
        !workspaceId ||
        workspaceId === "undefined" ||
        workspaceId === "null"
      ) {
        const errorMsg = `Invalid workspace ID: ${workspaceId}`;
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const workspace = await workspaceAPI.getWorkspace(workspaceId);
        setCurrentWorkspace(workspace);
        setSelectedWorkspaceId(workspaceId);
        persistWorkspaceId(workspaceId);
        hasLoadedWorkspace.current = true;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to load workspace";
        console.error("Failed to select workspace:", errorMessage);

        // If access denied, clear the invalid workspace ID
        if (errorMessage.toLowerCase().includes("access denied")) {
          console.log("Access denied - clearing invalid workspace ID");
          clearWorkspaceId();

          // Try to load workspaces again and select the first one
          try {
            const data = await workspaceAPI.getWorkspaces();
            if (data.workspaces.length > 0) {
              console.log(
                "Selecting first available workspace after access denied"
              );
              const firstWorkspace = data.workspaces[0];
              setCurrentWorkspace(firstWorkspace as any);
              setSelectedWorkspaceId(firstWorkspace.id);
              persistWorkspaceId(firstWorkspace.id);
              hasLoadedWorkspace.current = true;
              setError(null); // Clear the error since we recovered
              return; // Exit early after successful recovery
            }
          } catch (recoveryErr) {
            console.error("Failed to recover from access denied:", recoveryErr);
          }
        }

        setError(errorMessage);
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
