"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/contexts/WorkspaceContext";
import { useOnboardingTour } from "@/lib/contexts/OnboardingTourContext";
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
  MessageSquare,
  Crown,
  Activity,
  Menu,
  X,
  Plus,
  Pencil,
  Check,
  ChevronDown,
} from "lucide-react";
import { yettiOnboardingAPI } from "@/lib/api";
import WorkspaceOnboardingModal from "@/components/workspace/WorkspaceOnboardingModal";
import { supabase } from "@/lib/supabase";

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
  const {
    tourActive,
    tourStatus,
    onNavigateToKnowledgeBase,
    onNavigateToIntegrations,
    onNavigateToSettings,
  } = useOnboardingTour();
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
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [editingWorkspaceName, setEditingWorkspaceName] = useState("");
  const [updatingWorkspace, setUpdatingWorkspace] = useState(false);
  const workspaceDropdownRef = useRef<HTMLDivElement>(null);

  // Handle workspace selection from URL query params
  useEffect(() => {
    const ws = searchParams.get("ws");
    // Only select workspace from URL if it differs from currently selected one
    // and we're not already switching workspaces
    if (
      ws &&
      ws !== "undefined" &&
      ws !== "null" &&
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
                console.error("Failed to fetch Yetti onboarding status:", err);
                if (
                  err instanceof Error &&
                  (err.message.includes("404") ||
                    err.message.toLowerCase().includes("not found"))
                ) {
                  return null;
                }
                // Don't throw on onboarding status errors - just log and continue
                return null;
              });

            // Don't show workspace onboarding modal if tour is active or completed
            if (!status || !status.is_onboarded) {
              if (
                !tourActive &&
                tourStatus !== "in_progress" &&
                tourStatus !== "completed"
              ) {
                const selectedWorkspace = workspaces.find(
                  (workspace) => workspace.id === ws
                );
                setPendingWorkspace({
                  id: ws,
                  name: selectedWorkspace?.name,
                });
                setShowOnboardingModal(true);
              }
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

  // Collapse sidebar when tour becomes active or in progress
  useEffect(() => {
    if (tourActive || tourStatus === "in_progress") {
      setSidebarExpanded(false);
    }
  }, [tourActive, tourStatus]);

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

  // Close workspace dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        workspaceDropdownRef.current &&
        !workspaceDropdownRef.current.contains(event.target as Node)
      ) {
        setWorkspaceDropdownOpen(false);
        setEditingWorkspaceId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => pathname === path;

  // Handle navigation link clicks for onboarding tour
  const handleNavClick = (href: string) => {
    console.log("Navigation clicked:", href, { tourActive });
    if (tourActive) {
      // Trigger appropriate onboarding callback based on destination
      if (href === "/dashboard/knowledge-base") {
        console.log("Triggering Knowledge Base callback");
        onNavigateToKnowledgeBase();
      } else if (href === "/dashboard/integrations") {
        console.log("Triggering Integrations callback");
        onNavigateToIntegrations();
      } else if (href === "/dashboard/settings") {
        console.log("Triggering Settings callback");
        onNavigateToSettings();
      }
    }
    // Close mobile sidebar after navigation
    setMobileSidebarOpen(false);
  };

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

    if (!newWorkspaceId || newWorkspaceId === "undefined") {
      console.error("Invalid workspace ID:", newWorkspaceId);
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
          console.error("Failed to fetch Yetti onboarding status:", err);
          if (
            err instanceof Error &&
            (err.message.includes("404") ||
              err.message.toLowerCase().includes("not found"))
          ) {
            return null;
          }
          // Don't throw on onboarding status errors - just log and continue
          return null;
        });

      // Don't show workspace onboarding modal if tour is active or completed
      if (!status || !status.is_onboarded) {
        if (
          !tourActive &&
          tourStatus !== "in_progress" &&
          tourStatus !== "completed"
        ) {
          const selectedWorkspace = workspaces.find(
            (workspace) => workspace.id === newWorkspaceId
          );
          setPendingWorkspace({
            id: newWorkspaceId,
            name: selectedWorkspace?.name,
          });
          setShowOnboardingModal(true);
        }
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

  const handleUpdateWorkspaceName = async (workspaceId: string) => {
    const trimmedName = editingWorkspaceName.trim();
    if (!trimmedName || trimmedName.length < 3) {
      setEditingWorkspaceId(null);
      return;
    }

    setUpdatingWorkspace(true);
    try {
      const { error } = await supabase
        .from("yetti_workspaces")
        .update({ name: trimmedName })
        .eq("id", workspaceId);

      if (error) {
        throw error;
      }

      // Refresh workspaces list
      await fetchWorkspaces();
      setEditingWorkspaceId(null);
      setEditingWorkspaceName("");
    } catch (err) {
      console.error("Failed to update workspace name:", err);
      setWorkspaceSwitchError(
        err instanceof Error ? err.message : "Failed to update workspace name"
      );
    } finally {
      setUpdatingWorkspace(false);
    }
  };

  const handleStartEdit = (workspaceId: string, currentName: string) => {
    setEditingWorkspaceId(workspaceId);
    setEditingWorkspaceName(currentName);
  };

  const handleCancelEdit = () => {
    setEditingWorkspaceId(null);
    setEditingWorkspaceName("");
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

      // Validate workspace ID exists
      if (!workspace || !workspace.id) {
        throw new Error(
          "Failed to create workspace: Invalid workspace data returned"
        );
      }

      console.log("Created workspace:", workspace);

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
          console.error("Failed to fetch Yetti onboarding status:", err);
          if (
            err instanceof Error &&
            (err.message.includes("404") ||
              err.message.toLowerCase().includes("not found"))
          ) {
            return null;
          }
          // Don't throw on onboarding status errors - just log and continue
          return null;
        });

      // Don't show workspace onboarding modal if tour is active or completed
      if (!status || !status.is_onboarded) {
        if (
          !tourActive &&
          tourStatus !== "in_progress" &&
          tourStatus !== "completed"
        ) {
          setPendingWorkspace({
            id: workspace.id,
            name: workspace.name,
          });
          setShowOnboardingModal(true);
        }
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
        onMouseEnter={() => {
          // Don't expand sidebar if tour is active or in progress
          if (!tourActive && tourStatus !== "in_progress") {
            setSidebarExpanded(true);
          }
        }}
        onMouseLeave={() => {
          // Always collapse on mouse leave
          setSidebarExpanded(false);
        }}
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
                tourId: "plans-nav",
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
                  onClick={() => handleNavClick(item.href)}
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
        <header className="sticky top-0 z-40 flex h-14 sm:h-16 md:h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-3 sm:px-4 md:px-6 lg:px-8 backdrop-blur-xl transition-all gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
            {/* Mobile Burger Menu */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Workspace Switcher */}
            <div
              ref={workspaceDropdownRef}
              className="relative flex-1 min-w-0 max-w-full sm:max-w-64"
            >
              <button
                type="button"
                onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                disabled={
                  switchingWorkspace ||
                  workspaceLoading ||
                  workspaces.length === 0
                }
                className="w-full flex items-center justify-between rounded-lg sm:rounded-xl border-2 border-slate-100 bg-white py-1.5 sm:py-2 md:py-2.5 pl-2 sm:pl-3 md:pl-4 pr-2 sm:pr-3 md:pr-4 text-xs sm:text-sm md:text-base font-bold text-slate-900 transition-all hover:border-sky-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 min-w-0"
                aria-label="Select workspace"
                aria-haspopup="listbox"
                aria-expanded={workspaceDropdownOpen}
              >
                <span className="truncate flex-1 text-left">
                  {workspaces.length === 0
                    ? workspaceLoading
                      ? "Loading..."
                      : "No workspaces"
                    : workspaces.find((w) => w.id === localWorkspaceSelection)
                        ?.name || "Select workspace"}
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                  {switchingWorkspace || workspaceLoading ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 animate-spin text-slate-400" />
                  ) : (
                    <ChevronDown
                      className={`h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-slate-400 transition-transform ${
                        workspaceDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {workspaceDropdownOpen && workspaces.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 sm:mt-2 z-50 bg-white rounded-xl border-2 border-slate-200 shadow-xl shadow-slate-900/10 overflow-hidden">
                  <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                    {workspaces.map((workspace) => {
                      const isSelected = workspace.id === localWorkspaceSelection;
                      const isEditing = editingWorkspaceId === workspace.id;

                      return (
                        <div
                          key={workspace.id}
                          className={`group relative ${
                            isSelected
                              ? "bg-sky-50 border-l-4 border-sky-500"
                              : "hover:bg-slate-50"
                          } transition-colors`}
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-2 p-3 sm:p-4">
                              <input
                                type="text"
                                value={editingWorkspaceName}
                                onChange={(e) =>
                                  setEditingWorkspaceName(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleUpdateWorkspaceName(workspace.id);
                                  } else if (e.key === "Escape") {
                                    handleCancelEdit();
                                  }
                                }}
                                autoFocus
                                className="flex-1 min-w-0 max-w-[calc(100%-120px)] px-3 py-2 rounded-lg border-2 border-sky-300 bg-white text-sm font-medium text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/10"
                                disabled={updatingWorkspace}
                              />
                              <button
                                onClick={() =>
                                  handleUpdateWorkspaceName(workspace.id)
                                }
                                disabled={
                                  updatingWorkspace ||
                                  editingWorkspaceName.trim().length < 3
                                }
                                className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Save"
                              >
                                {updatingWorkspace ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={updatingWorkspace}
                                className="p-2 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors disabled:opacity-50"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
                              <button
                                onClick={() => {
                                  if (workspace.id !== localWorkspaceSelection) {
                                    handleWorkspaceChange({
                                      target: {
                                        value: workspace.id,
                                      },
                                    } as ChangeEvent<HTMLSelectElement>);
                                  }
                                  setWorkspaceDropdownOpen(false);
                                }}
                                className={`flex-1 text-left ${
                                  isSelected
                                    ? "text-sky-600 font-bold"
                                    : "text-slate-700 font-medium"
                                } text-xs sm:text-sm transition-colors`}
                              >
                                <span className="block truncate">
                                  {workspace.name || "Untitled workspace"}
                                </span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(
                                    workspace.id,
                                    workspace.name || "Untitled workspace"
                                  );
                                }}
                                className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all opacity-0 group-hover:opacity-100"
                                title="Edit workspace name"
                              >
                                <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </button>
                              {isSelected && (
                                <div className="h-2 w-2 rounded-full bg-sky-500 shrink-0" />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* New Workspace Button */}
            <button
              onClick={() => setShowNewWorkspaceModal(true)}
              data-tour="create-workspace-button"
              className="hidden sm:inline-flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border-2 border-slate-100 bg-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm font-bold text-slate-900 transition-all hover:bg-sky-50 hover:border-sky-300 hover:shadow-sm shrink-0"
              title="Create new workspace"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden md:inline">New Workspace</span>
            </button>

            {(workspaceSwitchError || workspaceError) && (
              <p className="hidden lg:block text-xs text-red-500 font-medium bg-red-50 px-2 sm:px-3 py-1 rounded-full border border-red-100 whitespace-nowrap shrink-0">
                {workspaceSwitchError || workspaceError}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
            {/* Credits Button */}
            <Link
              href="/dashboard/billing"
              data-tour="credits-button"
              className="hidden md:inline-flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border-2 border-slate-100 bg-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm font-bold text-slate-900 transition-all hover:bg-sky-100 hover:border-sky-300 hover:shadow-sm"
            >
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
              {creditsLoading ? (
                <Skeleton className="h-3 w-12 sm:h-4 sm:w-16" />
              ) : (
                <span className="hidden lg:inline">
                  {credits.toLocaleString()} Credits
                </span>
              )}
            </Link>

            {/* Mobile Credits Icon */}
            <Link
              href="/dashboard/billing"
              className="md:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl border-2 border-slate-100 bg-white text-slate-600 transition-all hover:bg-sky-100 hover:border-sky-300 hover:text-sky-500 shrink-0"
              title="Credits"
            >
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>

            <div className="hidden sm:block h-6 sm:h-8 w-px bg-slate-200" />

            {/* Discord Icon */}
            <Link
              href="https://discord.gg/hN8r5Tep"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-[#5865F2] text-white transition-all hover:bg-[#4752C4] hover:shadow-lg hover:scale-105 shrink-0"
              title="Join our Discord"
            >
              <svg
                className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </Link>

            <div className="hidden sm:block h-6 sm:h-8 w-px bg-slate-200" />

            <button
              className="relative rounded-lg sm:rounded-xl p-1.5 sm:p-2 md:p-2.5 text-slate-500 transition-all hover:bg-sky-50 hover:text-sky-500 shrink-0"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute top-1 sm:top-1.5 md:top-2 right-1 sm:right-1.5 md:right-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-sky-500 ring-1 sm:ring-2 ring-white" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 animate-fade-in">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in-up">
              {/* Header */}
              <div className="relative p-4 sm:p-6 pb-3 sm:pb-4 bg-linear-to-br from-sky-50 to-white border-b border-slate-100">
                <button
                  onClick={() => {
                    setShowNewWorkspaceModal(false);
                    setNewWorkspaceName("");
                  }}
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 rounded-lg text-slate-400 hover:bg-white hover:text-slate-900 transition-all hover:shadow-sm"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <div className="flex items-center gap-2 sm:gap-3 pr-8 sm:pr-12">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/30 shrink-0">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                      Create New Workspace
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Set up a fresh space for your projects
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateNewWorkspace} className="p-4 sm:p-6">
                <div className="mb-4 sm:mb-6">
                  <label
                    htmlFor="workspace-name"
                    className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 sm:mb-2.5"
                  >
                    Workspace Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="workspace-name"
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="e.g., My Awesome Project"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all hover:border-sky-300 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 text-sm sm:text-base"
                    minLength={3}
                    required
                    autoFocus
                  />
                  <div className="flex items-center gap-1.5 mt-2 sm:mt-2.5">
                    <div
                      className={`h-1.5 w-1.5 rounded-full transition-colors shrink-0 ${
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
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewWorkspaceModal(false);
                      setNewWorkspaceName("");
                    }}
                    className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      creatingWorkspace || newWorkspaceName.trim().length < 3
                    }
                    className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl bg-linear-to-r from-sky-500 to-sky-600 text-white font-bold shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 text-sm sm:text-base"
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
