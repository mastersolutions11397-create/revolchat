"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  dashboardAPI,
  type DashboardResponse,
  workspaceHoursAPI,
  workspaceAPI,
  integrationsAPI,
  yettiOnboardingAPI,
} from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { formatNumberInK } from "@/lib/utils";
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
  Crown,
  Plus,
} from "lucide-react";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { useOnboardingTour } from "@/lib/contexts/OnboardingTourContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import WorkspaceOnboardingModal from "@/components/workspace/WorkspaceOnboardingModal";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlWorkspaceId = searchParams.get("ws");
  const {
    currentWorkspace,
    selectedWorkspaceId,
    workspaces,
    hasWorkspaces,
    createWorkspace,
    selectWorkspace,
    loading: workspaceLoading,
  } = useWorkspace();
  const {
    startTour,
    onWorkspaceCreated,
    onOnboardingModalCompleted,
    tourStatus,
    loading: tourLoading,
  } = useOnboardingTour();
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

  // Integration states
  const [instagramIntegration, setInstagramIntegration] = useState<{
    username: string;
    profile_picture: string | null;
  } | null>(null);
  const [telegramBotInfo, setTelegramBotInfo] = useState<{
    username: string;
    first_name: string;
  } | null>(null);
  const [integrationsLoading, setIntegrationsLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<{
    plan_name: string;
    status: string;
    current_period_end?: string | null;
  } | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [messageCountLoading, setMessageCountLoading] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [pendingWorkspace, setPendingWorkspace] = useState<{
    id: string;
    name?: string;
  } | null>(null);

  // Check if new user needs to create a workspace
  // NEVER open modal if there's already a workspace created
  useEffect(() => {
    // ALWAYS close modal if any workspace exists (multiple checks for safety)
    if (
      workspaces.length > 0 ||
      selectedWorkspaceId ||
      currentWorkspace ||
      urlWorkspaceId ||
      workspaceId
    ) {
      setShowNewUserModal(false);
      return;
    }

    // Only show modal if:
    // 1. User is logged in
    // 2. Workspaces have finished loading
    // 3. No workspaces exist (double-check)
    // 4. No workspace ID in URL
    if (
      user &&
      !workspaceLoading &&
      !hasWorkspaces &&
      workspaces.length === 0 &&
      !urlWorkspaceId &&
      !selectedWorkspaceId &&
      !currentWorkspace
    ) {
      setShowNewUserModal(true);
    } else {
      // Ensure modal is closed if any condition fails
      setShowNewUserModal(false);
    }
  }, [
    user,
    workspaceLoading,
    hasWorkspaces,
    workspaces.length,
    selectedWorkspaceId,
    currentWorkspace,
    urlWorkspaceId,
    workspaceId,
  ]);

  // Auto-start tour for new users who haven't completed it
  // Skip if workspace ID is in URL (ws parameter)
  useEffect(() => {
    console.log("Tour auto-start check:", {
      user: !!user,
      tourLoading,
      workspaceLoading,
      hasWorkspaces,
      tourStatus,
      urlWorkspaceId,
    });

    // Don't auto-start tour if workspace ID is in URL
    if (urlWorkspaceId) {
      console.log("Workspace ID in URL, skipping tour auto-start");
      return;
    }

    if (
      user &&
      !tourLoading &&
      !workspaceLoading &&
      tourStatus === "not_started"
    ) {
      console.log("Starting tour automatically for new user");
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        console.log("Calling startTour()");
        startTour()
          .then(() => {
            console.log("Tour started successfully");
          })
          .catch((err) => {
            console.error("Failed to start tour:", err);
          });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [
    user,
    tourLoading,
    workspaceLoading,
    tourStatus,
    startTour,
    urlWorkspaceId,
  ]);

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
            err.message.toLowerCase().includes("not found") ||
            err.message.toLowerCase().includes("schedule"))
        ) {
          // Workspace schedule not found - this is normal for new workspaces
          console.log("Workspace hours not configured yet, using defaults");
          setWorkspaceOnline(true);
        } else {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to load workspace availability";
          console.error("Failed to load workspace availability", err);
          setAvailabilityError(errorMessage);
          // Don't show toast for new workspaces - just log and use defaults
          console.warn("Using default workspace settings for new workspace");
          setWorkspaceOnline(true);
        }
      } finally {
        setAvailabilityLoading(false);
      }
    };
    fetchAvailability();
  }, [workspaceId]);

  // Fetch user plan
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!user?.id) {
        setPlanLoading(false);
        return;
      }

      try {
        const { data: plans, error: planError } = await supabase
          .from("user_plans")
          .select("plan_name, status, current_period_end")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1);

        if (planError) {
          console.error("Failed to fetch plan data:", planError);
          setUserPlan({ plan_name: "Free", status: "active" });
        } else {
          setUserPlan(
            plans && plans.length > 0
              ? plans[0]
              : { plan_name: "Free", status: "active" }
          );
        }
      } catch (error) {
        console.error("Error fetching user plan:", error);
        setUserPlan({ plan_name: "Free", status: "active" });
      } finally {
        setPlanLoading(false);
      }
    };

    fetchUserPlan();
  }, [user?.id]);

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

              // If access denied, clear the invalid workspace ID from localStorage
              if (
                err instanceof Error &&
                err.message.toLowerCase().includes("access denied")
              ) {
                console.log("Clearing invalid workspace ID from localStorage");
                try {
                  localStorage.removeItem("selectedWorkspaceId");
                  // Also clear cookie
                  document.cookie = "selectedWorkspaceId=; path=/; max-age=0; SameSite=Lax";
                } catch {
                  // ignore localStorage errors
                }

              // Try to select the first available workspace
              if (workspaces.length > 0) {
                console.log("Selecting first available workspace");
                selectWorkspace(workspaces[0].id).catch(console.error);
              }
            }

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

  // Fetch integration status
  useEffect(() => {
    let cancelled = false;

    async function checkIntegrations() {
      if (!workspaceId) {
        setInstagramIntegration(null);
        setTelegramBotInfo(null);
        return;
      }

      setIntegrationsLoading(true);

      try {
        // Check Instagram
        const instagramData =
          await integrationsAPI.getInstagramIntegration(workspaceId);
        if (!cancelled) {
          setInstagramIntegration(instagramData);
        }

        // Check Telegram
        const telegramData =
          await integrationsAPI.getTelegramBotInfo(workspaceId);
        if (!cancelled) {
          setTelegramBotInfo(telegramData);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error checking integrations:", error);
        }
      } finally {
        if (!cancelled) {
          setIntegrationsLoading(false);
        }
      }
    }

    checkIntegrations();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  // Fetch message count from yetti_chat_history directly from Supabase
  useEffect(() => {
    let cancelled = false;

    async function fetchMessageCount() {
      if (!workspaceId) {
        console.log("No workspace ID available");
        setMessageCount(0);
        return;
      }

      console.log("Fetching message count for workspace:", workspaceId);
      setMessageCountLoading(true);

      try {
        const { count, error } = await supabase
          .from("yetti_chat_history")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId);

        if (error) {
          console.error("Error fetching message count:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
          if (!cancelled) {
            setMessageCount(0);
          }
        } else {
          console.log("Message count fetched successfully:", count);
          if (!cancelled) {
            setMessageCount(count || 0);
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Exception fetching message count:", error);
          setMessageCount(0);
        }
      } finally {
        if (!cancelled) {
          setMessageCountLoading(false);
        }
      }
    }

    fetchMessageCount();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

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

  const handleCreateFirstWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newWorkspaceName.trim();
    if (!trimmedName || trimmedName.length < 3) {
      toast.error("Workspace name must be at least 3 characters");
      return;
    }

    setCreatingWorkspace(true);
    try {
      const workspace = await createWorkspace({
        name: trimmedName,
        workspace_type: "personal",
      });

      // Select the newly created workspace
      await selectWorkspace(workspace.id);

      setShowNewUserModal(false);
      setNewWorkspaceName("");

      // Check onboarding status
      // Skip onboarding modal and tour if workspace ID is in URL (ws parameter)
      let status = null;
      if (!urlWorkspaceId) {
        status = await yettiOnboardingAPI
          .getOnboardingStatus(workspace.id)
          .catch((err: unknown) => {
            if (
              err instanceof Error &&
              (err.message.includes("404") ||
                err.message.toLowerCase().includes("not found"))
            ) {
              return null;
            }
            throw err;
          });

        if (!status || !status.is_onboarded) {
          setPendingWorkspace({
            id: workspace.id,
            name: workspace.name,
          });
          setShowOnboardingModal(true);
        }
      } else {
        console.log("Workspace ID in URL, skipping onboarding modal and tour");
      }

      // Start the tour for new users creating their first workspace
      // Skip if workspace ID is in URL
      if (!urlWorkspaceId && tourStatus === "not_started" && !tourLoading) {
        console.log(
          "Starting tour for new user after first workspace creation"
        );
        startTour()
          .then(() => {
            console.log("Tour started, triggering workspace created callback");
            // Give the tour a moment to activate before triggering callback
            // Only advance if onboarding modal won't show (already onboarded)
            if (status && status.is_onboarded) {
              setTimeout(() => {
                onWorkspaceCreated();
              }, 500);
            } else {
              // Wait for onboarding modal to open, then advance sub-step
              setTimeout(() => {
                onWorkspaceCreated();
              }, 1000);
            }
          })
          .catch((err) => {
            console.error("Failed to start tour:", err);
          });
      } else if (!urlWorkspaceId) {
        // Trigger tour callback for workspace creation (if tour already active)
        // Only advance if onboarding modal won't show
        if (status && status.is_onboarded) {
          // Skip onboarding, go directly to knowledge base
          onWorkspaceCreated();
          setTimeout(() => {
            onOnboardingModalCompleted();
          }, 100);
        } else {
          // Wait for onboarding modal to open
          setTimeout(() => {
            onWorkspaceCreated();
          }, 1000);
        }
      }
    } catch (err) {
      console.error("Failed to create workspace:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to create workspace"
      );
    } finally {
      setCreatingWorkspace(false);
    }
  };

  const handleOnboardingCompleted = () => {
    setShowOnboardingModal(false);
    setPendingWorkspace(null);
    toast.success("Workspace setup complete!");

    // Trigger tour callback for onboarding modal completion
    onOnboardingModalCompleted();

    // Also start the tour if it's not started yet
    // Skip if workspace ID is in URL (ws parameter)
    if (!urlWorkspaceId && tourStatus === "not_started" && !tourLoading) {
      console.log("Starting tour after workspace onboarding completion");
      setTimeout(() => {
        startTour().catch((err) => {
          console.error("Failed to start tour after onboarding:", err);
        });
      }, 500);
    } else if (urlWorkspaceId) {
      console.log("Workspace ID in URL, skipping tour start after onboarding");
    }
  };

  if (loading || workspaceLoading) {
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
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-sky-900 p-8 text-white shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5">
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
                {workspaceOnline ? "Yetti On" : "Yetti Off"}
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
                Total Messages
              </p>
              {messageCountLoading ? (
                <div className="mt-2">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : (
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {formatNumberInK(messageCount)}
                </p>
              )}
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
              {integrationsLoading ? (
                <div className="mt-2">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : (
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {(instagramIntegration ? 1 : 0) + (telegramBotInfo ? 1 : 0)}
                </p>
              )}
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

        {/* Current Plan */}
        <Link
          href="/dashboard/plans"
          className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-violet-100 block"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Current Plan
              </p>
              {planLoading ? (
                <div className="mt-2">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : (
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {userPlan?.plan_name || "Free"}
                </p>
              )}
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-500 group-hover:text-white">
              <Crown className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span
              className={`flex items-center gap-1 font-medium px-2 py-0.5 rounded-full ${
                userPlan?.status === "active"
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-slate-600 bg-slate-100"
              }`}
            >
              <CheckCircle2 className="h-3 w-3" />
              {userPlan?.status === "active" ? "Active" : "Inactive"}
            </span>
            <span className="text-slate-500">Click to manage</span>
          </div>
        </Link>
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

        {integrationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
          </div>
        ) : !instagramIntegration && !telegramBotInfo ? (
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
            {instagramIntegration && (
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md hover:border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                    {instagramIntegration.profile_picture ? (
                      <Image
                        src={instagramIntegration.profile_picture}
                        alt={instagramIntegration.username}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <Image
                        src="/yetti/instagram_logo.png"
                        alt="Instagram"
                        width={20}
                        height={20}
                        className="h-5 w-5"
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700">
                      Instagram
                    </span>
                    <span className="text-xs text-slate-500">
                      @{instagramIntegration.username}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-600">
                    Online
                  </span>
                </div>
              </div>
            )}
            {telegramBotInfo && (
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md hover:border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                    <Image
                      src="/yetti/telegram_logo.png"
                      alt="Telegram"
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700">
                      Telegram
                    </span>
                    <span className="text-xs text-slate-500">
                      @{telegramBotInfo.username}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-600">
                    Online
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New User Workspace Creation Modal */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="relative p-8 pb-6 bg-gradient-to-br from-sky-50 to-white border-b border-slate-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900">
                    Welcome to Yetti! 👋
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Let's create your first workspace
                  </p>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed">
                A workspace is where you'll manage your AI agents, knowledge
                base, and integrations. Give it a memorable name to get started.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateFirstWorkspace} className="p-8">
              <div className="mb-6">
                <label
                  htmlFor="first-workspace-name"
                  className="block text-sm font-bold text-slate-700 mb-3"
                >
                  Workspace Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="first-workspace-name"
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="e.g., My Business, Personal Projects, Team Workspace"
                  className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all hover:border-sky-300 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 text-base"
                  minLength={3}
                  required
                  autoFocus
                  data-tour="workspace-name-input"
                />
                <div className="flex items-center gap-2 mt-3">
                  <div
                    className={`h-2 w-2 rounded-full transition-colors ${
                      newWorkspaceName.trim().length >= 3
                        ? "bg-green-500"
                        : "bg-slate-300"
                    }`}
                  />
                  <p
                    className={`text-xs transition-colors ${
                      newWorkspaceName.trim().length >= 3
                        ? "text-green-600 font-medium"
                        : "text-slate-500"
                    }`}
                  >
                    {newWorkspaceName.trim().length >= 3
                      ? "✓ Perfect! You're ready to continue"
                      : "Minimum 3 characters required"}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={
                  creatingWorkspace || newWorkspaceName.trim().length < 3
                }
                className="w-full px-6 py-4 rounded-xl bg-linear-to-r from-sky-500 to-sky-600 text-white font-bold text-lg shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-3"
              >
                {creatingWorkspace ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating Your Workspace...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span>Create Workspace & Continue</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      <WorkspaceOnboardingModal
        isOpen={showOnboardingModal}
        workspaceId={pendingWorkspace?.id ?? null}
        workspaceName={pendingWorkspace?.name}
        onClose={() => {
          setShowOnboardingModal(false);
          setPendingWorkspace(null);
        }}
        onCompleted={handleOnboardingCompleted}
      />
    </div>
  );
}
