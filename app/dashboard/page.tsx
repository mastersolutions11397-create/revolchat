"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { dashboardAPI, type DashboardResponse, activitiesAPI, type ActivityItem } from "@/lib/api";
import Link from "next/link";
import {
  MessageSquare,
  Link2,
  Zap,
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  BookOpen,
  Settings,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    try {
      setActivitiesLoading(true);
      const data = await activitiesAPI.getActivitiesByWorkspace(
        currentWorkspace.id,
        5
      );
      setActivities(data.activities);
    } catch (err: unknown) {
      console.error("Error fetching activities:", err);
      // Set mock activities on error
      setActivities([
        {
          id: "1",
          type: "success",
          message: "Knowledge base updated successfully",
          platform: "knowledge",
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
          metadata: {
            workspace_id: currentWorkspace.id,
          },
        },
        {
          id: "2",
          type: "info",
          message: "New integration connected to Instagram",
          platform: "instagram",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
          metadata: {
            workspace_id: currentWorkspace.id,
            integration_id: "ig_123",
          },
        },
        {
          id: "3",
          type: "success",
          message: "AI agent responded to 5 messages",
          platform: "telegram",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          metadata: {
            workspace_id: currentWorkspace.id,
            agent_id: "agent_456",
          },
        },
        {
          id: "4",
          type: "warning",
          message: "Integration rate limit approaching",
          platform: "telegram",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          metadata: {
            workspace_id: currentWorkspace.id,
            integration_id: "tg_789",
          },
        },
        {
          id: "5",
          type: "success",
          message: "Workspace created successfully",
          platform: "system",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          metadata: {
            workspace_id: currentWorkspace.id,
          },
        },
      ]);
    } finally {
      setActivitiesLoading(false);
    }
  }, [currentWorkspace?.id]);

  // Expose fetchActivities globally for other components to use
  useEffect(() => {
    const w = window as Window & { refreshDashboardActivities?: () => void };
    w.refreshDashboardActivities = fetchActivities;
    return () => {
      delete w.refreshDashboardActivities;
    };
  }, [currentWorkspace?.id, fetchActivities]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getDashboard();
        setDashboardData(data);
        setError(null);
      } catch (err: unknown) {
        console.error("Error fetching dashboard:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        // Set mock data on error for now
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
    if (currentWorkspace?.id) {
      fetchActivities();
    }
  }, [currentWorkspace?.id, fetchActivities]);

  const getUserName = () => {
    if (dashboardData?.user_profile?.first_name) {
      return dashboardData.user_profile.first_name;
    }
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    return user?.email?.split("@")[0] || "User";
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5170ff] mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section (important card - navy) */}
      <div className="rounded-2xl p-8 shadow-sm border bg-[#0b1220]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-2">
              Welcome back, {getUserName()}
            </h2>
            <p className="text-white/70">
              Overview of your knowledge base, integrations, and performance.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/60">Last updated</p>
            <p className="text-lg font-semibold text-white">
              {dashboardData?.quick_stats ? "Just now" : "—"}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#5170ff]/20 text-[#cce068] border border-[#5170ff]/30">
            Live
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white border border-white/20">
            Light theme
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-xl p-6 shadow-md bg-[#5170ff] text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">
                Monthly Messages
              </p>
              <p className="text-2xl font-bold text-white">
                {dashboardData?.quick_stats?.this_month_interactions?.toLocaleString() ||
                  "0"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/20 text-white">
              <MessageSquare className="w-5 h-5"/>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-white/90 font-medium">
              {dashboardData?.quick_stats?.this_week_interactions || 0} this
              week
            </span>
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-md bg-[#cce068]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Integrations</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.workspace_summary?.active_integrations || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/40 text-gray-900">
              <Link2 className="w-5 h-5"/>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">
              All systems operational
            </span>
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-md bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Response Time</p>
              <p className="text-2xl font-bold text-gray-900">0.8s</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#5170ff]/10 text-[#5170ff]">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">
              -0.2s improvement
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl p-8 shadow-md bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={async () => {
                  if (currentWorkspace?.id) {
                    try {
                      await activitiesAPI.createActivity({
                        type: "info",
                        message: "Demo activity created",
                        platform: "system",
                        metadata: { workspace_id: currentWorkspace.id },
                      });
                      fetchActivities();
                    } catch (error) {
                      console.error("Error creating demo activity:", error);
                    }
                  }
                }}
                className="px-3 py-1 text-xs bg-[#5170ff]/10 text-[#5170ff] rounded-lg hover:bg-[#5170ff]/20 transition-all"
                title="Create demo activity"
              >
                Create
              </button>
              <button
                onClick={fetchActivities}
                disabled={activitiesLoading}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh activities"
              >
                <svg className={`w-5 h-5 ${activitiesLoading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.58M20 12a8 8 0 10-7.42 7.95M20 20v-5h-.58" />
                </svg>
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {activitiesLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#5170ff]"></div>
                <p className="text-gray-500 mt-2">Loading activities...</p>
              </div>
            ) : activities && activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                      activity.type === "success"
                        ? "bg-green-500"
                        : activity.type === "info"
                        ? "bg-blue-500"
                        : activity.type === "warning"
                        ? "bg-orange-500"
                        : activity.type === "error"
                        ? "bg-red-500"
                        : "bg-gray-900"
                    }`}
                  >
                    {activity.type === "success" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : activity.type === "warning" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : activity.type === "error" ? (
                      <XCircle className="w-5 h-5" />
                    ) : activity.platform === "knowledge" ? (
                      <BookOpen className="w-5 h-5" />
                    ) : activity.platform === "instagram" || activity.platform === "telegram" ? (
                      <MessageSquare className="w-5 h-5" />
                    ) : activity.platform === "system" ? (
                      <Settings className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400 mt-2">
                  Add knowledge or create integrations to get started
                </p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            )}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  WhatsApp integration needs attention
                </p>
                <p className="text-xs text-gray-500">3 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions removed per request */}
      </div>

      {/* Platform Status */}
      <div className="rounded-2xl p-8 shadow-md bg-white">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Platform Status
        </h3>
        {dashboardData?.workspace_summary?.total_integrations === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No integrations yet</p>
            <Link
              href="/dashboard/integrations"
              className="inline-block bg-[#5170ff] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4663e6] transition-colors"
            >
              Add Integration
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-900">System</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">⚠</span>
                </div>
                <span className="font-medium text-gray-900">WhatsApp</span>
              </div>
              <span className="text-sm text-yellow-600 font-medium">Issues</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-medium text-gray-900">Discord</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Online</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
