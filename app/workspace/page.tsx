"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Loader2,
  Plus,
  AlertCircle,
  Upload,
  X,
  ArrowRight,
} from "lucide-react";
import { WorkspaceCard } from "@/components/ui/workspace-card";
import Modal from "@/components/ui/modal-drop";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import type { WorkspaceListResponse } from "@/lib/api/workspace";
import { yettiOnboardingAPI } from "@/lib/api";
import WorkspaceOnboardingModal from "@/components/workspace/WorkspaceOnboardingModal";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [workspaceLogo, setWorkspaceLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectingWorkspace, setSelectingWorkspace] = useState<string | null>(
    null
  );
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [pendingWorkspace, setPendingWorkspace] = useState<{
    id: string;
    name?: string;
  } | null>(null);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate workspace name before attempting to create
    const trimmedName = workspaceName.trim();
    if (!trimmedName) {
      toast.error("Workspace name is required");
      return;
    }

    if (trimmedName.length < 3) {
      toast.error("Workspace name must be at least 3 characters");
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
      // Don't open onboarding modal automatically after workspace creation
      // User can access it later when they open the workspace
      // The onboarding will be checked when they select/open the workspace
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while creating workspace";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorkspaceSelect = async (
    workspaceId: string,
    workspaceName?: string
  ) => {
    try {
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
      toast.error(message);
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
    toast.success("Welcome to your workspace!");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentStep(1);
    setWorkspaceName("");
    setWorkspaceDescription("");
    setWorkspaceLogo(null);
    setLogoPreview(null);
    setIsSubmitting(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setWorkspaceLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setWorkspaceLogo(null);
    setLogoPreview(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-sky-500/10 to-sky-500/10 blur-[100px] animate-pulse-slow" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-sky-500/10 to-sky-500/10 blur-[100px] animate-pulse-slow delay-1000" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        {/* Navigation */}
        <nav className="absolute top-0 w-full z-40 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link href="/" className="flex items-center gap-3 group">
                <span className="text-2xl font-extrabold tracking-tight text-white group-hover:opacity-80 transition-opacity">
                  Yetti<span className="text-sky-500">.ai</span>
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="h-10 rounded-full border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-white/20"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-20 pb-16">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
                  Your <span className="text-white">Workspaces</span>
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                  Select a workspace to manage your AI agents or create a new
                  one to start a fresh project.
                </p>
              </motion.div>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 max-w-md mx-auto"
              >
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <p className="text-red-400 text-sm font-medium text-center flex-1">
                    {error}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Content Area */}
            <div className="space-y-8">
              {loading && workspaces.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-48 rounded-3xl bg-white/5 border border-white/5 p-6 animate-pulse"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10" />
                        <div className="w-20 h-4 rounded-full bg-white/10" />
                      </div>
                      <div className="space-y-3">
                        <div className="w-3/4 h-6 rounded-lg bg-white/10" />
                        <div className="w-1/2 h-4 rounded-lg bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  {/* Create New Button (Static) */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full lg:w-80 shrink-0"
                  >
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full group min-h-[315px] relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 to-sky-500 p-1 text-left transition-all hover:shadow-2xl hover:shadow-sky-500/25 hover:-translate-y-1"
                    >
                      <div className="relative h-full rounded-[20px] min-h-[315px] bg-slate-900/40 backdrop-blur-sm p-8 transition-all group-hover:bg-slate-900/20">
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner border border-white/20 group-hover:scale-110 transition-transform duration-300">
                          <Plus className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-white">
                          Create New
                        </h3>
                        <p className="text-sky-100/80 text-sm leading-relaxed mb-6">
                          Start a fresh workspace for your next big AI project.
                        </p>
                        <div className="flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
                          Get Started <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  </motion.div>

                  {/* Horizontal Scrollable List */}
                  {workspaces.length > 0 ? (
                    <div className="flex-1 w-full pl-0 overflow-hidden">
                      <div className="flex gap-6 overflow-x-auto pb-8 px-8  scrollbar-hide snap-x">
                        {workspaces.map((workspace, index) => (
                          <motion.div
                            key={workspace.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            className="w-full md:w-[350px] shrink-0 snap-start"
                          >
                            <WorkspaceCard
                              name={workspace.name}
                              agents={workspace.agent_count}
                              members={workspace.member_count}
                              isSelecting={selectingWorkspace === workspace.id}
                              onOpen={() =>
                                handleWorkspaceSelect(
                                  workspace.id,
                                  workspace.name
                                )
                              }
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center py-12 rounded-3xl border border-dashed border-white/10 bg-white/5">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                          <Building2 className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          No workspaces yet
                        </h3>
                        <p className="text-slate-400">
                          Create your first workspace to get started.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Workspace Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        animationType="scale"
        type="overlay"
        disablePadding
        allowEasyClose={false}
        showEscText={false}
        className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl lg:max-w-5xl p-0 overflow-hidden bg-slate-900 border border-white/10 shadow-2xl shadow-black/50"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 w-full">
          {/* Left visual */}
          <div className="relative hidden md:flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-8 border-r border-white/5">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sky-500/10 to-sky-500/10 blur-3xl opacity-50" />

            <div className="relative z-10 w-full aspect-square max-w-[280px]">
              <Image
                src="/yetti/yetti_face.png"
                alt="Yetti"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>

            <div className="absolute bottom-8 left-0 w-full text-center px-8">
              <p className="text-sky-200/80 text-sm font-medium">
                &quot;Let&apos;s build something amazing together!&quot;
              </p>
            </div>
          </div>

          {/* Right form */}
          <div className="p-6 sm:p-8 md:p-10 bg-slate-900">
            <div className="mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                {currentStep === 1 && (
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500" />
                )}
                {currentStep === 2 && (
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500" />
                )}
                {currentStep === 3 && (
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500" />
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {currentStep === 1 && "Create Workspace"}
                {currentStep === 2 && "Add a Logo"}
                {currentStep === 3 && "Add Description"}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                {currentStep === 1 &&
                  "Give your new workspace a name to get started."}
                {currentStep === 2 &&
                  "Upload a logo to personalize your workspace (optional)."}
                {currentStep === 3 &&
                  "Add a description to help others understand your workspace (optional)."}
              </p>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <div className="flex items-center space-x-1 sm:space-x-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                        step <= currentStep
                          ? "bg-sky-500 text-white"
                          : "bg-white/10 text-slate-500"
                      }`}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-6 sm:w-8 h-0.5 mx-1 sm:mx-2 transition-all ${
                          step < currentStep ? "bg-sky-500" : "bg-white/10"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-6">
              <div className="space-y-4">
                {/* Step 1: Workspace Name */}
                {currentStep === 1 && (
                  <div>
                    <label
                      htmlFor="workspaceName"
                      className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2"
                    >
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      id="workspaceName"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="e.g., My Awesome Project"
                      required
                      minLength={3}
                      className="w-full px-4 py-3 sm:py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all outline-none text-base"
                    />
                  </div>
                )}

                {/* Step 2: Logo Upload */}
                {currentStep === 2 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                      Workspace Logo (Optional)
                    </label>
                    {!logoPreview ? (
                      <label
                        htmlFor="logoUpload"
                        className="group relative flex flex-col items-center justify-center w-full h-28 sm:h-32 rounded-xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-sky-500/50 transition-all cursor-pointer overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500 group-hover:text-sky-500 transition-colors mb-2" />
                        <p className="text-xs sm:text-sm text-slate-400 group-hover:text-slate-300 transition-colors text-center px-4">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PNG, JPG, SVG up to 5MB
                        </p>
                        <input
                          type="file"
                          id="logoUpload"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative w-full h-28 sm:h-32 rounded-xl border border-white/10 bg-white/5 overflow-hidden group">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-full h-full object-contain p-4"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Description */}
                {currentStep === 3 && (
                  <div>
                    <label
                      htmlFor="workspaceDescription"
                      className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2"
                    >
                      Description (Optional)
                    </label>
                    <textarea
                      id="workspaceDescription"
                      value={workspaceDescription}
                      onChange={(e) => setWorkspaceDescription(e.target.value)}
                      placeholder="What's this workspace for?"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all outline-none resize-none text-base"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {currentStep === 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="flex-1 h-12 bg-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handlePrevStep}
                    disabled={isSubmitting}
                    className="flex-1 h-12 bg-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                  >
                    Back
                  </Button>
                )}

                {currentStep === 3 ? (
                  <Button
                    type="submit"
                    disabled={isSubmitting || !workspaceName.trim()}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-sky-500 to-sky-500 hover:from-sky-500 hover:to-sky-500 text-white font-semibold shadow-lg shadow-sky-500/20"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                        Creating...
                      </span>
                    ) : (
                      "Create Workspace"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={
                      currentStep === 1 &&
                      (!workspaceName.trim() || workspaceName.length < 3)
                    }
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-sky-500 to-sky-500 hover:from-sky-500 hover:to-sky-500 text-white font-semibold shadow-lg shadow-sky-500/20"
                  >
                    Next
                  </Button>
                )}
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
