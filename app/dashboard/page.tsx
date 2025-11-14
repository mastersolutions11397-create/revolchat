"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  dashboardAPI,
  type DashboardResponse,
  workspaceHoursAPI,
  workspaceAPI,
} from "@/lib/api";
import Link from "next/link";
import {
  MessageSquare,
  Link2,
  Zap,
  CheckCircle2,
  Loader2,
  Power,
} from "lucide-react";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentWorkspace, selectedWorkspaceId, workspaces } = useWorkspace();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspaceOnline, setWorkspaceOnline] = useState<boolean | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null
  );
  const [workspaceName, setWorkspaceName] = useState<string>("Workspace");
  const workspaceId = useMemo(
    () => selectedWorkspaceId || currentWorkspace?.id || null,
    [selectedWorkspaceId, currentWorkspace?.id]
  );

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getDashboard();
        setDashboardData(data);
        setError(null);
      } catch (err: unknown) {
        console.error("Error fetching dashboard:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
        // Fallback data
        setDashboardData({
          user_profile: {
            first_name: user?.user_metadata?.first_name || "User",
            last_name: user?.user_metadata?.last_name,
          },
          workspace_summary: {
            total_workspaces: 1,
            active_workspaces: 1,
            total_agents: 0,
            active_agents: 0,
            total_integrations: 0,
            active_integrations: 0,
          },
          recent_activity: [],
          quick_stats: {
            today_interactions: 0,
            this_week_interactions: 0,
            this_month_interactions: 0,
            avg_response_time: 0,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboard();
    }
  }, [user]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!workspaceId) {
        setWorkspaceOnline(null);
        return;
      }
      setAvailabilityLoading(true);
      setAvailabilityError(null);
      try {
        const result = await workspaceHoursAPI.getWorkingHours(workspaceId);
        setWorkspaceOnline(result.workspace_online);
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("404")) {
          setWorkspaceOnline(true);
        } else {
          console.error("Failed to load workspace availability", err);
          setAvailabilityError(
            err instanceof Error ? err.message : "Failed to load workspace availability"
          );
        }
      } finally {
        setAvailabilityLoading(false);
      }
    };
    fetchAvailability();
  }, [workspaceId]);

  useEffect(() => {
    let cancelled = false;

    const derivedName =
      currentWorkspace?.name ||
      workspaces.find((w) => w.id === workspaceId)?.name;

    if (derivedName) {
      setWorkspaceName(derivedName);
    } else if (workspaceId) {
      const loadWorkspaceName = async () => {
        try {
          const workspace = await workspaceAPI.getWorkspace(workspaceId);
          if (!cancelled && workspace?.name) {
            setWorkspaceName(workspace.name);
          }
        } catch (err) {
          console.error("Failed to load workspace details", err);
          if (!cancelled) {
            setWorkspaceName("Workspace");
          }
        }
      };
      loadWorkspaceName();
    } else {
      setWorkspaceName("Workspace");
    }

    return () => {
      cancelled = true;
    };
  }, [workspaceId, currentWorkspace?.name, workspaces]);

  const handleToggleWorkspace = async () => {
    if (!workspaceId || workspaceOnline === null) return;
    setAvailabilityLoading(true);
    setAvailabilityError(null);
    try {
      const response = await workspaceHoursAPI.updateWorkspaceOnlineStatus(
        workspaceId,
        !workspaceOnline
      );
      setWorkspaceOnline(response.workspace_online);
    } catch (err: unknown) {
      console.error("Failed to update workspace status", err);
      setAvailabilityError(
        err instanceof Error ? err.message : "Failed to update workspace availability"
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const getUserName = () => {
    if (dashboardData?.user_profile?.first_name) {
      return dashboardData.user_profile.first_name;
    }
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    return user?.email?.split("@")[0] || "User";
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-sky-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-[#0b1220] p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {getUserName()}
              </h1>
              <p className="text-white/70 text-sm">
                Overview of your knowledge base, integrations, and performance.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <p className="text-sm text-white/60">Last updated</p>
              <p className="text-lg font-semibold text-white">
                {dashboardData?.quick_stats ? "Just now" : "—"}
              </p>
            </div>
            <button
              onClick={handleToggleWorkspace}
              disabled={
                availabilityLoading || workspaceOnline === null || !workspaceId
              }
              className={`inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition ${
                availabilityLoading || !workspaceId
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-white/20"
              }`}
            >
              {availabilityLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Power
                  className={`h-4 w-4 ${
                    workspaceOnline ? "text-sky-400" : "text-sky-400"
                  }`}
                />
              )}
              {workspaceOnline ? "Workspace Online" : "Workspace Offline"}
            </button>
            {availabilityError && (
              <p className="text-xs text-red-300">{availabilityError}</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Monthly Messages
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.quick_stats?.this_month_interactions?.toLocaleString() ??
                  "0"}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-sm font-medium text-gray-700">
            {dashboardData?.quick_stats?.this_week_interactions ?? 0} this week
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Integrations</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.workspace_summary?.active_integrations ?? 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <Link2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-sm font-medium text-sky-700">
            All systems operational
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Response Time</p>
              <p className="text-2xl font-bold text-gray-900">0.8s</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-sm font-medium text-sky-700">
            -0.2s improvement
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <h3 className="mb-6 text-xl font-bold text-gray-900">
          Platform Status
        </h3>
        {dashboardData?.workspace_summary?.total_integrations === 0 ? (
          <div className="py-8 text-center">
            <p className="mb-4 text-gray-500">No integrations yet</p>
            <Link
              href="/dashboard/integrations"
              className="inline-block rounded-lg bg-sky-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-sky-700"
            >
              Add Integration
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-white">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="font-medium text-gray-900">System</span>
              </div>
              <span className="text-sm font-medium text-sky-700">Online</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-white">⚠</div>
                <span className="font-medium text-gray-900">WhatsApp</span>
              </div>
              <span className="text-sm font-medium text-sky-700">Issues</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-white">✓</div>
                <span className="font-medium text-gray-900">Discord</span>
              </div>
              <span className="text-sm font-medium text-sky-700">Online</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
