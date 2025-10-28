"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";

export default function WorkspaceSelectionPage() {
  const { signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Here you would typically save the workspace to your database
    // For now, we'll just simulate a delay and redirect to dashboard
    setTimeout(() => {
      setLoading(false);
      setIsModalOpen(false);
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link
                  href="/"
                  className="text-2xl font-bold yeti-gradient bg-clip-text text-transparent"
                >
                  🧊 Yeti AI
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Create Your Workspace
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started by creating your personal workspace
            </p>
          </div>

          {/* Create Workspace Button */}
          <div className="text-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="yeti-card rounded-2xl p-12 yeti-shadow hover:shadow-xl transition-all cursor-pointer group inline-block"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-5xl text-white">➕</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Create New Workspace
              </h3>
              <p className="text-gray-600 max-w-md">
                Start fresh with a new personal workspace for your AI agent
                projects
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Create Workspace Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="yeti-card rounded-2xl p-8 yeti-shadow max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create Personal Workspace
            </h2>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label
                  htmlFor="workspaceName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Workspace Name
                </label>
                <input
                  type="text"
                  id="workspaceName"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g., My Personal Workspace"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="workspaceDescription"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="workspaceDescription"
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  placeholder="Describe your workspace"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
