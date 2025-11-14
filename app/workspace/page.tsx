"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Plus, Loader2 } from "lucide-react";
// import { PromoCard } from "@/components/ui/card-9";
// import { AnimatePresence } from "framer-motion";
import { WorkspaceCard } from "@/components/ui/workspace-card";
import Modal from "@/components/ui/modal-drop";
// import { ShimmerGradient } from "@/components/ui/shimmer-gradient";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import type { WorkspaceListResponse } from "@/lib/api/workspace";
import { yettiOnboardingAPI } from "@/lib/api";
import WorkspaceOnboardingModal from "@/components/workspace/WorkspaceOnboardingModal";

export default function WorkspaceSelectionPage() {
  const { signOut } = useAuth();
  const {
    workspaces,
    createWorkspace,
    selectWorkspace,
    fetchWorkspaces,
    loading,
    error,
  } = useWorkspace();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [isPromoVisible, setIsPromoVisible] = useState(true);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectingWorkspace, setSelectingWorkspace] = useState<string | null>(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [pendingWorkspace, setPendingWorkspace] = useState<{
    id: string;
    name?: string;
  } | null>(null);

  const handleSignOut = async () => {
    await signOut();
  };

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
      const workspace = await createWorkspace({
        name: trimmedName,
        description: workspaceDescription.trim() || undefined,
        workspace_type: "personal",
      });

      handleCloseModal();
      setPendingWorkspace({
        id: workspace.id,
        name: workspace.name,
      });
      setShowOnboardingModal(true);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while creating workspace";
      setLocalError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorkspaceSelect = async (
    workspaceId: string,
    workspaceName?: string
  ) => {
    try {
      setLocalError("");
      setSelectingWorkspace(workspaceId);
      await selectWorkspace(workspaceId);

      const status = await yettiOnboardingAPI
        .getOnboardingStatus(workspaceId)
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
        setPendingWorkspace({ id: workspaceId, name: workspaceName });
        setShowOnboardingModal(true);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Error selecting workspace:", err);
      const message =
        err instanceof Error
          ? err.message
          : "An error occurred while selecting workspace";
      setLocalError(message);
    } finally {
      setSelectingWorkspace(null);
    }
  };

  const handleOnboardingModalClose = () => {
    setShowOnboardingModal(false);
    setPendingWorkspace(null);
  };

  const handleOnboardingCompleted = () => {
    setShowOnboardingModal(false);
    setPendingWorkspace(null);
    void fetchWorkspaces();
    router.push("/dashboard");
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
      <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-950">
        {/* Navigation */}
        <nav className="absolute top-0 w-full z-40 border-b border-gray-200/60 bg-white backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-3">
                <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                  YETTI<span className="text-gray-400">.AI</span>
                </span>
                </Link>
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="px-3 py-2 rounded-md text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Profile
                </Link>
                <Button variant="outline" onClick={handleSignOut} className="h-9">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Header */}
       

        {/* Main Content */}
        <main className="pb-16 flex flex-col items-center justify-center h-screen ">
           <header className="relative pt-28 sm:pt-32 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Your Workspaces
            </h1>
              <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
                Select a workspace to continue or create a new one.
            </p>
            
            </div>
          </div>
        </header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Promo Card */}

          {/* Error Display */}
          {(error || localError) && (
              <div className="mb-8">
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="py-4">
                    <p className="text-red-700 text-sm text-center">{error || localError}</p>
                  </CardContent>
                </Card>
            </div>
          )}

          {/* Loading State */}
            {loading && workspaces.length === 0 ? (
              <div className="py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="rounded-2xl border bg-card w-[350px] p-6">
                      <div className="flex items-start gap-10 justify-between">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-2 w-24">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-3/4 mt-4 rounded-md" />
                      <Skeleton className="h-3 w-full mt-2" />
                      <Skeleton className="h-3 w-2/3 mt-2" />
                      <Skeleton className="h-3 w-32 mt-4" />
                    </div>
                  ))}
                </div>
              </div>
          ) : (
            <>
                {workspaces.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workspaces.map((workspace: WorkspaceListResponse["workspaces"][0]) => {
                      const isSelecting = selectingWorkspace === workspace.id;
                      return (
                        <WorkspaceCard
                    key={workspace.id}
                          name={workspace.name}
                          agents={workspace.agent_count}
                          members={workspace.member_count}
                          isSelecting={isSelecting}
                          onOpen={() =>
                            handleWorkspaceSelect(workspace.id, workspace.name)
                          }
                        />
                      );
                    })}
                    {/* Add New Workspace */}
                    <Card
                      onClick={() => setIsModalOpen(true)}
                      className="border rounded-2xl! py-6 hover:border-sky-500 group cursor-pointer transition-colors"
                    >
                      <CardContent className="p-6  h-full flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-gray-900 group-hover:bg-sky-500 text-white flex items-center justify-center">
                          <Plus className="w-6 h-6 " />
                      </div>
                        <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-sky-500">
                          Create New Workspace
                    </h3>
                        <p className="mt-1 text-sm text-gray-600 max-w-xs">
                          Start fresh with a new personal workspace for your AI agent projects.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

              {/* Empty State */}
              {workspaces.length === 0 && !loading && (
                  <div className="py-16 flex items-center justify-center">
                    <Card className="max-w-xl w-full p-6">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center mx-auto shadow-md">
                          <Building2 className="w-8 h-8" />
                  </div>
                        <h3 className="mt-6 text-2xl font-semibold text-gray-900">
                    No workspaces yet
                  </h3>
                        <p className="mt-2 text-gray-600">
                          Create your first workspace to start building and managing your AI agents.
                        </p>
                        <div className="mt-6">
                          <Button onClick={() => setIsModalOpen(true)} className="px-6 h-11">
                            <Plus className="w-4 h-4 mr-2" /> Create your first workspace
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                </div>
              )}
            </>
          )}
        </div>
        </main>
      </div>

      {/* Create Workspace Modal via modal-drop with two-column layout */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        animationType="scale"
        type="overlay"
        disablePadding
        className="sm:max-w-4xl md:max-w-5xl lg:max-w-6xl p-0 overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left visual */}
          <div className="relative hidden md:block bg-white p-2">
            <div className="relative h-full min-h-[460px] rounded-2xl overflow-hidden bg-[radial-gradient(900px_400px_at_60%_-20%,#0ea5e9_0%,#0b1220_70%)]">
              <Image src="/yetti/yetti_laying.png" alt="Yetti resting" fill className="object-contain p-6" />
            </div>
          </div>

          {/* Right form */}
          <div className="p-6 md:p-8 bg-background">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-foreground">Create Personal Workspace</h2>
              <p className="text-sm text-muted-foreground">Set a name and optional description to begin.</p>
            </div>

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
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isSubmitting} className="flex-1 h-11">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !workspaceName.trim()} className="flex-1 h-11">
                  {isSubmitting ? (
                    <span className="inline-flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating…</span>
                  ) : (
                    "Create Workspace"
                  )}
                </Button>

              </div>
            </form>
          </div>
        </div>
      </Modal>
      <WorkspaceOnboardingModal
        isOpen={showOnboardingModal}
        workspaceId={pendingWorkspace?.id ?? null}
        workspaceName={pendingWorkspace?.name}
        onClose={handleOnboardingModalClose}
        onCompleted={handleOnboardingCompleted}
      />
    </ProtectedRoute>
  );
}
