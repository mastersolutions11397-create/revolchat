"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WorkspaceSelectionPage() {
  const { user, signOut } = useAuth();
  const {
    workspaces,
    createWorkspace,
    fetchWorkspaces,
    selectWorkspace,
    loading,
    error,
  } = useWorkspace();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectingWorkspace, setSelectingWorkspace] = useState<string | null>(
    null
  );

  const handleSignOut = async () => {
    await signOut();
  };

  const handleWorkspaceSelect = async (workspaceId: string) => {
    if (selectingWorkspace) return; // Prevent multiple clicks

    try {
      setSelectingWorkspace(workspaceId);
      console.log("Selecting workspace:", workspaceId);
      await selectWorkspace(workspaceId);
      console.log("Workspace selected successfully, navigating to dashboard");
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to select workspace:", err);
      setSelectingWorkspace(null);
    }
  };

  // Fetch workspaces when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchWorkspaces();
    }
  }, [user?.id, fetchWorkspaces]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Validate workspace name before attempting to create
    const trimmedName = workspaceName.trim();
    if (!trimmedName) {
      setLocalError("Workspace name is required");
      return;
    }

    if (trimmedName.length < 3) {
      setLocalError("Workspace name must be at least 3 characters");
      return;
    }

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createWorkspace({
        name: trimmedName,
        description: workspaceDescription.trim() || undefined,
        workspace_type: "personal",
      });

      // Redirect to dashboard after successful creation
      router.push("/dashboard");
    } catch (err: any) {
      const errorMessage =
        err.message || "An error occurred while creating workspace";
      setLocalError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setLocalError("");
    setWorkspaceName("");
    setWorkspaceDescription("");
    setIsSubmitting(false);
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
              Your Workspaces
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select an existing workspace or create a new one to get started
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && workspaces.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Loading your workspaces...</p>
            </div>
          ) : (
            <>
              {/* Workspaces Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* Existing Workspaces */}
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    onClick={() => handleWorkspaceSelect(workspace.id)}
                    className={`yeti-card rounded-2xl p-6 yeti-shadow hover:shadow-xl transition-all cursor-pointer group ${
                      selectingWorkspace === workspace.id
                        ? "opacity-75 pointer-events-none"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        {selectingWorkspace === workspace.id ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                          <span className="text-2xl text-white">🏢</span>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{workspace.agent_count} agents</div>
                        <div>{workspace.member_count} members</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {workspace.name}
                    </h3>
                    {workspace.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {workspace.description}
                      </p>
                    )}
                    <div className="text-xs text-gray-500">
                      Created{" "}
                      {new Date(workspace.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}

                {/* Add New Workspace Card */}
                <div
                  onClick={() => setIsModalOpen(true)}
                  className="yeti-card rounded-2xl p-6 yeti-shadow hover:shadow-xl transition-all cursor-pointer group border-2 border-dashed border-gray-300 hover:border-purple-400"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl text-white">➕</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center group-hover:text-purple-600 transition-colors">
                    Create New Workspace
                  </h3>
                  <p className="text-gray-600 text-sm text-center">
                    Start fresh with a new personal workspace for your AI agent
                    projects
                  </p>
                </div>
              </div>

              {/* Empty State */}
              {workspaces.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-5xl text-gray-400">🏢</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    No workspaces yet
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Create your first workspace to start building and managing
                    your AI agents
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    Create Your First Workspace
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Workspace Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="yeti-card rounded-2xl p-8 yeti-shadow max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create Personal Workspace
            </h2>

            {(localError || error) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{localError || error}</p>
              </div>
            )}

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
                  minLength={3}
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
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !workspaceName.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
