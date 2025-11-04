"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    // TODO: Fetch analytics from API
    setLoading(false);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">
          Track your AI agent performance and insights
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="yeti-card rounded-xl p-6 yeti-shadow">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Total Messages
              </p>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-sm text-green-600 mt-2">+0% from last month</p>
            </div>
            <div className="yeti-card rounded-xl p-6 yeti-shadow">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Active Users
              </p>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-sm text-green-600 mt-2">+0% from last month</p>
            </div>
            <div className="yeti-card rounded-xl p-6 yeti-shadow">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Avg Response Time
              </p>
              <p className="text-3xl font-bold text-gray-900">—</p>
              <p className="text-sm text-gray-600 mt-2">No data yet</p>
            </div>
            <div className="yeti-card rounded-xl p-6 yeti-shadow">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Satisfaction Score
              </p>
              <p className="text-3xl font-bold text-gray-900">—</p>
              <p className="text-sm text-gray-600 mt-2">No data yet</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="yeti-card rounded-2xl p-8 yeti-shadow">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Message Volume
              </h2>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>Chart will appear here once you have data</p>
              </div>
            </div>
            <div className="yeti-card rounded-2xl p-8 yeti-shadow">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Platform Distribution
              </h2>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>Chart will appear here once you have data</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="yeti-card rounded-2xl p-8 yeti-shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Recent Activity
            </h2>
            <div className="text-center py-12">
              <p className="text-gray-500">No activity data available yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Start using your agents to see analytics
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
