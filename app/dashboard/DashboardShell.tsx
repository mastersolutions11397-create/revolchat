"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { useCredits } from "@/lib/hooks/useCredits";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  BookOpen,
  Link2,
  Settings,
  Bell,
  Loader2,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Crown,
  Activity,
  Menu,
  X,
  Plus,
  Folders,
} from "lucide-react";
import { yettiOnboardingAPI } from "@/lib/api";
import WorkspaceOnboardingModal from "@/components/workspace/WorkspaceOnboardingModal";

function WorkspaceSelector() {
  // This component is handled by the main DashboardContent component
  // Keeping it here for backwards compatibility but functionality is in DashboardContent
  return null;
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { credits, loading: creditsLoading } = useCredits();
  const {
    selectedWorkspaceId,
    workspaces,
    selectWorkspace,
    fetchWorkspaces,
    createWorkspace,
    loading: workspaceLoading,
    error: workspaceError,
  } = useWorkspace();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [localWorkspaceSelection, setLocalWorkspaceSelection] =
    useState<string>(selectedWorkspaceId ?? "");
  const [switchingWorkspace, setSwitchingWorkspace] = useState(false);
  const [workspaceSwitchError, setWorkspaceSwitchError] = useState<
    string | null
  >(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [pendingWorkspace, setPendingWorkspace] = useState<{
    id: string;
    name?: string;
  } | null>(null);
  const previousWorkspaceIdRef = useRef<string | null>(selectedWorkspaceId);
  const [showNewWorkspaceModal, setShowNewWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  // Handle workspace selection from URL query params
  useEffect(() => {
    const ws = searchParams.get("ws");
    // Only select workspace from URL if it differs from currently selected one
    // and we're not already switching workspaces
    if (
      ws &&
      ws !== selectedWorkspaceId &&
      !switchingWorkspace &&
      workspaces.length > 0
    ) {
      // Verify the workspace exists in the list
      const workspaceExists = workspaces.some((w) => w.id === ws);
      if (workspaceExists) {
        const selectFromUrl = async () => {
          setSwitchingWorkspace(true);
          setWorkspaceSwitchError(null);
          try {
            await selectWorkspace(ws);

            // Check onboarding status
            const status = await yettiOnboardingAPI
              .getOnboardingStatus(ws)
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
              const selectedWorkspace = workspaces.find(
                (workspace) => workspace.id === ws
              );
              setPendingWorkspace({
                id: ws,
                name: selectedWorkspace?.name,
              });
              setShowOnboardingModal(true);
            } else {
              setPendingWorkspace(null);
              setShowOnboardingModal(false);
            }
          } catch (err: unknown) {
            console.error("Failed to select workspace from URL", err);
            setWorkspaceSwitchError(
              err instanceof Error
                ? err.message
                : "Unable to select workspace from URL."
            );
          } finally {
            setSwitchingWorkspace(false);
          }
        };

        selectFromUrl();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, selectedWorkspaceId, switchingWorkspace, workspaces]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => pathname === path;

  const buildLink = (path: string) => {
    let workspaceId = selectedWorkspaceId || searchParams.get("ws");
    if (!workspaceId && typeof window !== "undefined") {
      try {
        const val = localStorage.getItem("selectedWorkspaceId");
        if (val && val !== "undefined" && val !== "null") {
          workspaceId = val;
        }
      } catch {}
    }
    if (workspaceId) return `${path}?ws=${encodeURIComponent(workspaceId)}`;
    return path;
  };

  useEffect(() => {
    setLocalWorkspaceSelection(selectedWorkspaceId ?? "");
    previousWorkspaceIdRef.current = selectedWorkspaceId ?? null;
  }, [selectedWorkspaceId]);

  const handleWorkspaceChange = async (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const newWorkspaceId = event.target.value;
    const previousWorkspaceId = previousWorkspaceIdRef.current;

    setLocalWorkspaceSelection(newWorkspaceId);
    setWorkspaceSwitchError(null);

    if (!newWorkspaceId) {
      return;
    }

    setSwitchingWorkspace(true);
    try {
      await selectWorkspace(newWorkspaceId);

      // Update URL query parameter
      const params = new URLSearchParams(searchParams.toString());
      params.set("ws", newWorkspaceId);
      router.replace(`${pathname}?${params.toString()}`);

      const status = await yettiOnboardingAPI
        .getOnboardingStatus(newWorkspaceId)
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
        const selectedWorkspace = workspaces.find(
          (workspace) => workspace.id === newWorkspaceId
        );
        setPendingWorkspace({
          id: newWorkspaceId,
          name: selectedWorkspace?.name,
        });
        setShowOnboardingModal(true);
      } else {
        setPendingWorkspace(null);
        setShowOnboardingModal(false);
      }
      previousWorkspaceIdRef.current = newWorkspaceId;
    } catch (err: unknown) {
      console.error("Failed to switch workspace", err);
      setWorkspaceSwitchError(
        err instanceof Error
          ? err.message
          : "Unable to switch workspace. Please try again."
      );
      setLocalWorkspaceSelection(previousWorkspaceId ?? "");
      previousWorkspaceIdRef.current = previousWorkspaceId ?? null;
    } finally {
      setSwitchingWorkspace(false);
    }
  };

  const handleOnboardingModalClose = () => {
    setShowOnboardingModal(false);
    setPendingWorkspace(null);
  };

  const handleOnboardingCompleted = async () => {
    setShowOnboardingModal(false);
    setPendingWorkspace(null);
    setWorkspaceSwitchError(null);
    try {
      await fetchWorkspaces();
    } catch (err) {
      console.error("Failed to refresh workspaces after onboarding", err);
    }
  };

  const handleCreateNewWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newWorkspaceName.trim();
    if (!trimmedName || trimmedName.length < 3) {
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

      // Update URL with new workspace
      const params = new URLSearchParams(searchParams.toString());
      params.set("ws", workspace.id);
      router.replace(`${pathname}?${params.toString()}`);

      setShowNewWorkspaceModal(false);
      setNewWorkspaceName("");

      // Check onboarding status for newly created workspace
      const status = await yettiOnboardingAPI
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
    } catch (err) {
      console.error("Failed to create workspace:", err);
      setWorkspaceSwitchError(
        err instanceof Error ? err.message : "Failed to create workspace"
      );
    } finally {
      setCreatingWorkspace(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out shadow-sm ${
          // Mobile: always full width when open, hidden when closed
          mobileSidebarOpen ? "w-72 translate-x-0" : "-translate-x-full"
        } ${
          // Desktop: visible always, width based on expanded state
          sidebarExpanded
            ? "md:w-72 md:translate-x-0"
            : "md:w-20 md:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center border-b border-slate-100 px-3 md:px-6">
            {/* Expanded sidebar logo */}
            {(sidebarExpanded || mobileSidebarOpen) && (
              <Link
                href="/"
                className="flex items-center gap-3 transition-all duration-300"
              >
                <Image
                  src="/yetti/logo.png"
                  alt="Yetti Logo"
                  width={40}
                  height={40}
                  className="shrink-0"
                />
                <div className="text-2xl font-extrabold tracking-tight">
                  <span className="text-slate-900">Yetti</span>
                  <span className="text-sky-500">.ai</span>
                </div>
              </Link>
            )}

            {/* Collapsed sidebar logo - centered */}
            {!sidebarExpanded && !mobileSidebarOpen && (
              <Link
                href="/"
                className="flex items-center justify-center w-full"
              >
                <Image
                  src="/yetti/logo.png"
                  alt="Yetti Logo"
                  width={48}
                  height={48}
                  className="shrink-0"
                />
              </Link>
            )}

            {/* Mobile Close Button */}
            {mobileSidebarOpen && (
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="ml-auto p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-6">
            {[
              {
                href: "/dashboard",
                icon: LayoutDashboard,
                label: "Dashboard",
                tourId: null,
              },
              {
                href: "/workspace",
                icon: Folders,
                label: "Workspaces",
                tourId: null,
              },
              {
                href: "/dashboard/inbox",
                icon: MessageSquare,
                label: "Inbox",
                tourId: null,
              },
              {
                href: "/dashboard/knowledge-base",
                icon: BookOpen,
                label: "Knowledge Base",
                tourId: "knowledge-base-nav",
              },
              {
                href: "/dashboard/integrations",
                icon: Link2,
                label: "Integrations",
                tourId: "integrations-nav",
              },
              {
                href: "/dashboard/plans",
                icon: Crown,
                label: "Plans",
                tourId: null,
              },
              {
                href: "/dashboard/billing",
                icon: CreditCard,
                label: "Billing",
                tourId: null,
              },
              {
                href: "/dashboard/usage",
                icon: Activity,
                label: "Usage",
                tourId: null,
              },
              {
                href: "/dashboard/settings",
                icon: Settings,
                label: "Settings",
                tourId: "settings-nav",
              },
            ].map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={buildLink(item.href)}
                  onClick={() => setMobileSidebarOpen(false)}
                  data-tour={item.tourId || undefined}
                  className={`group flex items-center rounded-xl px-3 py-3 transition-all duration-200 ${
                    active
                      ? "bg-sky-50 text-sky-500 shadow-sm ring-1 ring-sky-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      active
                        ? "text-sky-500"
                        : "text-slate-400 group-hover:text-slate-600"
                    } ${sidebarExpanded || mobileSidebarOpen ? "mr-3" : "mx-auto"}`}
                  />
                  <span
                    className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                      sidebarExpanded || mobileSidebarOpen
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4 w-0 overflow-hidden"
                    }`}
                  >
                    {item.label}
                  </span>
                  {active && (sidebarExpanded || mobileSidebarOpen) && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-sky-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-slate-100 p-4 bg-slate-50/50">
            <div
              className={`flex items-center gap-3 ${!sidebarExpanded && !mobileSidebarOpen && "justify-center"}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-sky-500 text-sm font-bold text-white shadow-md shadow-sky-200">
                {
                  (user?.user_metadata?.first_name?.[0] ||
                    user?.email?.[0]?.toUpperCase() ||
                    "U") as string
                }
              </div>
              <div
                className={`min-w-0 transition-all duration-300 ${
                  sidebarExpanded || mobileSidebarOpen
                    ? "opacity-100 w-auto"
                    : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.user_metadata?.first_name &&
                  user?.user_metadata?.last_name
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                    : user?.email?.split("@")[0]}
                </p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              {(sidebarExpanded || mobileSidebarOpen) && (
                <button
                  onClick={handleSignOut}
                  className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white hover:text-red-500 hover:shadow-sm transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Toggle Button - Hidden as sidebar now opens on hover */}
        {/* <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="hidden md:flex absolute -right-3 top-24 h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm hover:text-sky-500 hover:border-sky-200 transition-all z-10"
        >
          {sidebarExpanded ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button> */}
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarExpanded ? "md:pl-72" : "md:pl-20"
        } pl-0`}
      >
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 flex h-16 md:h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-6 md:px-8 backdrop-blur-xl transition-all">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* Mobile Burger Menu */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Workspace Switcher */}
            <div className="relative group flex-1 min-w-0 max-w-64">
              <select
                id="dashboard-header-workspace-select"
                value={localWorkspaceSelection}
                onChange={handleWorkspaceChange}
                disabled={
                  switchingWorkspace ||
                  workspaceLoading ||
                  workspaces.length === 0
                }
                className="w-full appearance-none rounded-xl border-2 border-slate-100 bg-white py-2 sm:py-2.5 pl-3 sm:pl-4 pr-8 sm:pr-10 text-sm sm:text-base font-bold text-slate-900 transition-all hover:border-sky-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 min-w-0"
                aria-label="Select workspace"
              >
                {workspaces.length === 0 ? (
                  <option value="">
                    {workspaceLoading
                      ? "Loading workspaces..."
                      : "No workspaces available"}
                  </option>
                ) : (
                  workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name || "Untitled workspace"}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-sky-500 transition-colors">
                {switchingWorkspace || workspaceLoading ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 rotate-90" />
                )}
              </div>
            </div>

            {/* New Workspace Button */}
            <button
              onClick={() => setShowNewWorkspaceModal(true)}
              data-tour="create-workspace-button"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border-2 border-slate-100 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-900 transition-all hover:bg-sky-50 hover:border-sky-300 hover:shadow-sm"
              title="Create new workspace"
            >
              <Plus className="h-4 w-4" />
              <span>New Workspace</span>
            </button>

            {(workspaceSwitchError || workspaceError) && (
              <p className="hidden sm:block text-xs text-red-500 font-medium bg-red-50 px-3 py-1 rounded-full border border-red-100 whitespace-nowrap">
                {workspaceSwitchError || workspaceError}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Credits Button */}
            <Link
              href="/dashboard/billing"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border-2 border-slate-100 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-900 transition-all hover:bg-sky-100 hover:border-sky-300 hover:shadow-sm"
            >
              <CreditCard className="h-4 w-4" />
              {creditsLoading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <span>{credits.toLocaleString()} Credits</span>
              )}
            </Link>

            {/* Mobile Credits Icon */}
            <Link
              href="/dashboard/billing"
              className="sm:hidden p-2 rounded-xl border-2 border-slate-100 bg-white text-slate-600 transition-all hover:bg-sky-100 hover:border-sky-300 hover:text-sky-500"
              title="Credits"
            >
              <CreditCard className="h-5 w-5" />
            </Link>

            <div className="hidden sm:block h-8 w-px bg-slate-200" />

            {/* Discord Icon */}
            <Link
              href="https://discord.gg/hN8r5Tep"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#5865F2] text-white transition-all hover:bg-[#4752C4] hover:shadow-lg hover:scale-105"
              title="Join our Discord"
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </Link>

            <div className="hidden sm:block h-8 w-px bg-slate-200" />

            <button
              className="relative rounded-xl p-2 sm:p-2.5 text-slate-500 transition-all hover:bg-sky-50 hover:text-sky-500"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 h-2 w-2 rounded-full bg-sky-500 ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 md:p-8 animate-fade-in-up">{children}</main>

        {/* Mobile Error Message */}
        {(workspaceSwitchError || workspaceError) && (
          <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 shadow-lg">
              <p className="text-xs text-red-500 font-medium text-center">
                {workspaceSwitchError || workspaceError}
              </p>
            </div>
          </div>
        )}

        <WorkspaceOnboardingModal
          isOpen={showOnboardingModal}
          workspaceId={pendingWorkspace?.id ?? null}
          workspaceName={pendingWorkspace?.name}
          onClose={handleOnboardingModalClose}
          onCompleted={handleOnboardingCompleted}
        />

        {/* New Workspace Modal */}
        {showNewWorkspaceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
              {/* Header */}
              <div className="relative p-6 pb-4 bg-linear-to-br from-sky-50 to-white border-b border-slate-100">
                <button
                  onClick={() => {
                    setShowNewWorkspaceModal(false);
                    setNewWorkspaceName("");
                  }}
                  className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:bg-white hover:text-slate-900 transition-all hover:shadow-sm"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Create New Workspace
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Set up a fresh space for your projects
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateNewWorkspace} className="p-6">
                <div className="mb-6">
                  <label
                    htmlFor="workspace-name"
                    className="block text-sm font-bold text-slate-700 mb-2.5"
                  >
                    Workspace Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="workspace-name"
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="e.g., My Awesome Project"
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all hover:border-sky-300 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 text-base"
                    minLength={3}
                    required
                    autoFocus
                  />
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <div
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
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
                        ? "✓ Looks good!"
                        : "Minimum 3 characters required"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewWorkspaceModal(false);
                      setNewWorkspaceName("");
                    }}
                    className="flex-1 px-5 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      creatingWorkspace || newWorkspaceName.trim().length < 3
                    }
                    className="flex-1 px-5 py-3.5 rounded-xl bg-linear-to-r from-sky-500 to-sky-600 text-white font-bold shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {creatingWorkspace ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 shrink-0" />
                        <span>Create Workspace</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      }
    >
      <WorkspaceSelector />
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
