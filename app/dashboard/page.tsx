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
  ArrowUpRight,
  Activity,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { toast } from "sonner";

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
        if (
          err instanceof Error &&
          (err.message.includes("404") ||
            err.message.toLowerCase().includes("not found"))
        ) {
          // Workspace schedule not found - this is normal for new workspaces
          setWorkspaceOnline(true);
        } else {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to load workspace availability";
          console.error("Failed to load workspace availability", err);
          setAvailabilityError(errorMessage);
          // Only show toast for non-404 errors
          toast.error("Could not load workspace status", {
            description:
              "Using default settings. You can update them in Working Hours.",
          });
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
          if (!cancelled) {
            console.error("Failed to load workspace details", err);
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
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update workspace availability";
      console.error("Failed to update workspace status", err);
      setAvailabilityError(errorMessage);
      toast.error("Failed to update workspace status", {
        description: errorMessage,
      });
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
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-sky-500" />
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-8 text-white shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner ring-1 ring-white/20">
              <span className="text-3xl">👋</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Welcome back, {getUserName()}
              </h1>
              <p className="mt-1 text-slate-300 text-lg">
                Here's what's happening in your workspace today.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 backdrop-blur-sm ring-1 ring-white/10">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-medium text-slate-200">
                System Operational
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleWorkspace}
                disabled={
                  availabilityLoading ||
                  workspaceOnline === null ||
                  !workspaceId
                }
                className={`group relative inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 ${
                  availabilityLoading || !workspaceId
                    ? "cursor-not-allowed opacity-50 bg-white/5"
                    : workspaceOnline
                      ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-100 ring-1 ring-emerald-500/50"
                      : "bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 ring-1 ring-white/10"
                }`}
              >
                {availabilityLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Power
                    className={`h-4 w-4 transition-colors ${
                      workspaceOnline
                        ? "text-emerald-400"
                        : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                )}
                {workspaceOnline ? "Workspace Online" : "Workspace Offline"}
              </button>
            </div>
            {availabilityError && (
              <p className="text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded">
                {availabilityError}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Monthly Messages */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-sky-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Monthly Messages
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {dashboardData?.quick_stats?.this_month_interactions?.toLocaleString() ??
                  "0"}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 transition-colors group-hover:bg-sky-500 group-hover:text-white">
              <MessageSquare className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="h-3 w-3" />
              {dashboardData?.quick_stats?.this_week_interactions ?? 0}
            </span>
            <span className="text-slate-500">new this week</span>
          </div>
        </div>

        {/* Active Integrations */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Integrations
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {dashboardData?.workspace_summary?.active_integrations ?? 0}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-sky-500 transition-colors group-hover:bg-sky-500 group-hover:text-white">
              <Link2 className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              <Activity className="h-3 w-3" />
              Active
            </span>
            <span className="text-slate-500">All systems operational</span>
          </div>
        </div>

        {/* Response Time */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Avg Response Time
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">0.8s</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
              <Zap className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="h-3 w-3 rotate-180" />
              0.2s
            </span>
            <span className="text-slate-500">improvement</span>
          </div>
        </div>
      </div>

      {/* Platform Status Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Platform Status
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Real-time status of your connected integrations.
            </p>
          </div>
          <Link
            href="/dashboard/integrations"
            className="text-sm font-semibold text-sky-500 hover:text-sky-700 hover:underline"
          >
            Manage Integrations &rarr;
          </Link>
        </div>

        {dashboardData?.workspace_summary?.total_integrations === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Link2 className="h-6 w-6 text-slate-400" />
            </div>
            <p className="mb-4 text-slate-600 font-medium">
              No integrations connected yet
            </p>
            <Link
              href="/dashboard/integrations"
              className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-sky-700 hover:shadow-lg hover:shadow-sky-200 active:scale-95"
            >
              Add Integration
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "System Core",
                status: "Online",
                icon: CheckCircle2,
                color: "text-emerald-500",
                bg: "bg-emerald-50",
              },
              {
                name: "WhatsApp",
                status: "Issues",
                icon: AlertCircle,
                color: "text-amber-500",
                bg: "bg-amber-50",
              },
              {
                name: "Discord",
                status: "Online",
                icon: CheckCircle2,
                color: "text-emerald-500",
                bg: "bg-emerald-50",
              },
              {
                name: "Slack",
                status: "Offline",
                icon: Power,
                color: "text-slate-400",
                bg: "bg-slate-100",
              },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md hover:border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${item.bg} ${item.color}`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-slate-700">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${item.status === "Online" ? "bg-emerald-500 animate-pulse" : item.status === "Issues" ? "bg-amber-500" : "bg-slate-300"}`}
                  />
                  <span
                    className={`text-xs font-medium ${item.status === "Online" ? "text-emerald-600" : item.status === "Issues" ? "text-amber-600" : "text-slate-500"}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
