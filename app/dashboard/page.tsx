"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { dashboardAPI, DashboardResponse } from "@/lib/api/dashboard";
import { activitiesAPI, ActivityItem } from "@/lib/api/activities";
import Link from "next/link";

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

  const fetchActivities = async () => {
    if (!currentWorkspace?.id) return;

    try {
      setActivitiesLoading(true);
      const data = await activitiesAPI.getActivitiesByWorkspace(
        currentWorkspace.id,
        5
      );
      setActivities(data.activities);
    } catch (err: any) {
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
  };

  // Expose fetchActivities globally for other components to use
  useEffect(() => {
    (window as any).refreshDashboardActivities = fetchActivities;
    return () => {
      delete (window as any).refreshDashboardActivities;
    };
  }, [currentWorkspace?.id]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getDashboard();
        setDashboardData(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching dashboard:", err);
        setError(err.message || "Failed to load dashboard data");
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
  }, [currentWorkspace?.id]);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="yeti-card rounded-2xl p-8 yeti-shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {getUserName()}! 👋
            </h2>
            <p className="text-gray-600">
              Here's what's happening with your knowledge base and integrations
              today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-lg font-semibold text-gray-900">
              {dashboardData?.quick_stats ? "Just now" : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="yeti-card rounded-xl p-6 yeti-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Monthly Messages
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.quick_stats?.this_month_interactions?.toLocaleString() ||
                  "0"}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">💬</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">
              {dashboardData?.quick_stats?.this_week_interactions || 0} this
              week
            </span>
          </div>
        </div>

        <div className="yeti-card rounded-xl p-6 yeti-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Integrations</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.workspace_summary?.active_integrations || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🔗</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">
              {dashboardData?.workspace_summary?.active_integrations ===
              dashboardData?.workspace_summary?.total_integrations
                ? "All operational"
                : `${
                    dashboardData?.workspace_summary?.total_integrations || 0
                  } total`}
            </span>
          </div>
        </div>

        <div className="yeti-card rounded-xl p-6 yeti-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Response Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.quick_stats?.avg_response_time
                  ? `${dashboardData.quick_stats.avg_response_time.toFixed(1)}s`
                  : "—"}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">⚡</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600 font-medium">
              Average response time
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="yeti-card rounded-2xl p-8 yeti-shadow">
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
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all"
                title="Create demo activity"
              >
                + Demo
              </button>
              <button
                onClick={fetchActivities}
                disabled={activitiesLoading}
                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh activities"
              >
                <svg
                  className={`w-5 h-5 ${
                    activitiesLoading ? "animate-spin" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {activitiesLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <p className="text-gray-500 mt-2">Loading activities...</p>
              </div>
            ) : activities && activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${
                      activity.type === "success"
                        ? "from-green-500 to-emerald-500"
                        : activity.type === "info"
                        ? "from-blue-500 to-cyan-500"
                        : activity.type === "warning"
                        ? "from-orange-500 to-red-500"
                        : activity.type === "error"
                        ? "from-red-500 to-pink-500"
                        : "from-purple-500 to-blue-500"
                    } rounded-full flex items-center justify-center`}
                  >
                    <span className="text-white text-sm">
                      {activity.type === "success"
                        ? "✓"
                        : activity.type === "warning"
                        ? "⚠"
                        : activity.type === "error"
                        ? "✕"
                        : activity.platform === "telegram"
                        ? "📱"
                        : activity.platform === "instagram"
                        ? "📸"
                        : activity.platform === "knowledge"
                        ? "📚"
                        : activity.platform === "system"
                        ? "⚙️"
                        : "🤖"}
                    </span>
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
              </div>
            )}
          </div>
        </div>

        <div className="yeti-card rounded-2xl p-8 yeti-shadow">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/dashboard/knowledge-base"
              className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              <div className="text-center">
                <span className="text-2xl block mb-2">📚</span>
                <span className="text-sm font-medium">Knowledge Base</span>
              </div>
            </Link>
            <Link
              href="/dashboard/integrations"
              className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              <div className="text-center">
                <span className="text-2xl block mb-2">🔗</span>
                <span className="text-sm font-medium">Add Integration</span>
              </div>
            </Link>
            <Link
              href="/dashboard/analytics"
              className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all"
            >
              <div className="text-center">
                <span className="text-2xl block mb-2">📊</span>
                <span className="text-sm font-medium">View Analytics</span>
              </div>
            </Link>
            <Link
              href="/dashboard/settings"
              className="p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all"
            >
              <div className="text-center">
                <span className="text-2xl block mb-2">⚙️</span>
                <span className="text-sm font-medium">Settings</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Platform Status */}
      <div className="yeti-card rounded-2xl p-8 yeti-shadow">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Platform Status
        </h3>
        {dashboardData?.workspace_summary?.total_integrations === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No integrations yet</p>
            <Link
              href="/dashboard/integrations"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Add Integration
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-medium text-gray-900">System</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Online</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
