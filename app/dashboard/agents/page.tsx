"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function AgentsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Fetch agents from API
    setLoading(false);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Agents</h1>
          <p className="text-gray-600 mt-2">Create and manage your AI agents</p>
        </div>
        <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all">
          + Create Agent
        </button>
      </div>

      {/* Agents List */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading agents...</p>
          </div>
        </div>
      ) : agents.length === 0 ? (
        <div className="yeti-card rounded-2xl p-12 yeti-shadow text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl text-white">🤖</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            No AI Agents Yet
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Create your first AI agent to start automating your customer
            interactions across multiple platforms.
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all">
            Create Your First Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="yeti-card rounded-xl p-6 yeti-shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {agent.name}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    agent.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {agent.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{agent.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{agent.message_count || 0} messages</span>
                <span>{agent.integration_count || 0} integrations</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
